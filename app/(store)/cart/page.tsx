import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <p className="eyebrow mb-2">Review</p>
      <h1 className="mb-8 font-display text-4xl text-navy-900 sm:text-5xl">Your Cart</h1>
      <CartView />
    </div>
  );
}
