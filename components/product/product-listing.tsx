import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";
import { ListingToolbar } from "@/components/product/listing-toolbar";
import { ProductGrid } from "@/components/product/product-card";
import {
  getProducts,
  SORT_OPTIONS,
  type ProductCollection,
  type ProductSort,
} from "@/lib/data/storefront";
import type { Category } from "@/lib/types";

export type ListingSearchParams = Record<string, string | string[] | undefined>;

const SORTS = new Set(SORT_OPTIONS.map((o) => o.value));
const COLLECTIONS = new Set<ProductCollection>(["new", "best", "featured", "offers"]);

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseListingParams(sp: ListingSearchParams) {
  const sort = one(sp.sort);
  const collection = one(sp.collection);
  const page = Number.parseInt(one(sp.page) ?? "1", 10);
  return {
    q: one(sp.q)?.trim() || undefined,
    category: one(sp.category) || undefined,
    sort: (sort && SORTS.has(sort as ProductSort) ? sort : "newest") as ProductSort,
    collection: collection && COLLECTIONS.has(collection as ProductCollection) ? (collection as ProductCollection) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function hrefWith(basePath: string, sp: ListingSearchParams, changes: Record<string, string | null>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (val) next.set(k, val);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v) next.set(k, v);
    else next.delete(k);
  }
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function ProductListing({
  title,
  eyebrow,
  description,
  basePath,
  searchParams,
  categories,
  fixedCategory,
  fixedCollection,
  currency,
}: {
  title: string;
  eyebrow?: string;
  description?: string | null;
  basePath: string;
  searchParams: ListingSearchParams;
  categories: Category[];
  fixedCategory?: Category;
  fixedCollection?: ProductCollection;
  currency: string;
}) {
  const params = parseListingParams(searchParams);
  const selectedCategory = fixedCategory ?? categories.find((c) => c.slug === params.category);
  const collection = fixedCollection ?? params.collection;

  const result = await getProducts({
    q: params.q,
    categoryId: selectedCategory?.id,
    collection,
    sort: params.sort,
    page: params.page,
  });

  const chipBase = "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition";
  const chipOn = "border-navy-800 bg-navy-800 text-white";
  const chipOff = "border-sand-300 bg-white text-navy-900 hover:border-navy-800";

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
          <Link href="/" className="hover:text-coral-600">Home</Link>
          <span className="mx-1.5">/</span>
          {fixedCategory ? (
            <>
              <Link href="/categories" className="hover:text-coral-600">Categories</Link>
              <span className="mx-1.5">/</span>
            </>
          ) : null}
          <span className="text-navy-900">{title}</span>
        </nav>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl text-navy-900 sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-muted">{description}</p>}
      </header>

      {!fixedCategory && categories.length > 0 && (
        <nav aria-label="Filter by category" className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link
            href={hrefWith(basePath, searchParams, { category: null, page: null })}
            className={`${chipBase} ${!selectedCategory ? chipOn : chipOff}`}
            aria-current={!selectedCategory ? "page" : undefined}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={hrefWith(basePath, searchParams, { category: c.slug, page: null })}
              className={`${chipBase} ${selectedCategory?.id === c.id ? chipOn : chipOff}`}
              aria-current={selectedCategory?.id === c.id ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {!fixedCollection && (
        <div className="mb-5 flex flex-wrap gap-2 text-sm">
          {(
            [
              [null, "Everything"],
              ["new", "New Arrivals"],
              ["best", "Best Sellers"],
              ["featured", "Featured"],
              ["offers", "Offers"],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={label}
              href={hrefWith(basePath, searchParams, { collection: value, page: null })}
              className={`rounded-full px-3 py-1.5 font-medium transition ${
                (collection ?? null) === value ? "bg-coral-50 text-coral-700 ring-1 ring-coral-400/50" : "text-muted hover:text-navy-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-8 border-y border-sand-200 py-4">
        <Suspense>
          <ListingToolbar sortOptions={SORT_OPTIONS} total={result.total} />
        </Suspense>
      </div>

      {params.q && (
        <p className="mb-6 text-sm text-muted">
          Results for <span className="font-semibold text-navy-900">&ldquo;{params.q}&rdquo;</span>
        </p>
      )}

      {result.products.length > 0 ? (
        <ProductGrid products={result.products} currency={currency} priorityCount={4} />
      ) : (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand-300 bg-white/60 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-blush-100 text-coral-600">
            <SearchIcon size={24} />
          </span>
          <p className="mt-4 font-display text-2xl text-navy-900">No products found</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {params.q
              ? "Try a different word, or browse all products."
              : "Nothing here yet — new pieces are added regularly."}
          </p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Browse all products
          </Link>
        </div>
      )}

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          {params.page > 1 ? (
            <Link
              href={hrefWith(basePath, searchParams, { page: params.page - 1 > 1 ? String(params.page - 1) : null })}
              className="btn btn-outline btn-sm"
              rel="prev"
            >
              <ChevronLeftIcon size={16} /> Previous
            </Link>
          ) : (
            <span className="btn btn-outline btn-sm pointer-events-none opacity-40">
              <ChevronLeftIcon size={16} /> Previous
            </span>
          )}
          <span className="px-3 text-sm text-muted">
            Page {params.page} of {result.pageCount}
          </span>
          {params.page < result.pageCount ? (
            <Link
              href={hrefWith(basePath, searchParams, { page: String(params.page + 1) })}
              className="btn btn-outline btn-sm"
              rel="next"
            >
              Next <ChevronRightIcon size={16} />
            </Link>
          ) : (
            <span className="btn btn-outline btn-sm pointer-events-none opacity-40">
              Next <ChevronRightIcon size={16} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
