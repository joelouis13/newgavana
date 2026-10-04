"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BagIcon, CloseIcon, WhatsAppIcon } from "@/components/icons";
import { CartLine } from "@/components/cart/cart-line";
import { useStore } from "@/components/store-provider";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cartDrawer, useCartDrawerOpen } from "@/lib/ui-store";

export function CartDrawer() {
  const open = useCartDrawerOpen();
  const { items, count, subtotal } = useCart();
  const { currency } = useStore();
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) cartDrawer.close();
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cartDrawer.close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={cartDrawer.close}
        className="animate-fade-in absolute inset-0 bg-navy-900/40"
      />
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
          <h2 className="font-display text-xl text-navy-900">
            Your Cart <span className="font-sans text-sm text-muted">({count})</span>
          </h2>
          <button
            type="button"
            onClick={cartDrawer.close}
            className="grid size-10 place-items-center rounded-full hover:bg-navy-50"
            aria-label="Close cart"
            autoFocus
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-blush-100 text-coral-600">
              <BagIcon size={28} />
            </span>
            <p className="mt-4 font-display text-xl text-navy-900">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted">Add a few favourites and order them all in one WhatsApp message.</p>
            <Link href="/shop" onClick={cartDrawer.close} className="btn btn-primary mt-6">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-5">
              {items.map((item) => (
                <CartLine key={item.key} item={item} currency={currency} onNavigate={cartDrawer.close} compact />
              ))}
            </ul>
            <div className="border-t border-sand-200 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Product Total</span>
                <span className="text-lg font-bold text-navy-900">{formatMoney(subtotal, currency)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">Delivery fee confirmed on WhatsApp.</p>
              <Link href="/checkout" onClick={cartDrawer.close} className="btn btn-whatsapp mt-4 w-full py-3.5 text-[15px]">
                <WhatsAppIcon size={20} />
                Purchase on WhatsApp
              </Link>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/cart" onClick={cartDrawer.close} className="btn btn-outline btn-sm py-2.5">
                  View cart
                </Link>
                <button type="button" onClick={cartDrawer.close} className="btn btn-ghost btn-sm py-2.5">
                  Continue shopping
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
