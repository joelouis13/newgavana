"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ProductImage } from "@/components/ui/product-image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-blush-50">
        <ProductImage src={null} alt={name} sizes="(min-width: 1024px) 560px, 100vw" />
      </div>
    );
  }

  function go(i: number) {
    setActive(i);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative">
        <div
          ref={trackRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0 sm:rounded-3xl"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          aria-roledescription="carousel"
          aria-label={`${name} images`}
        >
          {images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-blush-50"
              aria-roledescription="slide"
              aria-label={`Image ${i + 1} of ${images.length}`}
            >
              <Image
                src={src}
                alt={i === 0 ? name : `${name} — view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 hidden gap-3 sm:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl bg-blush-50 ring-2 transition ${
                i === active ? "ring-navy-800" : "ring-transparent hover:ring-sand-300"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
