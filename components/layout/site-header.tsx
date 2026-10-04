import Link from "next/link";
import { ChevronDownIcon, WhatsAppIcon } from "@/components/icons";
import { CartButton } from "@/components/layout/cart-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MAIN_NAV } from "@/components/layout/nav-links";
import type { Category, StoreSettings } from "@/lib/types";

export function SiteHeader({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: Category[];
}) {
  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <>
      {settings.announcement_text && (
        <div className="bg-navy-900 text-white">
          <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-[12px] sm:text-[13px]">
            <WhatsAppIcon size={14} className="shrink-0 text-wa-50" />
            <span>{settings.announcement_text}</span>
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-cream/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-3 sm:h-[72px]">
          <MobileNav categories={navCategories} storeName={settings.store_name} />

          <Logo storeName={settings.store_name} logoUrl={settings.logo_url} tagline={settings.tagline} />

          <nav aria-label="Main" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
            {MAIN_NAV.map((item) =>
              "hasMenu" in item && item.hasMenu ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-navy-900 hover:text-coral-600"
                  >
                    {item.label}
                    <ChevronDownIcon size={14} />
                  </Link>
                  {navCategories.length > 0 && (
                    <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="grid w-[420px] grid-cols-2 gap-1 rounded-2xl border border-sand-200 bg-white p-3 shadow-xl">
                        {navCategories.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={`/category/${c.slug}`}
                              className="block rounded-xl px-3 py-2 text-sm text-navy-900 hover:bg-blush-50 hover:text-coral-600"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                        <li className="col-span-2 mt-1 border-t border-sand-200 pt-2">
                          <Link
                            href="/categories"
                            className="block rounded-xl px-3 py-2 text-sm font-semibold text-coral-600 hover:bg-blush-50"
                          >
                            View all categories →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-medium text-navy-900 hover:text-coral-600"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <HeaderSearch />
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}
