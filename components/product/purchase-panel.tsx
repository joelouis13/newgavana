"use client";

import { useState } from "react";
import { BagIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { OptionPicker } from "@/components/ui/option-picker";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cart } from "@/lib/cart";
import { cartDrawer, toast } from "@/lib/ui-store";
import { useBuyNow } from "@/lib/use-buy-now";

export function PurchasePanel({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    description: string | null;
    image: string | null;
    sizes: string[];
    colors: string[];
    stock: number;
  };
}) {
  const buyNow = useBuyNow();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [color, setColor] = useState<string | null>(product.colors.length === 1 ? product.colors[0] : null);
  const [qty, setQty] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(99, product.stock || 99));

  function valid() {
    const ok = (product.sizes.length === 0 || size) && (product.colors.length === 0 || color);
    if (!ok) setShowErrors(true);
    return Boolean(ok);
  }

  function addToCart() {
    if (!valid()) return;
    cart.add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        color,
        maxQuantity: product.stock,
      },
      qty,
    );
    toast(`${product.name} added to cart`, { action: { label: "View cart", onClick: cartDrawer.open } });
  }

  function buy() {
    if (!valid()) return;
    buyNow(
      { id: product.id, slug: product.slug, name: product.name, price: product.price, description: product.description, image: product.image },
      { quantity: qty, size, color },
    );
  }

  return (
    <div className="space-y-6">
      {product.sizes.length > 0 && (
        <OptionPicker label="Size" options={product.sizes} value={size} onChange={setSize} error={showErrors} />
      )}
      {product.colors.length > 0 && (
        <OptionPicker label="Color" options={product.colors} value={color} onChange={setColor} error={showErrors} />
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-navy-900">Quantity</p>
        <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={buy} className="btn btn-whatsapp flex-1 py-4 text-base">
          <WhatsAppIcon size={22} />
          {soldOut ? "Enquire on WhatsApp" : "Buy on WhatsApp"}
        </button>
        <button
          type="button"
          onClick={addToCart}
          disabled={soldOut}
          className="btn btn-outline flex-1 py-4 text-base"
        >
          <BagIcon size={20} />
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>

      <ul className="space-y-3 rounded-2xl bg-blush-50 p-4 text-sm text-navy-900">
        <li className="flex gap-3">
          <WhatsAppIcon size={20} className="shrink-0 text-wa-500" />
          <span>
            <strong className="font-semibold">Order on WhatsApp.</strong> Your order details are sent to us in a
            ready-made message — just press send.
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldIcon size={20} className="shrink-0 text-coral-600" />
          <span>
            <strong className="font-semibold">No online payment.</strong> Payment and order confirmation are handled
            directly on WhatsApp.
          </span>
        </li>
        <li className="flex gap-3">
          <TruckIcon size={20} className="shrink-0 text-navy-600" />
          <span>
            <strong className="font-semibold">Delivery fee confirmed in chat</strong> based on your location.
          </span>
        </li>
      </ul>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            className="btn btn-outline px-4"
            aria-label="Add to Cart"
          >
            <BagIcon size={20} />
          </button>
          <button type="button" onClick={buy} className="btn btn-whatsapp flex-1">
            <WhatsAppIcon size={20} />
            {soldOut ? "Enquire on WhatsApp" : "Buy on WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
