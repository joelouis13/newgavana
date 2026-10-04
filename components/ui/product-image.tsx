import Image from "next/image";
import { BagIcon } from "@/components/icons";

/** next/image wrapper with an on-brand placeholder when no image exists. */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`absolute inset-0 grid place-items-center bg-linear-to-br from-blush-100 to-sand-200 text-navy-800/30 ${className}`}
        role="img"
        aria-label={alt}
      >
        <BagIcon size={40} />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
