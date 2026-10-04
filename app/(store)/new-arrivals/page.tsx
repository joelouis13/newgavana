import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { getActiveCategories, getStoreSettings } from "@/lib/data/storefront";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest pieces to land in store. Order on WhatsApp.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage({ searchParams }: PageProps<"/new-arrivals">) {
  const [sp, settings, categories] = await Promise.all([searchParams, getStoreSettings(), getActiveCategories()]);
  return (
    <ProductListing
      title="New Arrivals"
      eyebrow="Just landed"
      description="Fresh pieces, just added to the store."
      basePath="/new-arrivals"
      searchParams={sp}
      categories={categories}
      fixedCollection="new"
      currency={settings.currency}
    />
  );
}
