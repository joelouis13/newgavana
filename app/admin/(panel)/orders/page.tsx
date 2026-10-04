import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { ReceiptIcon } from "@/components/icons";
import { requireAdminPage } from "@/lib/admin/auth";
import { formatDate, formatMoney, formatOrderNumber } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export const metadata = { title: "WhatsApp Orders" };

const PAGE_SIZE = 30;

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined)) ?? "";
  const status = ORDER_STATUSES.includes(one("status") as OrderStatus) ? (one("status") as OrderStatus) : null;
  const q = one("q").trim();
  const page = Math.max(1, Number.parseInt(one("page") || "1", 10) || 1);

  let query = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) {
    const num = Number.parseInt(q.replace(/\D/g, ""), 10);
    const term = q.replace(/[%_,()*\\:."']/g, " ").trim().replace(/\s+/g, "%");
    const filters = [`customer_name.ilike.%${term}%`, `customer_phone.ilike.%${term}%`];
    if (Number.isFinite(num)) filters.push(`order_number.eq.${num}`);
    query = query.or(filters.join(","));
  }
  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count, error }, { data: settings }] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    supabase.from("store_settings").select("currency").eq("id", 1).maybeSingle(),
  ]);
  const orders = (data ?? []) as Order[];
  const currency = settings?.currency ?? "GHS";
  const pageCount = Math.ceil((count ?? 0) / PAGE_SIZE);
  const href = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ status: status ?? "", q, page: "", ...changes })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <AdminPageHeader
        title="WhatsApp Orders"
        description="Orders logged when customers tap “Purchase on WhatsApp”. These are not payments — confirm each order in WhatsApp."
      />

      <nav className="no-scrollbar -mx-4 mb-3 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Status filter">
        <Link href={href({ status: null })} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${!status ? "bg-navy-900 text-white" : "text-muted hover:bg-white"}`}>
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={href({ status: s })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${status === s ? "bg-navy-900 text-white" : "text-muted hover:bg-white"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </nav>
      <form action="/admin/orders" className="mb-4 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="order-q" className="sr-only">Search orders</label>
        <input id="order-q" name="q" defaultValue={q} placeholder="Order number, name or phone…" className="field sm:max-w-sm" />
        <button type="submit" className="btn btn-outline">Search</button>
      </form>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Could not load orders: {error.message}</p>}

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <ReceiptIcon size={28} className="text-muted" />
          <p className="mt-3 font-medium text-navy-900">No orders found</p>
          <p className="mt-1 text-sm text-muted">Orders appear here when customers send them via WhatsApp.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-sand-200">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 hover:bg-cream sm:flex-nowrap sm:px-5">
                <span className="w-20 font-semibold text-navy-900">{formatOrderNumber(o.order_number)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {o.customer_name ?? <span className="text-muted">{o.source === "buy_now" ? "Buy now — details in WhatsApp" : "No name"}</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {formatDate(o.created_at, true)}
                    {o.delivery_location && ` · ${o.delivery_location}`}
                  </span>
                </span>
                <span className="text-sm font-semibold whitespace-nowrap">{formatMoney(o.product_total, currency)}</span>
                <OrderStatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 && <Link href={href({ page: String(page - 1) })} className="btn btn-outline btn-sm">← Previous</Link>}
          <span className="px-2 text-muted">Page {page} of {pageCount}</span>
          {page < pageCount && <Link href={href({ page: String(page + 1) })} className="btn btn-outline btn-sm">Next →</Link>}
        </nav>
      )}
    </>
  );
}
