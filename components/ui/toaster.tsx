"use client";

import Link from "next/link";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { dismissToast, useToasts } from "@/lib/ui-store";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-xl ${
            t.tone === "error" ? "bg-red-600 text-white" : "bg-navy-900 text-white"
          }`}
        >
          {t.tone === "success" && (
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/15">
              <CheckIcon size={14} />
            </span>
          )}
          <span className="flex-1">{t.message}</span>
          {t.action &&
            (t.action.href ? (
              <Link
                href={t.action.href}
                onClick={() => dismissToast(t.id)}
                className="font-semibold text-coral-400 underline-offset-2 hover:underline"
              >
                {t.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  dismissToast(t.id);
                }}
                className="font-semibold text-coral-400 underline-offset-2 hover:underline"
              >
                {t.action.label}
              </button>
            ))}
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="-mr-1 rounded-full p-1 text-white/70 hover:text-white"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
