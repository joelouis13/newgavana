import { ProductGridSkeleton } from "@/components/product/product-card";

export default function Loading() {
  return (
    <div className="container-page py-8 sm:py-12" aria-busy="true" aria-label="Loading">
      <div className="mb-8 h-10 w-56 animate-pulse rounded-lg bg-sand-200/70" />
      <ProductGridSkeleton />
    </div>
  );
}
