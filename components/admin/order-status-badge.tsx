import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  whatsapp_initiated: "bg-wa-50 text-wa-600",
  pending_confirmation: "bg-coral-50 text-coral-700",
  confirmed: "bg-navy-50 text-navy-700",
  preparing: "bg-blush-100 text-navy-800",
  out_for_delivery: "bg-sky-50 text-sky-800",
  delivered: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-sand-200 text-muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
