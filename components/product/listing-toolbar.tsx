"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";

export function ListingToolbar({
  sortOptions,
  total,
}: {
  sortOptions: { value: string; label: string }[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        role="search"
        className="relative w-full sm:max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() || null });
        }}
      >
        <label htmlFor="listing-search" className="sr-only">
          Search products
        </label>
        <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
        <input
          id="listing-search"
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="field rounded-full py-2.5 pr-10 pl-10"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              update({ q: null });
            }}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-navy-50"
            aria-label="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </form>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className={`text-sm text-muted transition ${pending ? "opacity-50" : ""}`} aria-live="polite">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort</span>
          <select
            value={params.get("sort") ?? "newest"}
            onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
            className="field w-auto rounded-full py-2 pr-8 pl-3.5 text-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
