import type { Metadata } from "next";
import { ProductListing } from "@/components/product/product-listing";
import { getActiveCategories, getStoreSettings } from "@/lib/data/storefront";

export const metadata: Metadata = {
  title: "Best Sellers",
  description: "Our customers' favourite pieces. Order on WhatsApp.",
  alternates: { canonical: "/best-sellers" },
};

export default async function BestSellersPage({ searchParams }: PageProps<"/best-sellers">) {
  const [sp, settings, categories] = await Promise.all([searchParams, getStoreSettings(), getActiveCategories()]);
  return (
    <ProductListing
      title="Best Sellers"
      eyebrow="Customer favourites"
      description="The pieces everyone keeps coming back for."
      basePath="/best-sellers"
      searchParams={sp}
      categories={categories}
      fixedCollection="best"
      currency={settings.currency}
    />
  );
}
