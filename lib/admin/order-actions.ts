"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/auth";
import { errorMessage } from "@/lib/admin/helpers";
import { ORDER_STATUSES, type ActionResult, type OrderStatus } from "@/lib/types";

export type OrderUpdateInput = {
  status: OrderStatus;
  delivery_fee: number | null;
  admin_notes: string;
};

export async function updateOrder(id: string, input: OrderUpdateInput): Promise<ActionResult> {
  if (!ORDER_STATUSES.includes(input.status)) return { ok: false, error: "Unknown status." };
  if (input.delivery_fee != null && (!Number.isFinite(input.delivery_fee) || input.delivery_fee < 0))
    return { ok: false, error: "Delivery fee must be 0 or more.", fieldErrors: { delivery_fee: "Invalid amount." } };
  try {
    const { supabase } = await requireAdminAction();
    const { error } = await supabase
      .from("orders")
      .update({
        status: input.status,
        delivery_fee: input.delivery_fee,
        admin_notes: input.admin_notes.trim() || null,
      })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
