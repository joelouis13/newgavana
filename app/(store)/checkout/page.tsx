import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Purchase on WhatsApp",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <p className="eyebrow mb-2 flex items-center gap-1.5">
        <WhatsAppIcon size={14} className="text-wa-500" /> WhatsApp order
      </p>
      <h1 className="font-display text-4xl text-navy-900 sm:text-5xl">Purchase on WhatsApp</h1>
      <p className="mt-3 mb-8 max-w-2xl text-muted">
        Fill in your details and we&apos;ll open WhatsApp with your complete order. No payment is taken on this
        website.
      </p>
      <CheckoutForm />
    </div>
  );
}
