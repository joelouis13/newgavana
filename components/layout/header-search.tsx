"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    setOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-navy-50"
        aria-label="Search products"
        aria-expanded={open}
      >
        <SearchIcon size={22} />
      </button>

      {open && (
        <div className="animate-fade-in absolute inset-x-0 top-full border-b border-sand-200 bg-cream shadow-lg">
          <form role="search" onSubmit={submit} className="container-page flex items-center gap-2 py-3">
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <div className="relative flex-1">
              <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                id="site-search"
                type="search"
                enterKeyHint="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                placeholder="Search corsets, bags, lingerie…"
                className="field rounded-full py-3 pl-11"
              />
            </div>
            <button type="submit" className="btn btn-primary hidden sm:inline-flex">
              Search
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center rounded-full text-navy-900 hover:bg-navy-50"
              aria-label="Close search"
            >
              <CloseIcon size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
