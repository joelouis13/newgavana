"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { EditIcon, RefreshIcon, TrashIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/dialog";
import {
  archiveProduct,
  deleteProductPermanently,
  restoreProduct,
  setProductFlag,
} from "@/lib/admin/product-actions";
import { toast } from "@/lib/ui-store";

type Flag = "is_active" | "is_featured" | "is_new_arrival" | "is_best_seller";

const FLAG_LABELS: Record<Flag, string> = {
  is_active: "Active",
  is_featured: "Featured",
  is_new_arrival: "New Arrival",
  is_best_seller: "Best Seller",
};

export function ProductFlagSwitch({ id, flag, value, disabled }: { id: string; flag: Flag; value: boolean; disabled?: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={FLAG_LABELS[flag]}
      disabled={disabled}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          const res = await setProductFlag(id, flag, !optimistic);
          if (!res.ok) toast(res.error, { tone: "error" });
        })
      }
      className={`relative inline-flex h-5 w-9 rounded-full transition disabled:opacity-30 ${optimistic ? "bg-navy-700" : "bg-sand-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition ${optimistic ? "translate-x-4" : ""}`} />
    </button>
  );
}

export function ProductRowActions({ id, name, archived }: { id: string; name: string; archived: boolean }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"archive" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast(success);
        setDialog(null);
        router.refresh();
      } else toast(res.error ?? "Failed", { tone: "error" });
    });
  }

  return (
    <div className="flex justify-end gap-1">
      {archived ? (
        <>
          <button
            type="button"
            onClick={() => run(() => restoreProduct(id), "Product restored (inactive)")}
            className="btn btn-ghost btn-sm"
            disabled={pending}
          >
            <RefreshIcon size={15} /> Restore
          </button>
          <button
            type="button"
            onClick={() => setDialog("delete")}
            className="btn btn-sm text-red-600 hover:bg-red-50"
            aria-label={`Delete ${name} permanently`}
          >
            <TrashIcon size={15} />
          </button>
        </>
      ) : (
        <>
          <Link href={`/admin/products/${id}`} className="btn btn-ghost btn-sm" aria-label={`Edit ${name}`}>
            <EditIcon size={15} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setDialog("archive")}
            className="btn btn-sm text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${name}`}
          >
            <TrashIcon size={15} />
          </button>
        </>
      )}

      <ConfirmDialog
        open={dialog === "archive"}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => archiveProduct(id), "Product moved to Archived")}
        pending={pending}
        title="Delete this product?"
        confirmLabel="Delete"
        description={
          <>
            <strong className="text-navy-900">{name}</strong> will be removed from the store and moved to{" "}
            <em>Archived</em>. You can restore it later or delete it permanently from there.
          </>
        }
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => deleteProductPermanently(id), "Product permanently deleted")}
        pending={pending}
        title="Delete permanently?"
        confirmLabel="Delete forever"
        description={
          <>
            This permanently deletes <strong className="text-navy-900">{name}</strong> and its images. Past orders keep
            their copy of the name and price. <strong>This cannot be undone.</strong>
          </>
        }
      />
    </div>
  );
}
