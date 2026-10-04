import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getStoreSettings } from "@/lib/data/storefront";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

// Fonts are self-hosted (variable WOFF2, Latin subset) so builds and dev never
// depend on reaching Google Fonts.
const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});
const playfair = localFont({
  src: [
    { path: "./fonts/playfair-latin.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/playfair-latin-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  const description =
    s.store_description ??
    "Women's fashion and lifestyle store — corsets, lingerie, bags and more. Order easily on WhatsApp.";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${s.store_name} — Women's Fashion & Lifestyle`,
      template: `%s | ${s.store_name}`,
    },
    description,
    applicationName: s.store_name,
    openGraph: {
      type: "website",
      siteName: s.store_name,
      title: `${s.store_name} — Women's Fashion & Lifestyle`,
      description,
      images: [{ url: "/hero1.jpg", width: 1500, height: 1000, alt: s.store_name }],
      locale: "en_GH",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#fcf8f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
