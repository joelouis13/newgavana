"use client";

import { useCallback } from "react";
import { useStore } from "@/components/store-provider";
import { recordWhatsAppOrder } from "@/lib/orders-client";
import {
  absoluteUrl,
  buildSingleProductMessage,
  buildWhatsAppUrl,
  openWhatsApp,
} from "@/lib/whatsapp";

export type BuyNowProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description?: string | null;
  image: string | null;
};

/**
 * "Buy on WhatsApp" for one product. Opens WhatsApp synchronously inside the
 * click handler (so mobile popup blockers allow it) and logs the order in the
 * background.
 */
export function useBuyNow() {
  const store = useStore();

  return useCallback(
    (product: BuyNowProduct, opts: { quantity?: number; size?: string | null; color?: string | null } = {}) => {
      const quantity = opts.quantity ?? 1;
      const siteUrl = store.site_url || window.location.origin;
      const message = buildSingleProductMessage({
        storeName: store.store_name,
        currency: store.currency,
        description: product.description,
        line: {
          name: product.name,
          unitPrice: product.price,
          quantity,
          size: opts.size,
          color: opts.color,
          imageUrl: absoluteUrl(product.image, siteUrl),
          productUrl: `${siteUrl}/product/${product.slug}`,
        },
      });
      const url = buildWhatsAppUrl(store.whatsapp_number, message);

      openWhatsApp(url);

      void recordWhatsAppOrder({
        source: "buy_now",
        items: [{ product_id: product.id, quantity, size: opts.size, color: opts.color }],
      });
    },
    [store],
  );
}
