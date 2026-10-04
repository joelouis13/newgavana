import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="font-display text-8xl text-coral-500/80 italic">404</p>
      <h1 className="mt-4 font-display text-3xl text-navy-900 sm:text-4xl">This page has moved on</h1>
      <p className="mt-3 max-w-md text-muted">
        The product or page you&apos;re looking for isn&apos;t available anymore. Let&apos;s find you something new.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">
          Browse the shop
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
