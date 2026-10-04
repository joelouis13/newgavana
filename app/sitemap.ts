import type { MetadataRoute } from "next";
import { getActiveCategories, getAllProductSlugs } from "@/lib/data/storefront";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProductSlugs(), getActiveCategories()]);
  const staticPages = ["", "/shop", "/categories", "/new-arrivals", "/best-sellers", "/about", "/contact"];

  return [
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p}`,
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: c.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
