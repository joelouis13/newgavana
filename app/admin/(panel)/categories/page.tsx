import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdminPage } from "@/lib/admin/auth";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdminPage();
  const [{ data: categories, error }, { data: counts }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order").order("name"),
    supabase.from("products").select("category_id").is("deleted_at", null).limit(10000),
  ]);

  const productCounts: Record<string, number> = {};
  for (const row of counts ?? []) {
    if (row.category_id) productCounts[row.category_id] = (productCounts[row.category_id] ?? 0) + 1;
  }

  return (
    <>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Could not load categories: {error.message}</p>}
      <CategoryManager categories={(categories ?? []) as Category[]} productCounts={productCounts} />
    </>
  );
}
