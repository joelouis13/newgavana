"use client";

import { useState } from "react";
import { BagIcon, WhatsAppIcon } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { OptionPicker } from "@/components/ui/option-picker";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useStore } from "@/components/store-provider";
import { cart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cartDrawer, toast } from "@/lib/ui-store";
import { useBuyNow } from "@/lib/use-buy-now";

export type CardProduct = {
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

type Mode = "cart" | "whatsapp";

export function ProductCardActions({ product }: { product: CardProduct }) {
  const buyNow = useBuyNow();
  const { currency } = useStore();
  const [mode, setMode] = useState<Mode | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const soldOut = product.stock <= 0;
  const hasOptions = product.sizes.length > 0 || product.colors.length > 0;

  function complete(m: Mode, s: string | null, c: string | null, quantity: number) {
    if (m === "whatsapp") {
      buyNow(
        { id: product.id, slug: product.slug, name: product.name, price: product.price, description: product.description, image: product.image },
        { quantity, size: s, color: c },
      );
    } else {
      cart.add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          size: s,
          color: c,
          maxQuantity: product.stock,
        },
        quantity,
      );
      toast(`${product.name} added to cart`, { action: { label: "View cart", onClick: cartDrawer.open } });
    }
  }

  function start(m: Mode) {
    if (hasOptions) {
      setMode(m);
      setShowErrors(false);
      setQty(1);
    } else {
      complete(m, null, null, 1);
    }
  }

  function confirm() {
    if (!mode) return;
    const missing = (product.sizes.length > 0 && !size) || (product.colors.length > 0 && !color);
    if (missing) {
      setShowErrors(true);
      return;
    }
    complete(mode, size, color, qty);
    setMode(null);
  }

  return (
    <>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => start("whatsapp")}
          className="btn btn-whatsapp btn-sm w-full py-2.5 sm:text-[13px]"
        >
          <WhatsAppIcon size={16} />
          {soldOut ? "Enquire on WhatsApp" : "Buy on WhatsApp"}
        </button>
        <button
          type="button"
          onClick={() => start("cart")}
          disabled={soldOut}
          className="btn btn-outline btn-sm w-full py-2.5 sm:text-[13px]"
        >
          <BagIcon size={16} />
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>

      <Dialog
        open={mode !== null}
        onClose={() => setMode(null)}
        title={mode === "whatsapp" ? "Buy on WhatsApp" : "Add to Cart"}
      >
        <p className="font-medium text-navy-900">{product.name}</p>
        <p className="mb-5 text-sm text-muted">{formatMoney(product.price, currency)}</p>
        <div className="space-y-5">
          {product.sizes.length > 0 && (
            <OptionPicker label="Size" options={product.sizes} value={size} onChange={setSize} error={showErrors} />
          )}
          {product.colors.length > 0 && (
            <OptionPicker label="Color" options={product.colors} value={color} onChange={setColor} error={showErrors} />
          )}
          <div>
            <p className="mb-2 text-sm font-medium text-navy-900">Quantity</p>
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(99, product.stock || 99))} />
          </div>
        </div>
        <button
          type="button"
          onClick={confirm}
          className={`btn mt-6 w-full ${mode === "whatsapp" ? "btn-whatsapp" : "btn-primary"}`}
        >
          {mode === "whatsapp" ? (
            <>
              <WhatsAppIcon size={18} /> Continue to WhatsApp
            </>
          ) : (
            <>
              <BagIcon size={18} /> Add to Cart
            </>
          )}
        </button>
        {mode === "whatsapp" && (
          <p className="mt-3 text-center text-xs text-muted">
            No online payment. We confirm your order and delivery fee on WhatsApp.
          </p>
        )}
      </Dialog>
    </>
  );
}
