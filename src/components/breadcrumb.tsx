import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="麵包屑" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              ) : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-md font-medium hover:text-slate-950 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-medium text-slate-900 dark:text-slate-100"
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
