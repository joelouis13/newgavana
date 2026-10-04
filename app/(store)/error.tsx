"use client";

import Link from "next/link";

export default function StoreError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl text-navy-900">We couldn&apos;t load this page</h1>
      <p className="mt-3 max-w-md text-muted">
        Please check your connection and try again. If it keeps happening, message us on WhatsApp.
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted">Ref: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Go home
        </Link>
      </div>
    </div>
  );
}
