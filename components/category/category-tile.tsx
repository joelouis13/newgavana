import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

const GRADIENTS = [
  "from-blush-100 to-blush-200",
  "from-navy-50 to-navy-100",
  "from-coral-50 to-coral-100",
  "from-sand-200 to-blush-100",
];

export function CategoryTile({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <div
        className={`relative aspect-square overflow-hidden rounded-2xl bg-linear-to-br sm:rounded-3xl ${GRADIENTS[index % GRADIENTS.length]}`}
      >
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 40vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-display text-5xl text-navy-800/25 italic">
            {category.name.charAt(0)}
          </span>
        )}
        <span className="absolute inset-0 bg-linear-to-t from-navy-900/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className="mt-2.5 text-center text-sm font-semibold text-navy-900 group-hover:text-coral-600 sm:text-[15px]">
        {category.name}
      </p>
    </Link>
  );
}
