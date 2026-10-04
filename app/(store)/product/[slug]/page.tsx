import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductSection } from "@/components/product/product-section";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { getProductBySlug, getProducts, getStoreSettings } from "@/lib/data/storefront";
import { SITE_URL } from "@/lib/env";
import { discountPercent, formatMoney, isOnOffer } from "@/lib/format";
import { absoluteUrl } from "@/lib/whatsapp";

export const revalidate = 60;

// Pages are generated on first visit, then cached and revalidated.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) return { title: "Product not found" };
  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — ${formatMoney(product.price, settings.currency)}. Order on WhatsApp.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} · ${formatMoney(product.price, settings.currency)}`,
      description,
      images: product.primary_image ? [{ url: product.primary_image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);
  if (!product) notFound();

  const related = await getProducts({
    categoryId: product.category_id ?? undefined,
    excludeId: product.id,
    pageSize: 4,
  });

  const images = product.images.length
    ? product.images.map((i) => i.image_url)
    : product.primary_image
      ? [product.primary_image]
      : [];
  const onOffer = isOnOffer(product);
  const inStock = product.stock_quantity > 0;
  const currency = settings.currency;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    image: images.map((src) => absoluteUrl(src, SITE_URL)),
    category: product.category?.name,
    brand: { "@type": "Brand", name: settings.store_name },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: currency,
      price: Number(product.price).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="container-page pt-4 pb-28 sm:pt-8 sm:pb-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center text-xs text-muted sm:mb-6">
          <Link href="/" className="hover:text-coral-600">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/shop" className="hover:text-coral-600">Shop</Link>
          {product.category && (
            <>
              <span className="mx-1.5">/</span>
              <Link href={`/category/${product.category.slug}`} className="hover:text-coral-600">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-1.5">/</span>
          <span className="line-clamp-1 text-navy-900">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={images} name={product.name} />

          <div>
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Link
                  href={`/category/${product.category.slug}`}
                  className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-navy-800 hover:bg-blush-200"
                >
                  {product.category.name}
                </Link>
              )}
              {product.is_new_arrival && (
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-800">New Arrival</span>
              )}
              {product.is_best_seller && (
                <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-white">Best Seller</span>
              )}
            </div>

            <h1 className="mt-4 font-display text-3xl leading-tight text-navy-900 sm:text-[42px]">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-bold text-navy-900">{formatMoney(product.price, currency)}</p>
              {onOffer && (
                <>
                  <p className="text-lg text-muted line-through">{formatMoney(product.compare_at_price!, currency)}</p>
                  <span className="rounded-full bg-coral-500 px-2.5 py-1 text-xs font-bold text-white">
                    Save {discountPercent(product)}%
                  </span>
                </>
              )}
            </div>

            <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${inStock ? "text-wa-600" : "text-red-600"}`}>
              {inStock ? (
                <>
                  <CheckIcon size={16} />
                  {product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left in stock` : "In stock"}
                </>
              ) : (
                "Currently sold out — message us to check restock dates"
              )}
            </p>

            {product.description && (
              <div className="mt-6 border-t border-sand-200 pt-6">
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-navy-900 uppercase">Description</h2>
                <p className="leading-relaxed whitespace-pre-line text-ink/80">{product.description}</p>
              </div>
            )}

            <div className="mt-6 border-t border-sand-200 pt-6">
              <PurchasePanel
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  description: product.description,
                  image: product.primary_image ?? images[0] ?? null,
                  sizes: product.sizes ?? [],
                  colors: product.colors ?? [],
                  stock: product.stock_quantity,
                }}
              />
            </div>

            {product.sku && <p className="mt-6 text-xs text-muted">Product code: {product.sku}</p>}
          </div>
        </div>
      </div>

      <ProductSection
        eyebrow="You may also like"
        title={product.category ? `More ${product.category.name}` : "More to love"}
        href={product.category ? `/category/${product.category.slug}` : "/shop"}
        products={related.products}
        currency={currency}
        tone="blush"
      />
    </>
  );
}
