import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import type { ProductWithCategory } from "@/lib/types";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[28px] leading-tight text-navy-900 sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-coral-600"
        >
          {linkLabel}
          <ArrowRightIcon size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Horizontal swipe rail on phones, regular grid from tablet up. */
export function ProductSection({
  eyebrow,
  title,
  href,
  products,
  currency,
  tone = "plain",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  products: ProductWithCategory[];
  currency: string;
  tone?: "plain" | "blush";
}) {
  if (products.length === 0) return null;
  return (
    <section className={tone === "blush" ? "bg-blush-50 py-14 sm:py-20" : "py-14 sm:py-20"}>
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} href={href} />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={p} currency={currency} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
