"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageManager } from "@/components/admin/image-manager";
import { Toggle } from "@/components/admin/toggle";
import { ExternalIcon } from "@/components/icons";
import { saveProduct, type ProductImageInput, type ProductInput } from "@/lib/admin/product-actions";
import { parseList, slugify } from "@/lib/format";
import type { Category, ProductDetail } from "@/lib/types";
import { toast } from "@/lib/ui-store";

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  sku: string;
  stock_quantity: string;
  sizes: string;
  colors: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
};

function initialState(p?: ProductDetail | null): FormState {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    price: p ? String(p.price) : "",
    compare_at_price: p?.compare_at_price != null ? String(p.compare_at_price) : "",
    category_id: p?.category_id ?? "",
    sku: p?.sku ?? "",
    stock_quantity: p ? String(p.stock_quantity) : "10",
    sizes: (p?.sizes ?? []).join(", "),
    colors: (p?.colors ?? []).join(", "),
    is_active: p?.is_active ?? true,
    is_featured: p?.is_featured ?? false,
    is_new_arrival: p?.is_new_arrival ?? true,
    is_best_seller: p?.is_best_seller ?? false,
  };
}

const SIZE_PRESETS = ["XS, S, M, L, XL", "S, M, L, XL, XXL", "One Size", "36, 37, 38, 39, 40, 41"];

export function ProductForm({ product, categories }: { product?: ProductDetail | null; categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(product));
  const [images, setImages] = useState<ProductImageInput[]>(() =>
    (product?.images ?? []).map((i) => ({
      id: i.id,
      image_url: i.image_url,
      storage_path: i.storage_path,
      is_primary: i.is_primary,
    })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: ProductInput = {
      id: product?.id,
      name: form.name,
      slug: form.slug.trim() || undefined,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price.trim() ? Number(form.compare_at_price) : null,
      category_id: form.category_id || null,
      sku: form.sku,
      stock_quantity: Number(form.stock_quantity),
      sizes: parseList(form.sizes),
      colors: parseList(form.colors),
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
      is_best_seller: form.is_best_seller,
      images,
    };
    if (form.price.trim() === "") {
      setErrors({ price: "Price is required." });
      return;
    }
    startTransition(async () => {
      const res = await saveProduct(input);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, { tone: "error" });
        return;
      }
      toast(product ? "Product updated" : "Product created");
      if (product) {
        setForm((f) => ({ ...f, slug: res.data.slug }));
        router.refresh();
      } else {
        router.replace(`/admin/products/${res.data.id}`);
      }
    });
  }

  const err = (k: string) => errors[k] && <p className="field-error">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-navy-900">Basic information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="p-name" className="field-label">Product name *</label>
              <input id="p-name" className="field" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="p-desc" className="field-label">Description</label>
              <textarea
                id="p-desc"
                className="field min-h-36"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Material, fit, care instructions, what's included…"
              />
            </div>
            <div>
              <label htmlFor="p-slug" className="field-label">URL slug</label>
              <div className="flex items-center rounded-xl border border-sand-300 bg-white focus-within:border-navy-600 focus-within:ring-2 focus-within:ring-navy-600/15">
                <span className="pl-3.5 text-sm text-muted">/product/</span>
                <input
                  id="p-slug"
                  className="w-full rounded-xl bg-transparent px-1 py-2.5 text-[15px] focus:outline-none"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </div>
              {err("slug")}
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 font-semibold text-navy-900">Images</h2>
          <p className="mb-4 text-sm text-muted">Upload a main photo and any additional angles.</p>
          <ImageManager images={images} onChange={setImages} />
          {err("images")}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-navy-900">Pricing &amp; stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-price" className="field-label">Price (selling) *</label>
              <input id="p-price" className="field" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} aria-invalid={!!errors.price} />
              {err("price")}
            </div>
            <div>
              <label htmlFor="p-compare" className="field-label">Original price <span className="font-normal text-muted">(for offers)</span></label>
              <input id="p-compare" className="field" type="number" inputMode="decimal" min="0" step="0.01" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} placeholder="Leave empty if not on offer" aria-invalid={!!errors.compare_at_price} />
              {err("compare_at_price")}
            </div>
            <div>
              <label htmlFor="p-stock" className="field-label">Stock quantity *</label>
              <input id="p-stock" className="field" type="number" inputMode="numeric" min="0" step="1" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} aria-invalid={!!errors.stock_quantity} />
              {err("stock_quantity")}
              <p className="mt-1 text-xs text-muted">0 shows the product as “Sold out”.</p>
            </div>
            <div>
              <label htmlFor="p-sku" className="field-label">SKU / product code</label>
              <input id="p-sku" className="field" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. NG-COR-001" />
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 font-semibold text-navy-900">Variants</h2>
          <p className="mb-4 text-sm text-muted">Separate options with commas. Customers must pick one before ordering.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="p-sizes" className="field-label">Sizes</label>
              <input id="p-sizes" className="field" value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S, M, L, XL" aria-invalid={!!errors.sizes} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SIZE_PRESETS.map((p) => (
                  <button key={p} type="button" onClick={() => set("sizes", p)} className="rounded-full border border-sand-300 px-2.5 py-1 text-xs text-muted hover:border-navy-600 hover:text-navy-900">
                    {p}
                  </button>
                ))}
              </div>
              {err("sizes")}
            </div>
            <div>
              <label htmlFor="p-colors" className="field-label">Colors</label>
              <input id="p-colors" className="field" value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Black, Nude, Wine" />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-navy-900">Category</h2>
          <label htmlFor="p-category" className="sr-only">Category</label>
          <select id="p-category" className="field" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
            <option value="">— Uncategorised —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </select>
          <Link href="/admin/categories" className="mt-2 inline-block text-xs font-semibold text-navy-700 hover:text-coral-600">
            Manage categories →
          </Link>
        </section>

        <section className="card space-y-2.5 p-5">
          <h2 className="mb-1 font-semibold text-navy-900">Visibility</h2>
          <Toggle label="Active" description="Visible in the store" checked={form.is_active} onChange={(v) => set("is_active", v)} />
          <Toggle label="New Arrival" description="Shows in New Arrivals" checked={form.is_new_arrival} onChange={(v) => set("is_new_arrival", v)} />
          <Toggle label="Best Seller" description="Shows in Best Sellers" checked={form.is_best_seller} onChange={(v) => set("is_best_seller", v)} />
          <Toggle label="Featured" description="Shows on the homepage" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
        </section>

        <div className="flex flex-col gap-2">
          <button type="submit" className="btn btn-primary py-3" disabled={pending}>
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          {product && product.is_active && !product.deleted_at && (
            <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <ExternalIcon size={16} /> View in store
            </a>
          )}
          <Link href="/admin/products" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
