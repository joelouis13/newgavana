import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/product/product-listing";
import { getActiveCategories, getCategoryBySlug, getStoreSettings } from "@/lib/data/storefront";

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at New Gavana. Order on WhatsApp.`,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: category.image_url ? { images: [{ url: category.image_url }] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [category, settings, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getStoreSettings(),
    getActiveCategories(),
  ]);
  if (!category) notFound();

  return (
    <ProductListing
      title={category.name}
      eyebrow="Category"
      description={category.description}
      basePath={`/category/${category.slug}`}
      searchParams={sp}
      categories={categories}
      fixedCategory={category}
      currency={settings.currency}
    />
  );
}
