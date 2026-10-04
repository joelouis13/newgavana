"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { errorMessage, removeStorageFiles, revalidateStorefront, uniqueSlug } from "@/lib/admin/helpers";
import type { ActionResult } from "@/lib/types";

export type ProductImageInput = {
  id?: string;
  image_url: string;
  storage_path: string | null;
  is_primary: boolean;
};

export type ProductInput = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  sku: string;
  stock_quantity: number;
  sizes: string[];
  colors: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  images: ProductImageInput[];
};

function validate(input: ProductInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!input.name?.trim()) e.name = "Product name is required.";
  else if (input.name.trim().length > 160) e.name = "Keep the name under 160 characters.";
  if (!Number.isFinite(input.price) || input.price < 0) e.price = "Enter a valid price.";
  if (input.compare_at_price != null) {
    if (!Number.isFinite(input.compare_at_price) || input.compare_at_price <= input.price)
      e.compare_at_price = "Original price must be higher than the selling price.";
  }
  if (!Number.isInteger(input.stock_quantity) || input.stock_quantity < 0)
    e.stock_quantity = "Stock must be a whole number (0 or more).";
  if (input.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug))
    e.slug = "Use lowercase letters, numbers and hyphens only.";
  if (input.images.length > 12) e.images = "Up to 12 images per product.";
  if (input.sizes.some((s) => s.length > 40) || input.colors.some((c) => c.length > 40))
    e.sizes = "Each size/colour must be under 40 characters.";
  return e;
}

export async function saveProduct(input: ProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const { supabase } = await requireAdminAction();
    const slug = await uniqueSlug(supabase, "products", input.slug ? input.slug : input.name, input.id);
    const primary = input.images.find((i) => i.is_primary) ?? input.images[0] ?? null;

    const row = {
      name: input.name.trim(),
      slug,
      description: input.description.trim() || null,
      price: Math.round(input.price * 100) / 100,
      compare_at_price: input.compare_at_price,
      category_id: input.category_id || null,
      sku: input.sku.trim() || null,
      stock_quantity: input.stock_quantity,
      sizes: input.sizes,
      colors: input.colors,
      primary_image: primary?.image_url ?? null,
      is_active: input.is_active,
      is_featured: input.is_featured,
      is_new_arrival: input.is_new_arrival,
      is_best_seller: input.is_best_seller,
    };

    let productId = input.id;
    if (productId) {
      const { error } = await supabase.from("products").update(row).eq("id", productId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("products").insert(row).select("id").single();
      if (error) throw error;
      productId = data.id as string;
    }

    // --- Sync images -------------------------------------------------------
    const { data: existing, error: imgErr } = await supabase
      .from("product_images")
      .select("id, storage_path")
      .eq("product_id", productId);
    if (imgErr) throw imgErr;

    const keepIds = new Set(input.images.filter((i) => i.id).map((i) => i.id));
    const removed = (existing ?? []).filter((img) => !keepIds.has(img.id));
    if (removed.length) {
      const { error } = await supabase.from("product_images").delete().in("id", removed.map((r) => r.id));
      if (error) throw error;
      await removeStorageFiles(supabase, removed.map((r) => r.storage_path));
    }

    // Clear primary first so the one-primary-per-product index never conflicts.
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);

    for (const [index, img] of input.images.entries()) {
      const values = { display_order: index, is_primary: false };
      if (img.id) {
        const { error } = await supabase.from("product_images").update(values).eq("id", img.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("product_images")
          .insert({ ...values, product_id: productId, image_url: img.image_url, storage_path: img.storage_path })
          .select("id")
          .single();
        if (error) throw error;
        img.id = data.id;
      }
    }
    const primaryId = (input.images.find((i) => i.is_primary) ?? input.images[0])?.id;
    if (primaryId) {
      const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", primaryId);
      if (error) throw error;
    }

    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true, data: { id: productId, slug } };
  } catch (err) {
    console.error("[admin] saveProduct", err);
    return { ok: false, error: errorMessage(err) };
  }
}

type Flag = "is_active" | "is_featured" | "is_new_arrival" | "is_best_seller";
const FLAGS = new Set<Flag>(["is_active", "is_featured", "is_new_arrival", "is_best_seller"]);

export async function setProductFlag(id: string, flag: Flag, value: boolean): Promise<ActionResult> {
  if (!FLAGS.has(flag)) return { ok: false, error: "Unknown field." };
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase.from("products").update({ [flag]: value }).eq("id", id);
    if (error) throw error;
    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Soft delete: hides the product everywhere but keeps it restorable. */
export async function archiveProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", id);
    if (error) throw error;
    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export async function restoreProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase.from("products").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Permanent delete â€” only offered for archived products. Order history keeps its snapshots. */
export async function deleteProductPermanently(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id).not("deleted_at", "is", null);
    if (error) throw error;
    await removeStorageFiles(supabase, (images ?? []).map((i) => i.storage_path));
    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
