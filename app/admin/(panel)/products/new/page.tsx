import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/admin/auth";
import type { Category } from "@/lib/types";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("categories").select("*").order("display_order").order("name");
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-block text-sm text-muted hover:text-navy-900">← Products</Link>
      <AdminPageHeader title="Add product" />
      <ProductForm categories={(data ?? []) as Category[]} />
    </>
  );
}
