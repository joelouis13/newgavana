"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BagIcon, CheckIcon, ShieldIcon, WhatsAppIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { ProductImage } from "@/components/ui/product-image";
import { cart, useCart } from "@/lib/cart";
import { formatMoney, formatOrderNumber } from "@/lib/format";
import { recordWhatsAppOrder } from "@/lib/orders-client";
import {
  absoluteUrl,
  buildCartOrderMessage,
  buildWhatsAppUrl,
  openWhatsApp,
  type MessageLine,
} from "@/lib/whatsapp";

type Fields = { name: string; phone: string; location: string; notes: string };
type Errors = Partial<Record<keyof Fields, string>>;

const DETAILS_KEY = "newgavana.customer.v1";
const EMPTY: Fields = { name: "", phone: "", location: "", notes: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  else if (f.name.length > 120) e.name = "Name is too long.";
  const digits = f.phone.replace(/\D/g, "");
  if (f.phone.trim() && (digits.length < 9 || digits.length > 15)) e.phone = "Enter a valid phone number.";
  if (f.location.trim().length < 3) e.location = "Tell us where to deliver.";
  else if (f.location.length > 300) e.location = "Please shorten the location.";
  if (f.notes.length > 1000) e.notes = "Notes are too long.";
  return e;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

export function CheckoutForm() {
  const { items, count, subtotal } = useCart();
  const store = useStore();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ url: string; orderNumber: number | null } | null>(null);

  // Remember details for returning customers (this device only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DETAILS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      if (saved) setFields({ ...EMPTY, ...JSON.parse(saved), notes: "" });
    } catch {}
  }, []);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`checkout-${Object.keys(errs)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    // Open the tab now, inside the click, so mobile browsers don't block it.
    const win = window.open("about:blank", "_blank");

    const customer = {
      name: fields.name.trim(),
      phone: fields.phone.trim(),
      location: fields.location.trim(),
      notes: fields.notes.trim(),
    };
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify({ name: customer.name, phone: customer.phone, location: customer.location }));
    } catch {}

    const recorded = await withTimeout(
      recordWhatsAppOrder({
        source: "cart",
        customer,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
      }),
      6000,
    );

    // Use database prices when available; drop items that are no longer sold.
    const priceById = recorded ? new Map(recorded.items.map((l) => [l.product_id, Number(l.unit_price)])) : null;
    const siteUrl = store.site_url || window.location.origin;
    const lines: MessageLine[] = items
      .filter((i) => !priceById || priceById.has(i.productId))
      .map((i) => ({
        name: i.name,
        unitPrice: priceById?.get(i.productId) ?? i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        imageUrl: absoluteUrl(i.image, siteUrl),
      }));

    const message = buildCartOrderMessage({
      storeName: store.store_name,
      currency: store.currency,
      orderNumber: recorded?.order_number,
      customer,
      lines: lines.length ? lines : items.map((i) => ({ name: i.name, unitPrice: i.price, quantity: i.quantity, size: i.size, color: i.color })),
    });
    const url = buildWhatsAppUrl(store.whatsapp_number, message);

    openWhatsApp(url, win);
    setDone({ url, orderNumber: recorded?.order_number ?? null });
    cart.clear();
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-sand-200 bg-white p-8 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-wa-50 text-wa-500">
          <CheckIcon size={30} />
        </span>
        <h2 className="mt-5 font-display text-3xl text-navy-900">Almost done!</h2>
        <p className="mt-2 text-muted">
          Your order message is ready in WhatsApp. <strong className="text-navy-900">Press send</strong> and our team
          will confirm availability, delivery fee and payment with you.
        </p>
        {done.orderNumber && (
          <p className="mt-4 inline-block rounded-full bg-blush-100 px-4 py-1.5 text-sm font-semibold text-navy-900">
            Order Ref: {formatOrderNumber(done.orderNumber)}
          </p>
        )}
        <div className="mt-7 flex flex-col gap-2">
          <a href={done.url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp py-3.5">
            <WhatsAppIcon size={20} /> WhatsApp didn&apos;t open? Tap here
          </a>
          <Link href="/shop" className="btn btn-outline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand-300 bg-white/60 px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-blush-100 text-coral-600">
          <BagIcon size={28} />
        </span>
        <h2 className="mt-4 font-display text-2xl text-navy-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-muted">Add some products before purchasing on WhatsApp.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      <section aria-labelledby="details-heading" className="card p-5 sm:p-8">
        <h2 id="details-heading" className="font-display text-2xl text-navy-900">
          Your details
        </h2>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll include these in your WhatsApp message so we can arrange delivery quickly.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="checkout-name" className="field-label">
              Full name <span className="text-coral-600">*</span>
            </label>
            <input
              id="checkout-name"
              className="field"
              autoComplete="name"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "err-name" : undefined}
            />
            {errors.name && <p id="err-name" className="field-error">{errors.name}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-phone" className="field-label">
              Phone number <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="checkout-phone"
              className="field"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 024 123 4567"
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "err-phone" : "hint-phone"}
            />
            {errors.phone ? (
              <p id="err-phone" className="field-error">{errors.phone}</p>
            ) : (
              <p id="hint-phone" className="mt-1 text-xs text-muted">Add one if it differs from your WhatsApp number.</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-location" className="field-label">
              Delivery location / address <span className="text-coral-600">*</span>
            </label>
            <input
              id="checkout-location"
              className="field"
              autoComplete="street-address"
              placeholder="e.g. East Legon, Accra — near the A&C Mall"
              value={fields.location}
              onChange={(e) => set("location", e.target.value)}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "err-location" : undefined}
            />
            {errors.location && <p id="err-location" className="field-error">{errors.location}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="checkout-notes" className="field-label">
              Additional notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="checkout-notes"
              className="field min-h-24"
              placeholder="Preferred delivery time, gift wrapping, questions…"
              value={fields.notes}
              onChange={(e) => set("notes", e.target.value)}
              aria-invalid={!!errors.notes}
            />
            {errors.notes && <p className="field-error">{errors.notes}</p>}
          </div>
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5 sm:p-6">
          <h2 className="font-display text-xl text-navy-900">Your order ({count})</h2>
          <ul className="mt-4 max-h-72 divide-y divide-sand-200 overflow-y-auto">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-blush-50">
                  <ProductImage src={i.image} alt={i.name} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-1 font-medium text-navy-900">{i.name}</p>
                  <p className="text-xs text-muted">
                    {[i.size, i.color].filter(Boolean).join(" · ")}
                    {(i.size || i.color) && " · "}Qty {i.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatMoney(i.price * i.quantity, store.currency)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-sand-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="font-semibold text-navy-900">Product Total</dt>
              <dd className="text-xl font-bold text-navy-900">{formatMoney(subtotal, store.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery fee</dt>
              <dd className="font-medium text-coral-700">To be confirmed by {store.store_name}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting} className="btn btn-whatsapp mt-6 w-full py-4 text-base">
            <WhatsAppIcon size={22} />
            {submitting ? "Preparing your message…" : "Continue to WhatsApp"}
          </button>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
            <ShieldIcon size={16} className="shrink-0 text-coral-600" />
            You won&apos;t be charged here. WhatsApp opens with your full order — payment and delivery are agreed
            directly with our team.
          </p>
        </div>
        <Link href="/cart" className="mt-3 block py-2 text-center text-sm font-semibold text-navy-800 hover:text-coral-600">
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}
