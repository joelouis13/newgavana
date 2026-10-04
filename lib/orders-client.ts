"use client";

import { isSupabaseConfigured } from "@/lib/env";
import { getBrowserClient } from "@/lib/supabase/browser";

export type OrderLineInput = {
  product_id: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
};

export type RecordedOrder = {
  order_id: string;
  order_number: number;
  product_total: number;
  items: { product_id: string; name: string; unit_price: number; quantity: number }[];
};

/**
 * Logs a WhatsApp order for the admin dashboard. Prices are recomputed by the
 * database. Never throws: if logging fails the customer still reaches
 * WhatsApp — a lost log entry is better than a lost sale.
 */
export async function recordWhatsAppOrder(input: {
  items: OrderLineInput[];
  customer?: { name?: string; phone?: string; location?: string; notes?: string };
  source: "cart" | "buy_now";
}): Promise<RecordedOrder | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await getBrowserClient().rpc("create_whatsapp_order", {
      p_items: input.items,
      p_customer_name: input.customer?.name ?? null,
      p_customer_phone: input.customer?.phone ?? null,
      p_delivery_location: input.customer?.location ?? null,
      p_customer_notes: input.customer?.notes ?? null,
      p_source: input.source,
    });
    if (error) throw error;
    return data as RecordedOrder;
  } catch (err) {
    console.warn("Could not record WhatsApp order", err);
    return null;
  }
}
