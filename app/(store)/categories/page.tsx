import type { Metadata } from "next";
import Link from "next/link";
import { CategoryTile } from "@/components/category/category-tile";
import { getActiveCategories } from "@/lib/data/storefront";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse every category — corsets, lingerie, bags, gym wear and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();
  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
        <Link href="/" className="hover:text-coral-600">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-navy-900">Categories</span>
      </nav>
      <p className="eyebrow mb-2">Browse</p>
      <h1 className="font-display text-4xl text-navy-900 sm:text-5xl">All Categories</h1>
      <p className="mt-3 max-w-2xl text-muted">Find exactly what you&apos;re looking for.</p>

      {categories.length === 0 ? (
        <p className="mt-12 rounded-3xl border border-dashed border-sand-300 p-12 text-center text-muted">
          Categories are coming soon.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <div key={c.id}>
              <CategoryTile category={c} index={i} />
              {c.description && <p className="mt-1 text-center text-xs text-muted">{c.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
