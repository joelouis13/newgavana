"use client";

import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cart, type CartItem } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export function CartLine({
  item,
  currency,
  onNavigate,
  compact,
}: {
  item: CartItem;
  currency: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const variant = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex gap-3 py-4 sm:gap-4">
      <Link
        href={`/product/${item.slug}`}
        onClick={onNavigate}
        className={`relative shrink-0 overflow-hidden rounded-xl bg-blush-50 ${compact ? "h-24 w-20" : "h-28 w-24 sm:h-32 sm:w-28"}`}
      >
        <ProductImage src={item.image} alt={item.name} sizes="112px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              onClick={onNavigate}
              className="line-clamp-2 text-sm font-medium text-navy-900 hover:text-coral-600"
            >
              {item.name}
            </Link>
            {variant && <p className="mt-0.5 text-xs text-muted">{variant}</p>}
            <p className="mt-1 text-xs text-muted">{formatMoney(item.price, currency)} each</p>
          </div>
          <button
            type="button"
            onClick={() => cart.remove(item.key)}
            className="-m-1.5 rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${item.name}`}
          >
            <TrashIcon size={18} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.min(99, item.maxQuantity > 0 ? item.maxQuantity : 99)}
            onChange={(q) => cart.setQuantity(item.key, q)}
            label={`Quantity for ${item.name}`}
          />
          <p className="text-sm font-bold text-navy-900">{formatMoney(item.price * item.quantity, currency)}</p>
        </div>
      </div>
    </li>
  );
}
