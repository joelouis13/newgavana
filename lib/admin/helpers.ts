import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "@/lib/env";
import { slugify } from "@/lib/format";

/** Returns `base`, or `base-2`, `base-3`… whichever is free in `table`. */
export async function uniqueSlug(
  supabase: SupabaseClient,
  table: "products" | "categories",
  source: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(source) || "item";
  let q = supabase.from(table).select("slug").like("slug", `${base}%`);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  const taken = new Set((data ?? []).map((r) => r.slug as string));
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export async function removeStorageFiles(supabase: SupabaseClient, paths: (string | null | undefined)[]) {
  const clean = paths.filter((p): p is string => Boolean(p));
  if (clean.length === 0) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(clean);
  if (error) console.error("[admin] could not remove storage files", error);
}

/** Storefront pages are statically cached; purge them after any catalogue change. */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message);
    if (msg.includes("duplicate key") && msg.includes("sku")) return "Another product already uses this SKU.";
    if (msg.includes("duplicate key") && msg.includes("slug")) return "That URL slug is already in use.";
    if (msg.includes("compare_at_price")) return "The original price must be higher than the selling price.";
    if (msg === "Not authorised") return "Your session has expired. Please sign in again.";
    return msg || fallback;
  }
  return fallback;
}
