"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, BagIcon, ShieldIcon, WhatsAppIcon } from "@/components/icons";
import { CartLine } from "@/components/cart/cart-line";
import { useStore } from "@/components/store-provider";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cart, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export function CartView() {
  const { items, count, subtotal } = useCart();
  const { currency, store_name } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand-300 bg-white/60 px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-blush-100 text-coral-600">
          <BagIcon size={28} />
        </span>
        <h2 className="mt-4 font-display text-2xl text-navy-900">Your cart is empty</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Add your favourite pieces, then send the whole order to us in one WhatsApp message.
        </p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
      <section aria-label="Cart items">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <p className="text-sm text-muted">
            {count} {count === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="text-sm font-medium text-muted underline-offset-2 hover:text-red-600 hover:underline"
          >
            Clear cart
          </button>
        </div>
        <ul className="divide-y divide-sand-200">
          {items.map((item) => (
            <CartLine key={item.key} item={item} currency={currency} />
          ))}
        </ul>
        <Link href="/shop" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-coral-600">
          ← Continue shopping
        </Link>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-display text-xl text-navy-900">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Items</dt>
              <dd className="font-medium">{count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Product Total</dt>
              <dd className="font-medium">{formatMoney(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right font-medium text-coral-700">To be confirmed</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-sand-200 pt-5">
            <span className="font-semibold text-navy-900">Product Total</span>
            <span className="text-2xl font-bold text-navy-900">{formatMoney(subtotal, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Excludes delivery — {store_name} will confirm the fee on WhatsApp.</p>

          <Link href="/checkout" className="btn btn-whatsapp mt-6 w-full py-4 text-base">
            <WhatsAppIcon size={22} />
            Purchase on WhatsApp
          </Link>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
            <ShieldIcon size={16} className="shrink-0 text-coral-600" />
            No online payment. Payment and order confirmation are handled directly through WhatsApp.
          </p>
        </div>
        <Link
          href="/shop"
          className="mt-3 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-navy-800 hover:text-coral-600 lg:hidden"
        >
          Continue shopping <ArrowRightIcon size={16} />
        </Link>
      </aside>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          cart.clear();
          setConfirmClear(false);
        }}
        title="Clear your cart?"
        description="All items will be removed from your cart."
        confirmLabel="Clear cart"
      />
    </div>
  );
}
