import { CartDrawer } from "@/components/cart/cart-drawer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreProvider } from "@/components/store-provider";
import { Toaster } from "@/components/ui/toaster";
import { getActiveCategories, getStoreSettings } from "@/lib/data/storefront";
import { SITE_URL } from "@/lib/env";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getStoreSettings(), getActiveCategories()]);

  return (
    <StoreProvider
      config={{
        store_name: settings.store_name,
        whatsapp_number: settings.whatsapp_number,
        currency: settings.currency,
        logo_url: settings.logo_url,
        site_url: SITE_URL,
      }}
    >
      <a
        href="#main"
        className="sr-only z-[80] rounded-full bg-navy-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader settings={settings} categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} categories={categories} />
      <CartDrawer />
      <FloatingWhatsApp />
      <Toaster />
    </StoreProvider>
  );
}
