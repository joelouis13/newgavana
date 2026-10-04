import Image from "next/image";
import Link from "next/link";
import { CategoryList } from "@/components/category/category-list";
import { HowItWorks } from "@/components/home/how-it-works";
import { ArrowRightIcon, ShieldIcon, TagIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { ProductSection, SectionHeading } from "@/components/product/product-section";
import { getActiveCategories, getProducts, getStoreSettings } from "@/lib/data/storefront";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, newArrivals, featured, bestSellers, offers, latest] = await Promise.all([
    getStoreSettings(),
    getActiveCategories(),
    getProducts({ collection: "new", pageSize: 8 }),
    getProducts({ collection: "featured", pageSize: 8 }),
    getProducts({ collection: "best", pageSize: 8 }),
    getProducts({ collection: "offers", pageSize: 4 }),
    getProducts({ pageSize: 8 }),
  ]);
  const currency = settings.currency;
  const nothingYet = latest.total === 0;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-blush-50 to-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-coral-100/60 blur-3xl"
        />
        <div className="container-page relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div className="animate-fade-in order-2 lg:order-1">
            <p className="eyebrow">Women&apos;s fashion &amp; lifestyle</p>
            <h1 className="mt-4 font-display text-[40px] leading-[1.05] text-navy-900 sm:text-6xl lg:text-[68px]">
              {settings.hero_title ?? "Elegance, delivered to your door."}
            </h1>
            {settings.hero_subtitle && (
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{settings.hero_subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary px-7 py-3.5 text-[15px]">
                Shop Now <ArrowRightIcon size={18} />
              </Link>
              <Link href="/new-arrivals" className="btn btn-outline px-7 py-3.5 text-[15px]">
                New Arrivals
              </Link>
            </div>
            <ul className="mt-9 grid max-w-lg grid-cols-3 gap-3 text-[12px] leading-snug text-navy-900 sm:text-sm">
              <li className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <WhatsAppIcon size={20} className="text-wa-500" /> Order on WhatsApp
              </li>
              <li className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <ShieldIcon size={20} className="text-coral-600" /> No online payment
              </li>
              <li className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <TruckIcon size={20} className="text-navy-600" /> Delivery arranged
              </li>
            </ul>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/10 sm:aspect-[5/4]">
              <Image
                src="/hero1.jpg"
                alt="Two women shopping online together and smiling"
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-3 hidden w-44 overflow-hidden rounded-3xl border-4 border-cream shadow-xl sm:block lg:-left-10 lg:w-52">
              <div className="relative aspect-square">
                <Image
                  src="/hero3.jpg"
                  alt="A happy customer unboxing her delivery"
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-4 right-4 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:top-6 sm:right-6">
              <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">Checkout</p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                <WhatsAppIcon size={16} className="text-wa-500" /> 100% on WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular categories */}
      {categories.length > 0 && (
        <section className="pt-14 sm:pt-20">
          <div className="container-page">
            <SectionHeading eyebrow="Browse" title="Popular Categories" href="/categories" />
            <CategoryList categories={categories.slice(0, 12)} />
          </div>
        </section>
      )}

      {nothingYet && (
        <section className="container-page py-20 text-center">
          <p className="font-display text-3xl text-navy-900">Our collection is arriving soon.</p>
          <p className="mx-auto mt-3 max-w-md text-muted">
            We&apos;re adding new pieces right now. Check back shortly or message us on WhatsApp for what&apos;s in stock.
          </p>
        </section>
      )}

      <ProductSection
        eyebrow="Just landed"
        title="New Arrivals"
        href="/new-arrivals"
        products={newArrivals.products}
        currency={currency}
      />

      <ProductSection
        eyebrow="Handpicked for you"
        title="Featured Products"
        href="/shop?collection=featured"
        products={featured.products}
        currency={currency}
        tone="blush"
      />

      <HowItWorks storeName={settings.store_name} />

      <ProductSection
        eyebrow="Customer favourites"
        title="Best Sellers"
        href="/best-sellers"
        products={bestSellers.products}
        currency={currency}
      />

      {/* Ladies' collection editorial */}
      {latest.products.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="container-page">
            <div className="grid overflow-hidden rounded-[2rem] bg-blush-100 lg:grid-cols-2">
              <div className="relative min-h-[280px] sm:min-h-[360px]">
                <Image
                  src="/hero2.jpg"
                  alt="Woman choosing an outfit on her phone"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="eyebrow">The Ladies&apos; Collection</p>
                <h2 className="mt-3 font-display text-3xl leading-tight text-navy-900 sm:text-[44px]">
                  Made for her, chosen with care.
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-muted">
                  From sculpting corsets and soft lingerie to everyday bags and beauty essentials — pieces
                  that make every day feel a little more special.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {categories.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="rounded-full border border-navy-800/15 bg-white/70 px-4 py-2 text-sm font-medium text-navy-900 hover:border-navy-800 hover:bg-white"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <Link href="/shop" className="btn btn-primary mt-8 self-start px-7">
                  Explore the collection <ArrowRightIcon size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <ProductSection
        eyebrow="Ladies' collection"
        title="Latest Pieces"
        href="/shop"
        products={latest.products}
        currency={currency}
      />

      {offers.products.length > 0 && (
        <ProductSection
          eyebrow="Limited time"
          title="Special Offers"
          href="/shop?collection=offers"
          products={offers.products}
          currency={currency}
          tone="blush"
        />
      )}

      {offers.products.length === 0 && !nothingYet && (
        <section className="container-page pb-6">
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-coral-100 bg-coral-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coral-500 text-white">
                <TagIcon size={22} />
              </span>
              <div>
                <h2 className="font-display text-2xl text-navy-900">Special Offers</h2>
                <p className="mt-1 text-sm text-muted">
                  Ask us on WhatsApp about bundle deals and this week&apos;s offers.
                </p>
              </div>
            </div>
            <Link href="/contact" className="btn btn-accent">
              Ask about offers
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
