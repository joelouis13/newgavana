"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-sand-300 bg-white"
    >
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full text-navy-900 transition hover:bg-navy-50 disabled:opacity-30`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <MinusIcon size={size === "sm" ? 14 : 16} />
      </button>
      <span
        className={`${size === "sm" ? "w-7 text-sm" : "w-9"} text-center font-semibold tabular-nums`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full text-navy-900 transition hover:bg-navy-50 disabled:opacity-30`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon size={size === "sm" ? 14 : 16} />
      </button>
    </div>
  );
}
