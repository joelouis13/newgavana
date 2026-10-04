"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrder } from "@/lib/admin/order-actions";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { toast } from "@/lib/ui-store";

export function OrderEditor({
  id,
  initial,
  currency,
}: {
  id: string;
  initial: { status: OrderStatus; delivery_fee: number | null; admin_notes: string };
  currency: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status);
  const [fee, setFee] = useState(initial.delivery_fee != null ? String(initial.delivery_fee) : "");
  const [notes, setNotes] = useState(initial.admin_notes);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrder(id, {
        status,
        delivery_fee: fee.trim() === "" ? null : Number(fee),
        admin_notes: notes,
      });
      if (!res.ok) toast(res.error, { tone: "error" });
      else {
        toast("Order updated");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-5">
      <h2 className="font-semibold text-navy-900">Update order</h2>
      <div>
        <label htmlFor="o-status" className="field-label">Status</label>
        <select id="o-status" className="field" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="o-fee" className="field-label">Delivery fee ({currency})</label>
        <input
          id="o-fee"
          className="field"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Agreed on WhatsApp"
        />
      </div>
      <div>
        <label htmlFor="o-notes" className="field-label">Internal notes</label>
        <textarea
          id="o-notes"
          className="field min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment received via MoMo, rider name…"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      <p className="text-xs text-muted">
        Status is for your team&apos;s tracking only. The website never takes or records payments.
      </p>
    </form>
  );
}
