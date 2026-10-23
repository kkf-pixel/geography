import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { unitNumber, type Grade, type Unit } from "@/lib/curriculum";

const toneClass = {
  blue: "text-blue-700 dark:text-sky-300",
  orange: "text-orange-700 dark:text-orange-300",
} as const;

export function UnitCard({ grade, unit }: { grade: Grade; unit: Unit }) {
  const Icon = unit.icon;

  return (
    <Link
      href={`${grade.href}/${unit.slug}`}
      data-tone={grade.tone}
      className="lift-card group flex h-full min-h-48 flex-col rounded-3xl border border-slate-200 bg-white p-5 sm:min-h-52 sm:p-6 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid size-12 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800 ${toneClass[grade.tone]}`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <span className="font-display text-sm font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {unitNumber(grade, unit)}
        </span>
      </div>

      <h2 className="mt-5 text-lg font-bold leading-snug text-balance text-slate-950 dark:text-slate-50">
        {unit.heading}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {unit.summary}
      </p>
      <span
        className={`mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-bold ${toneClass[grade.tone]}`}
      >
        進入單元
        <ChevronRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
