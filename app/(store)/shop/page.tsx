import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { getActiveCategories, getStoreSettings } from "@/lib/data/storefront";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { q } = await searchParams;
  const term = Array.isArray(q) ? q[0] : q;
  return {
    title: term ? `Search: ${term}` : "Shop All Products",
    description: "Browse corsets, lingerie, bags, accessories and more. Order easily on WhatsApp.",
    alternates: { canonical: "/shop" },
    robots: term ? { index: false } : undefined,
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const [sp, settings, categories] = await Promise.all([searchParams, getStoreSettings(), getActiveCategories()]);
  return (
    <ProductListing
      title="Shop"
      eyebrow="The collection"
      description="Everything in store — pick your favourites and order on WhatsApp."
      basePath="/shop"
      searchParams={sp}
      categories={categories}
      currency={settings.currency}
    />
  );
}
