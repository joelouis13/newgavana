"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { MAIN_NAV } from "@/components/layout/nav-links";

export function MobileNav({
  categories,
  storeName,
}: {
  categories: { name: string; slug: string }[];
  storeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const pathname = usePathname();

  // Close when navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 grid size-11 place-items-center rounded-full text-navy-900 hover:bg-navy-50 lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <MenuIcon size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="animate-fade-in absolute inset-0 bg-navy-900/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
              <span className="font-display text-xl font-bold text-navy-800">{storeName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-full hover:bg-navy-50"
                aria-label="Close menu"
              >
                <CloseIcon size={22} />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-3 py-3">
              {MAIN_NAV.map((item) =>
                "hasMenu" in item && item.hasMenu ? (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => setShowCategories((s) => !s)}
                      aria-expanded={showCategories}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-navy-900 hover:bg-blush-50"
                    >
                      {item.label}
                      <ChevronDownIcon size={18} className={`transition ${showCategories ? "rotate-180" : ""}`} />
                    </button>
                    {showCategories && (
                      <ul className="mb-2 ml-3 border-l border-sand-300 pl-2">
                        {categories.map((c) => (
                          <li key={c.slug}>
                            <Link
                              href={`/category/${c.slug}`}
                              className="block rounded-lg px-3 py-2 text-[15px] text-navy-900/80 hover:bg-blush-50 hover:text-coral-600"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href="/categories"
                            className="block rounded-lg px-3 py-2 text-[15px] font-semibold text-coral-600"
                          >
                            All categories
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="block rounded-xl px-3 py-3 text-base font-medium text-navy-900 hover:bg-blush-50 aria-[current=page]:text-coral-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
              <li>
                <Link
                  href="/cart"
                  className="block rounded-xl px-3 py-3 text-base font-medium text-navy-900 hover:bg-blush-50"
                >
                  Cart
                </Link>
              </li>
            </ul>
            <p className="border-t border-sand-200 px-5 py-4 text-xs leading-relaxed text-muted">
              Orders and payment are handled personally on WhatsApp. No card details needed.
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
