import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { ProductCardActions } from "@/components/product/product-card-actions";
import { discountPercent, formatMoney, isOnOffer } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({
  product,
  currency,
  priority,
}: {
  product: ProductWithCategory;
  currency: string;
  priority?: boolean;
}) {
  const onOffer = isOnOffer(product);
  const soldOut = product.stock_quantity <= 0;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-blush-50"
      >
        <ProductImage
          src={product.primary_image}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 48vw"
          className="transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {onOffer && (
            <span className="rounded-full bg-coral-500 px-2.5 py-1 text-[11px] font-bold text-white">
              -{discountPercent(product)}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-navy-900 shadow-sm">
              New
            </span>
          )}
          {product.is_best_seller && (
            <span className="rounded-full bg-navy-800 px-2.5 py-1 text-[11px] font-semibold text-white">
              Best Seller
            </span>
          )}
        </div>
        {soldOut && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-full bg-white/90 py-1.5 text-center text-xs font-semibold text-navy-900">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        {product.category && (
          <p className="mb-0.5 text-[11px] font-medium tracking-wider text-muted uppercase">
            {product.category.name}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-navy-900 sm:text-[15px]">
          <Link href={`/product/${product.slug}`} className="hover:text-coral-600">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-bold text-navy-900">{formatMoney(product.price, currency)}</span>
          {onOffer && (
            <span className="text-xs text-muted line-through">
              {formatMoney(product.compare_at_price!, currency)}
            </span>
          )}
        </p>
        <div className="mt-auto">
          <ProductCardActions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: Number(product.price),
              description: product.description,
              image: product.primary_image,
              sizes: product.sizes ?? [],
              colors: product.colors ?? [],
              stock: product.stock_quantity,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  currency,
  priorityCount = 0,
}: {
  products: ProductWithCategory[];
  currency: string;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} currency={currency} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-sand-200/70" />
          <div className="mt-3 h-3 w-1/3 rounded bg-sand-200/70" />
          <div className="mt-2 h-4 w-3/4 rounded bg-sand-200/70" />
          <div className="mt-2 h-4 w-1/4 rounded bg-sand-200/70" />
          <div className="mt-3 h-9 rounded-full bg-sand-200/70" />
        </div>
      ))}
    </div>
  );
}
