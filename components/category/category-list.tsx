import Link from "next/link";
import { CategoryIcon } from "@/components/category/category-icon";
import type { Category } from "@/lib/types";

/** Compact icon + name + one-line description grid. */
export function CategoryList({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/category/${c.slug}`}
            className="group flex h-full items-center gap-3 rounded-2xl border border-sand-200 bg-white p-3 transition hover:border-coral-400/60 hover:shadow-sm sm:p-3.5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blush-100 text-navy-800 transition group-hover:bg-coral-500 group-hover:text-white sm:size-11">
              <CategoryIcon slug={c.slug} name={c.name} size={22} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy-900">{c.name}</span>
              {c.description && (
                <span className="mt-0.5 line-clamp-1 text-xs text-muted">{c.description}</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
