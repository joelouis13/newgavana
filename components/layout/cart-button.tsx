"use client";

import { BagIcon } from "@/components/icons";
import { useCart } from "@/lib/cart";
import { cartDrawer } from "@/lib/ui-store";

export function CartButton() {
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={cartDrawer.open}
      className="relative grid size-11 place-items-center rounded-full text-navy-900 hover:bg-navy-50"
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <BagIcon size={22} />
      {count > 0 && (
        <span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] leading-5 font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
