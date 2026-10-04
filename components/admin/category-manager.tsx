"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Toggle } from "@/components/admin/toggle";
import { EditIcon, FolderIcon, ImageIcon, TrashIcon } from "@/components/icons";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { deleteCategory, saveCategory, setCategoryActive } from "@/lib/admin/category-actions";
import { uploadImage } from "@/lib/admin/upload";
import { slugify } from "@/lib/format";
import type { Category } from "@/lib/types";
import { toast } from "@/lib/ui-store";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  is_active: boolean;
  display_order: string;
};

export function CategoryManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const nextOrder = categories.reduce((m, c) => Math.max(m, c.display_order), 0) + 1;

  function openNew() {
    setErrors({});
    setDraft({ name: "", slug: "", description: "", image_url: null, image_path: null, is_active: true, display_order: String(nextOrder) });
  }
  function openEdit(c: Category) {
    setErrors({});
    setDraft({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url,
      image_path: c.image_path,
      is_active: c.is_active,
      display_order: String(c.display_order),
    });
  }

  async function onImage(file: File) {
    setUploading(true);
    try {
      const { url, path } = await uploadImage(file, "categories");
      setDraft((d) => (d ? { ...d, image_url: url, image_path: path } : d));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", { tone: "error" });
    } finally {
      setUploading(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    startTransition(async () => {
      const res = await saveCategory({
        id: draft.id,
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description,
        image_url: draft.image_url,
        image_path: draft.image_path,
        is_active: draft.is_active,
        display_order: Number(draft.display_order),
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast(res.error, { tone: "error" });
        return;
      }
      toast(draft.id ? "Category updated" : "Category created");
      setDraft(null);
      router.refresh();
    });
  }

  function toggleActive(c: Category) {
    startTransition(async () => {
      const res = await setCategoryActive(c.id, !c.is_active);
      if (!res.ok) toast(res.error, { tone: "error" });
      else router.refresh();
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const res = await deleteCategory(toDelete.id);
      if (!res.ok) toast(res.error, { tone: "error" });
      else {
        toast("Category deleted");
        setToDelete(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Categories appear in the store menu automatically, in display order."
        actions={
          <button type="button" onClick={openNew} className="btn btn-primary">
            + Add category
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <FolderIcon size={28} className="text-muted" />
          <p className="mt-3 font-medium text-navy-900">No categories yet</p>
          <button type="button" onClick={openNew} className="btn btn-primary mt-5">+ Add category</button>
        </div>
      ) : (
        <ul className="card divide-y divide-sand-200">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush-100 text-navy-800/40">
                {c.image_url ? <Image src={c.image_url} alt="" fill sizes="56px" className="object-cover" /> : <ImageIcon size={20} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium text-navy-900">
                  {c.name}
                  {!c.is_active && <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[11px] text-muted">Hidden</span>}
                </p>
                <p className="text-xs text-muted">
                  /category/{c.slug} · Order {c.display_order} ·{" "}
                  <Link href={`/admin/products?category=${c.id}`} className="underline-offset-2 hover:text-navy-900 hover:underline">
                    {productCounts[c.id] ?? 0} products
                  </Link>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={c.is_active}
                  aria-label={`${c.name} active`}
                  onClick={() => toggleActive(c)}
                  disabled={pending}
                  className={`relative mr-2 inline-flex h-5 w-9 rounded-full transition ${c.is_active ? "bg-navy-700" : "bg-sand-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition ${c.is_active ? "translate-x-4" : ""}`} />
                </button>
                <button type="button" onClick={() => openEdit(c)} className="btn btn-ghost btn-sm">
                  <EditIcon size={15} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(c)}
                  className="btn btn-sm text-muted hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${c.name}`}
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Edit category" : "Add category"}>
        {draft && (
          <form onSubmit={save} noValidate className="space-y-4">
            <div>
              <label htmlFor="c-name" className="field-label">Name *</label>
              <input
                id="c-name"
                className="field"
                value={draft.name}
                onChange={(e) =>
                  setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })
                }
                aria-invalid={!!errors.name}
                autoFocus
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="c-slug" className="field-label">URL slug</label>
              <input id="c-slug" className="field" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
              {errors.slug && <p className="field-error">{errors.slug}</p>}
            </div>
            <div>
              <label htmlFor="c-desc" className="field-label">Description</label>
              <textarea id="c-desc" className="field min-h-20" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div>
              <p className="field-label">Image / banner</p>
              <div className="flex items-center gap-3">
                <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush-100 text-navy-800/40">
                  {draft.image_url ? <Image src={draft.image_url} alt="" fill sizes="80px" className="object-cover" /> : <ImageIcon size={22} />}
                </span>
                <div className="flex flex-col gap-1.5">
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline btn-sm" disabled={uploading}>
                    {uploading ? "Uploading…" : draft.image_url ? "Replace image" : "Upload image"}
                  </button>
                  {draft.image_url && (
                    <button type="button" onClick={() => setDraft({ ...draft, image_url: null, image_path: null })} className="text-xs text-red-600 hover:underline">
                      Remove image
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onImage(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="c-order" className="field-label">Display order</label>
              <input id="c-order" className="field max-w-32" type="number" step="1" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: e.target.value })} />
              <p className="mt-1 text-xs text-muted">Lower numbers appear first in the menu.</p>
              {errors.display_order && <p className="field-error">{errors.display_order}</p>}
            </div>
            <Toggle label="Active" description="Show this category in the store" checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDraft(null)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={pending || uploading}>
                {pending ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        pending={pending}
        title="Delete category?"
        confirmLabel="Delete category"
        description={
          toDelete && (
            <>
              <strong className="text-navy-900">{toDelete.name}</strong> will be deleted.
              {(productCounts[toDelete.id] ?? 0) > 0 && (
                <>
                  {" "}Its {productCounts[toDelete.id]} product(s) will be kept but become <em>uncategorised</em>.
                </>
              )}{" "}
              Tip: switch it off instead to hide it temporarily.
            </>
          )
        }
      />
    </>
  );
}
