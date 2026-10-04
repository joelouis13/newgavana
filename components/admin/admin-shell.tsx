"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BoxIcon,
  CloseIcon,
  ExternalIcon,
  FolderIcon,
  GridIcon,
  LogOutIcon,
  MenuIcon,
  ReceiptIcon,
  SettingsIcon,
} from "@/components/icons";
import { getBrowserClient } from "@/lib/supabase/browser";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: GridIcon, exact: true },
  { href: "/admin/products", label: "Products", Icon: BoxIcon },
  { href: "/admin/categories", label: "Categories", Icon: FolderIcon },
  { href: "/admin/orders", label: "WhatsApp Orders", Icon: ReceiptIcon },
  { href: "/admin/settings", label: "Store Settings", Icon: SettingsIcon },
];

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  async function signOut() {
    await getBrowserClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
        <Image src="/brand/logo-mark.png" alt="" width={36} height={36} className="rounded-lg bg-white" />
        <span className="leading-tight">
          <span className="block font-display text-lg font-bold text-white">
            New<span className="text-coral-400">Gavana</span>
          </span>
          <span className="text-[11px] tracking-wider text-white/50 uppercase">Admin</span>
        </span>
      </Link>
      <nav aria-label="Admin" className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white text-navy-900" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ExternalIcon size={19} /> View store
        </a>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOutIcon size={19} /> Sign out
        </button>
        {email && <p className="truncate px-3 pt-2 text-xs text-white/40">{email}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f6f4f2] lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-sand-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-navy-50"
          aria-label="Open admin menu"
        >
          <MenuIcon size={22} />
        </button>
        <span className="font-display text-lg font-bold text-navy-800">
          New<span className="text-coral-500">Gavana</span> <span className="font-sans text-sm font-medium text-muted">Admin</span>
        </span>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-navy-900/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-72 bg-navy-900">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
              aria-label="Close menu"
            >
              <CloseIcon size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
