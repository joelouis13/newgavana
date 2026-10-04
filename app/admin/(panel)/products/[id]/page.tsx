import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/admin/auth";
import type { Category, ProductDetail } from "@/lib/types";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdminPage();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug), images:product_images(*)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("display_order").order("name"),
  ]);
  if (!product) notFound();

  const detail = product as ProductDetail;
  detail.images = [...(detail.images ?? [])].sort((a, b) => a.display_order - b.display_order);

  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-block text-sm text-muted hover:text-navy-900">← Products</Link>
      <AdminPageHeader
        title={detail.name}
        description={detail.deleted_at ? "This product is archived. Restore it from the Archived tab to sell it again." : undefined}
      />
      <ProductForm key={detail.updated_at} product={detail} categories={(categories ?? []) as Category[]} />
    </>
  );
}
