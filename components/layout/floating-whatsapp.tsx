"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** General enquiry shortcut. Hidden where a purchase CTA already dominates. */
export function FloatingWhatsApp() {
  const { whatsapp_number, store_name } = useStore();
  const pathname = usePathname();
  if (!whatsapp_number || pathname.startsWith("/product/") || pathname === "/checkout" || pathname === "/cart") {
    return null;
  }
  return (
    <a
      href={buildWhatsAppUrl(whatsapp_number, `Hello ${store_name}, I have a question.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${store_name} on WhatsApp`}
      className="fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-wa-500 text-white shadow-lg shadow-wa-500/30 transition hover:scale-105 hover:bg-wa-600 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
