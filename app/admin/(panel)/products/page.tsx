import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { ProductRowActions, ProductFlagSwitch } from "@/components/admin/product-row-actions";
import { BoxIcon } from "@/components/icons";
import { ProductImage } from "@/components/ui/product-image";
import { requireAdminPage } from "@/lib/admin/auth";
import { formatMoney } from "@/lib/format";
import type { Category, ProductWithCategory } from "@/lib/types";

export const metadata = { title: "Products" };

const PAGE_SIZE = 25;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined)) ?? "";
  const q = get("q").trim();
  const status = get("status") || "all";
  const category = get("category");
  const flag = get("flag");
  const page = Math.max(1, Number.parseInt(get("page") || "1", 10) || 1);

  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status === "archived") query = query.not("deleted_at", "is", null);
  else {
    query = query.is("deleted_at", null);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "inactive") query = query.eq("is_active", false);
    if (status === "soldout") query = query.eq("stock_quantity", 0);
  }
  if (category === "none") query = query.is("category_id", null);
  else if (category) query = query.eq("category_id", category);
  if (flag === "new") query = query.eq("is_new_arrival", true);
  if (flag === "best") query = query.eq("is_best_seller", true);
  if (flag === "featured") query = query.eq("is_featured", true);
  if (q) {
    const term = q.replace(/[%_,()*\\:."']/g, " ").trim().replace(/\s+/g, "%");
    if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count, error }, { data: categories }, { data: settings }] = await Promise.all([
    query.range(from, from + PAGE_SIZE - 1),
    supabase.from("categories").select("id, name").order("display_order"),
    supabase.from("store_settings").select("currency").eq("id", 1).maybeSingle(),
  ]);
  const products = (data ?? []) as ProductWithCategory[];
  const currency = settings?.currency ?? "GHS";
  const pageCount = Math.ceil((count ?? 0) / PAGE_SIZE);

  const link = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, status: status === "all" ? "" : status, category, flag, page: "" , ...changes })) {
      if (v) p.set(k, v);
    }
    const s = p.toString();
    return s ? `/admin/products?${s}` : "/admin/products";
  };

  const tabs = [
    ["all", "All"],
    ["active", "Active"],
    ["inactive", "Inactive"],
    ["soldout", "Sold out"],
    ["archived", "Archived"],
  ] as const;

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${count ?? 0} product${count === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary">
            + Add product
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Status filter">
          {tabs.map(([value, label]) => (
            <Link
              key={value}
              href={link({ status: value === "all" ? null : value })}
              aria-current={status === value ? "page" : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                status === value ? "bg-navy-900 text-white" : "text-muted hover:bg-white hover:text-navy-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <form className="flex flex-col gap-2 sm:flex-row" action="/admin/products">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <label className="sr-only" htmlFor="admin-q">Search</label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Search name or SKU…" className="field sm:max-w-xs" />
          <label className="sr-only" htmlFor="admin-cat">Category</label>
          <select id="admin-cat" name="category" defaultValue={category} className="field sm:max-w-[200px]">
            <option value="">All categories</option>
            <option value="none">Uncategorised</option>
            {(categories as Pick<Category, "id" | "name">[] | null)?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="admin-flag">Collection</label>
          <select id="admin-flag" name="flag" defaultValue={flag} className="field sm:max-w-[180px]">
            <option value="">Any collection</option>
            <option value="new">New Arrivals</option>
            <option value="best">Best Sellers</option>
            <option value="featured">Featured</option>
          </select>
          <button type="submit" className="btn btn-outline">Filter</button>
        </form>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Could not load products: {error.message}</p>}

      {products.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <BoxIcon size={28} className="text-muted" />
          <p className="mt-3 font-medium text-navy-900">No products found</p>
          <p className="mt-1 text-sm text-muted">
            {status === "archived" ? "Archived products appear here." : "Add your first product to start selling."}
          </p>
          {status !== "archived" && (
            <Link href="/admin/products/new" className="btn btn-primary mt-5">+ Add product</Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-cream text-left text-xs font-semibold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-3 py-3 text-center">Active</th>
                  <th className="px-3 py-3 text-center">New</th>
                  <th className="px-3 py-3 text-center">Best</th>
                  <th className="px-3 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {products.map((p) => {
                  const archived = Boolean(p.deleted_at);
                  return (
                    <tr key={p.id} className="hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-blush-50">
                            <ProductImage src={p.primary_image} alt="" sizes="48px" />
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 font-medium text-navy-900 hover:text-coral-600">{p.name}</span>
                            <span className="block text-xs text-muted">
                              {p.category?.name ?? "Uncategorised"}
                              {p.sku && ` · ${p.sku}`}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{formatMoney(p.price, currency)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock_quantity === 0 ? "font-semibold text-red-600" : p.stock_quantity <= 5 ? "font-semibold text-coral-700" : ""}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center"><ProductFlagSwitch id={p.id} flag="is_active" value={p.is_active} disabled={archived} /></td>
                      <td className="px-3 py-3 text-center"><ProductFlagSwitch id={p.id} flag="is_new_arrival" value={p.is_new_arrival} disabled={archived} /></td>
                      <td className="px-3 py-3 text-center"><ProductFlagSwitch id={p.id} flag="is_best_seller" value={p.is_best_seller} disabled={archived} /></td>
                      <td className="px-3 py-3 text-center"><ProductFlagSwitch id={p.id} flag="is_featured" value={p.is_featured} disabled={archived} /></td>
                      <td className="px-4 py-3">
                        <ProductRowActions id={p.id} name={p.name} archived={archived} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 && <Link href={link({ page: String(page - 1) })} className="btn btn-outline btn-sm">← Previous</Link>}
          <span className="px-2 text-muted">Page {page} of {pageCount}</span>
          {page < pageCount && <Link href={link({ page: String(page + 1) })} className="btn btn-outline btn-sm">Next →</Link>}
        </nav>
      )}
    </>
  );
}
