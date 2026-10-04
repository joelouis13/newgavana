import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  ProductDetail,
  ProductWithCategory,
  StoreSettings,
} from "@/lib/types";

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "New Gavana",
  tagline: "Convenience Shopping",
  store_description:
    "Curated fashion, shapewear, lingerie, bags and lifestyle pieces for the modern woman — ordered in minutes on WhatsApp.",
  whatsapp_number: null,
  contact_phone: null,
  contact_email: null,
  address: null,
  logo_url: null,
  currency: "GHS",
  social_links: {},
  hero_title: "Elegance, delivered to your door.",
  hero_subtitle:
    "Corsets, lingerie, bags and everyday luxuries chosen for you. Browse, pick your favourites and order directly on WhatsApp.",
  announcement_text: "No online payment needed — order on WhatsApp and pay when we confirm.",
  about_text: null,
  updated_at: new Date(0).toISOString(),
};

function logError(scope: string, error: unknown) {
  console.error(`[storefront:${scope}]`, error);
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await createPublicClient()
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) logError("settings", error);
  return data ? { ...DEFAULT_SETTINGS, ...data, social_links: data.social_links ?? {} } : DEFAULT_SETTINGS;
});

export const getActiveCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("name");
  if (error) logError("categories", error);
  return data ?? [];
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const categories = await getActiveCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";
export type ProductCollection = "new" | "best" | "featured" | "offers";

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

export type ProductQuery = {
  q?: string;
  categoryId?: string;
  collection?: ProductCollection;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  excludeId?: string;
};

export type ProductPage = {
  products: ProductWithCategory[];
  total: number;
  page: number;
  pageCount: number;
};

/** Strips characters that have meaning inside PostgREST filter strings. */
function sanitizeSearch(q: string): string {
  return q.replace(/[%_,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const pageSize = query.pageSize ?? 24;
  const page = Math.max(1, query.page ?? 1);
  const empty = { products: [], total: 0, page, pageCount: 0 };
  if (!isSupabaseConfigured) return empty;

  const supabase = createPublicClient();
  let req = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true)
    .is("deleted_at", null);

  if (query.categoryId) req = req.eq("category_id", query.categoryId);
  if (query.excludeId) req = req.neq("id", query.excludeId);

  switch (query.collection) {
    case "new":
      req = req.eq("is_new_arrival", true);
      break;
    case "best":
      req = req.eq("is_best_seller", true);
      break;
    case "featured":
      req = req.eq("is_featured", true);
      break;
    case "offers":
      req = req.not("compare_at_price", "is", null);
      break;
  }

  const term = query.q ? sanitizeSearch(query.q) : "";
  if (term) {
    const categories = await getActiveCategories();
    const lower = term.toLowerCase();
    const matchingCategoryIds = categories
      .filter((c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()))
      .map((c) => c.id);
    const pattern = `%${term.replace(/ /g, "%")}%`;
    const filters = [
      `name.ilike.${pattern}`,
      `description.ilike.${pattern}`,
      `sku.ilike.${pattern}`,
    ];
    if (matchingCategoryIds.length) filters.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    req = req.or(filters.join(","));
  }

  switch (query.sort ?? "newest") {
    case "price-asc":
      req = req.order("price", { ascending: true });
      break;
    case "price-desc":
      req = req.order("price", { ascending: false });
      break;
    case "name":
      req = req.order("name", { ascending: true });
      break;
    default:
      req = req.order("created_at", { ascending: false });
  }
  req = req.order("id");

  const from = (page - 1) * pageSize;
  const { data, error, count } = await req.range(from, from + pageSize - 1);
  if (error) {
    logError("products", error);
    return empty;
  }
  const total = count ?? 0;
  return {
    products: (data ?? []) as ProductWithCategory[],
    total,
    page,
    pageCount: Math.ceil(total / pageSize),
  };
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await createPublicClient()
    .from("products")
    .select(`${PRODUCT_SELECT}, images:product_images(*)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    logError("product", error);
    throw new Error("Could not load this product. Please try again.");
  }
  if (!data) return null;
  const product = data as ProductDetail;
  product.images = [...(product.images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
  );
  return product;
});

/** Slugs for sitemap generation. */
export async function getAllProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) logError("slugs", error);
  return data ?? [];
}
