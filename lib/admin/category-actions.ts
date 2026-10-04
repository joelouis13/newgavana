"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { errorMessage, removeStorageFiles, revalidateStorefront, uniqueSlug } from "@/lib/admin/helpers";
import type { ActionResult } from "@/lib/types";

export type CategoryInput = {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  display_order: number;
};

export async function saveCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  const fieldErrors: Record<string, string> = {};
  if (!input.name?.trim()) fieldErrors.name = "Category name is required.";
  else if (input.name.trim().length > 80) fieldErrors.name = "Keep the name under 80 characters.";
  if (!Number.isInteger(input.display_order)) fieldErrors.display_order = "Use a whole number.";
  if (input.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug))
    fieldErrors.slug = "Use lowercase letters, numbers and hyphens only.";
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const { supabase } = await requireAdminAction();
    const slug = await uniqueSlug(supabase, "categories", input.slug || input.name, input.id);
    const row = {
      name: input.name.trim(),
      slug,
      description: input.description.trim() || null,
      image_url: input.image_url,
      image_path: input.image_path,
      is_active: input.is_active,
      display_order: input.display_order,
    };

    let id = input.id;
    if (id) {
      const { data: before } = await supabase.from("categories").select("image_path").eq("id", id).single();
      const { error } = await supabase.from("categories").update(row).eq("id", id);
      if (error) throw error;
      if (before?.image_path && before.image_path !== input.image_path) {
        await removeStorageFiles(supabase, [before.image_path]);
      }
    } else {
      const { data, error } = await supabase.from("categories").insert(row).select("id").single();
      if (error) throw error;
      id = data.id as string;
    }

    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true, data: { id: id! } };
  } catch (err) {
    console.error("[admin] saveCategory", err);
    return { ok: false, error: errorMessage(err) };
  }
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase.from("categories").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Products in the category are kept and become "uncategorised". */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { data: cat } = await supabase.from("categories").select("image_path").eq("id", id).single();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    await removeStorageFiles(supabase, [cat?.image_path]);
    revalidateStorefront();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
