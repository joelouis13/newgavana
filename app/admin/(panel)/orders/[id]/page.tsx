import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderEditor } from "@/components/admin/order-editor";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/ui/product-image";
import { requireAdminPage } from "@/lib/admin/auth";
import { formatDate, formatMoney, formatOrderNumber } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdminPage();

  const [{ data: order }, { data: items }, { data: settings }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("store_settings").select("currency, store_name").eq("id", 1).maybeSingle(),
  ]);
  if (!order) notFound();
  const o = order as Order;
  const lines = (items ?? []) as OrderItem[];
  const currency = settings?.currency ?? "GHS";
  const ref = formatOrderNumber(o.order_number);

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-block text-sm text-muted hover:text-navy-900">← Orders</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-navy-900">Order {ref}</h1>
        <OrderStatusBadge status={o.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <h2 className="border-b border-sand-200 px-5 py-4 font-semibold text-navy-900">Products</h2>
            <ul className="divide-y divide-sand-200">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-3 px-5 py-3.5">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-blush-50">
                    <ProductImage src={l.product_image} alt="" sizes="56px" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    {l.product_id ? (
                      <Link href={`/admin/products/${l.product_id}`} className="font-medium text-navy-900 hover:text-coral-600">{l.product_name}</Link>
                    ) : (
                      <span className="font-medium text-navy-900">{l.product_name} <span className="text-xs text-muted">(deleted)</span></span>
                    )}
                    <p className="text-xs text-muted">
                      {[l.selected_size && `Size ${l.selected_size}`, l.selected_color && `Color ${l.selected_color}`].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-xs text-muted">{formatMoney(l.unit_price, currency)} × {l.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(l.subtotal, currency)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-sand-200 bg-cream px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Product total</dt><dd className="font-semibold">{formatMoney(o.product_total, currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery fee</dt><dd className="font-semibold">{o.delivery_fee != null ? formatMoney(o.delivery_fee, currency) : "To be confirmed"}</dd></div>
              <div className="flex justify-between border-t border-sand-200 pt-2 text-base"><dt className="font-semibold text-navy-900">Total to collect</dt><dd className="font-bold text-navy-900">{formatMoney(o.total_amount, currency)}</dd></div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 font-semibold text-navy-900">Customer</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Name</dt><dd className="font-medium">{o.customer_name ?? "—"}</dd></div>
              <div><dt className="text-xs text-muted">Phone</dt><dd className="font-medium">{o.customer_phone ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-muted">Delivery location</dt><dd className="font-medium">{o.delivery_location ?? "—"}</dd></div>
              {o.customer_notes && <div className="sm:col-span-2"><dt className="text-xs text-muted">Notes</dt><dd className="whitespace-pre-line">{o.customer_notes}</dd></div>}
              <div><dt className="text-xs text-muted">Placed</dt><dd>{formatDate(o.created_at, true)}</dd></div>
              <div><dt className="text-xs text-muted">Source</dt><dd>{o.source === "buy_now" ? "Buy on WhatsApp (single product)" : "Cart checkout"}</dd></div>
            </dl>
            {o.customer_phone && (
              <a
                href={buildWhatsAppUrl(o.customer_phone, `Hello ${o.customer_name ?? ""}, this is ${settings?.store_name ?? "New Gavana"} about your order ${ref}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm mt-4"
              >
                <WhatsAppIcon size={16} /> Message customer
              </a>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <OrderEditor
            id={o.id}
            initial={{ status: o.status, delivery_fee: o.delivery_fee, admin_notes: o.admin_notes ?? "" }}
            currency={currency}
          />
        </aside>
      </div>
    </>
  );
}
