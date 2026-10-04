"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";

/** Accessible modal built on the native <dialog> element. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const width = size === "sm" ? "sm:max-w-sm" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-0 mt-auto w-full max-w-none rounded-t-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-navy-900/40 backdrop:backdrop-blur-[2px] sm:m-auto sm:rounded-3xl ${width}`}
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="font-display text-xl text-navy-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="-m-1 rounded-full p-1.5 text-muted hover:bg-navy-50 hover:text-navy-900"
              aria-label="Close"
            >
              <CloseIcon size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  pending?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <div className="text-sm leading-relaxed text-muted">{description}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={pending}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Working…" : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
