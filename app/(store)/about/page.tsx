import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StoreValues } from "@/components/home/values";
import { getStoreSettings } from "@/lib/data/storefront";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return {
    title: "About Us",
    description: s.about_text?.slice(0, 160) ?? s.store_description ?? undefined,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const about =
    settings.about_text ??
    `${settings.store_name} is a women's fashion and lifestyle store built around convenience. We curate shapewear, lingerie, bags, accessories and everyday essentials, and serve every customer personally on WhatsApp.`;

  return (
    <>
      <section className="bg-linear-to-b from-blush-50 to-cream">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-navy-900 sm:text-6xl">
              About {settings.store_name}
            </h1>
            {about.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mt-5 text-lg leading-relaxed text-muted">
                {para}
              </p>
            ))}
            <Link href="/shop" className="btn btn-primary mt-8 px-7">
              Shop the collection
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-xl shadow-navy-900/10">
            <Image src="/hero3.jpg" alt="A customer unboxing her New Gavana order" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <StoreValues />
    </>
  );
}
