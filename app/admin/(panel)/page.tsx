import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { BoxIcon, FolderIcon, ReceiptIcon, SparkleIcon, StarIcon, TagIcon } from "@/components/icons";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { requireAdminPage } from "@/lib/admin/auth";
import { formatDate, formatMoney, formatOrderNumber } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Dashboard" };

const DAYS = 14;

export default async function AdminDashboard() {
  const { supabase } = await requireAdminPage();

  const products = () =>
    supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const [
    totalProducts,
    activeProducts,
    newArrivals,
    bestSellers,
    featured,
    categories,
    totalOrders,
    recentOrders,
    latestOrders,
    settings,
    ...statusCounts
  ] = await Promise.all([
    products(),
    products().eq("is_active", true),
    products().eq("is_new_arrival", true),
    products().eq("is_best_seller", true),
    products().eq("is_featured", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("created_at").gte("created_at", since.toISOString()).limit(5000),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("store_settings").select("whatsapp_number, currency").eq("id", 1).maybeSingle(),
    ...ORDER_STATUSES.map((s) => supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);

  const currency = settings.data?.currency ?? "GHS";
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s, i) => [s, statusCounts[i].count ?? 0])) as Record<
    OrderStatus,
    number
  >;
  const pending = byStatus.whatsapp_initiated + byStatus.pending_confirmation;

  // Orders per day for the last 14 days (local time).
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { key: d.toDateString(), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), count: 0 };
  });
  for (const o of recentOrders.data ?? []) {
    const day = days.find((d) => d.key === new Date(o.created_at).toDateString());
    if (day) day.count++;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const maxStatus = Math.max(1, ...Object.values(byStatus));

  const tiles = [
    { label: "Total Products", value: totalProducts.count, Icon: BoxIcon, href: "/admin/products" },
    { label: "Active Products", value: activeProducts.count, Icon: BoxIcon, href: "/admin/products?status=active" },
    { label: "Categories", value: categories.count, Icon: FolderIcon, href: "/admin/categories" },
    { label: "New Arrivals", value: newArrivals.count, Icon: SparkleIcon, href: "/admin/products?flag=new" },
    { label: "Best Sellers", value: bestSellers.count, Icon: StarIcon, href: "/admin/products?flag=best" },
    { label: "Featured", value: featured.count, Icon: TagIcon, href: "/admin/products?flag=featured" },
  ];
  const orderTiles = [
    { label: "WhatsApp Orders", value: totalOrders.count, href: "/admin/orders" },
    { label: "Pending", value: pending, href: "/admin/orders?status=pending_confirmation" },
    { label: "Confirmed", value: byStatus.confirmed, href: "/admin/orders?status=confirmed" },
    { label: "Delivered", value: byStatus.delivered, href: "/admin/orders?status=delivered" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of your store and WhatsApp orders."
        actions={
          <Link href="/admin/products/new" className="btn btn-primary">
            + Add product
          </Link>
        }
      />

      {!settings.data?.whatsapp_number && (
        <div className="mb-6 rounded-2xl border border-coral-400/40 bg-coral-50 p-4 text-sm text-coral-700">
          <strong>Set your WhatsApp number.</strong> Customers&apos; orders can&apos;t reach you until you add it in{" "}
          <Link href="/admin/settings" className="font-semibold underline">Store Settings</Link>.
        </div>
      )}

      <section aria-label="Order statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {orderTiles.map((t) => (
          <Link key={t.label} href={t.href} className="card p-5 transition hover:border-navy-200 hover:shadow-sm">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">{t.label}</p>
            <p className="mt-2 text-3xl font-bold text-navy-900 tabular-nums">{t.value ?? 0}</p>
          </Link>
        ))}
      </section>

      <section aria-label="Product statistics" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(({ label, value, Icon, href }) => (
          <Link key={label} href={href} className="card flex items-center gap-3 p-4 transition hover:border-navy-200">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blush-100 text-coral-600">
              <Icon size={19} />
            </span>
            <span>
              <span className="block text-xl font-bold text-navy-900 tabular-nums">{value ?? 0}</span>
              <span className="block text-xs text-muted">{label}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-navy-900">WhatsApp orders, last {DAYS} days</h2>
          <p className="text-xs text-muted">Orders started from the website (not payments)</p>
          <div className="mt-6 flex h-44 items-end gap-[2px]" role="img" aria-label={`Orders per day: ${days.map((d) => `${d.label} ${d.count}`).join(", ")}`}>
            {days.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-navy-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
                  {d.label}: {d.count}
                </span>
                <div
                  className="w-full rounded-t-[4px] bg-navy-600 transition group-hover:bg-navy-800"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 1, opacity: d.count ? 1 : 0.25 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-sand-200 pt-2 text-[11px] text-muted">
            <span>{days[0].label}</span>
            <span>{days[days.length - 1].label}</span>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-navy-900">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {ORDER_STATUSES.map((s) => (
              <li key={s}>
                <Link href={`/admin/orders?status=${s}`} className="group block">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink/80 group-hover:text-navy-900">{ORDER_STATUS_LABELS[s]}</span>
                    <span className="font-semibold text-navy-900 tabular-nums">{byStatus[s]}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-sand-200/60">
                    <div
                      className="h-2 rounded-full bg-navy-600"
                      style={{ width: `${(byStatus[s] / maxStatus) * 100}%`, minWidth: byStatus[s] ? 6 : 0 }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:px-6">
          <h2 className="font-semibold text-navy-900">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-navy-700 hover:text-coral-600">View all →</Link>
        </div>
        {(latestOrders.data ?? []).length === 0 ? (
          <p className="border-t border-sand-200 p-8 text-center text-sm text-muted">
            <ReceiptIcon size={22} className="mx-auto mb-2 text-muted" />
            No WhatsApp orders yet. They appear here when customers tap “Purchase on WhatsApp”.
          </p>
        ) : (
          <ul className="divide-y divide-sand-200 border-t border-sand-200">
            {(latestOrders.data as Order[]).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream sm:px-6">
                  <span className="w-20 shrink-0 text-sm font-semibold text-navy-900">{formatOrderNumber(o.order_number)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink/80">
                    {o.customer_name ?? (o.source === "buy_now" ? "Buy now (no details)" : "—")}
                    <span className="block text-xs text-muted">{formatDate(o.created_at, true)}</span>
                  </span>
                  <span className="hidden text-sm font-semibold sm:block">{formatMoney(o.product_total, currency)}</span>
                  <OrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
