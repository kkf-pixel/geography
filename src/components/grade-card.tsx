import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Grade } from "@/lib/curriculum";

const toneClass = {
  blue: {
    icon: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-sky-300",
    code: "text-blue-700 dark:text-sky-300",
    cta: "bg-blue-700 text-white",
    chip: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-sky-200",
  },
  orange: {
    icon: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    code: "text-orange-700 dark:text-orange-300",
    cta: "bg-orange-700 text-white",
    chip: "bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200",
  },
} as const;

export function GradeCard({ grade }: { grade: Grade }) {
  const tone = toneClass[grade.tone];
  const Icon = grade.icon;

  return (
    <Link
      href={grade.href}
      data-tone={grade.tone}
      className="lift-card group flex h-full min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 sm:p-8 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-14 place-items-center rounded-2xl ${tone.icon}`}>
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <span className={`font-display text-4xl font-semibold ${tone.code}`}>
          {grade.code}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {grade.cardTitle}
      </h3>
      <p className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-200">
        {grade.topic}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {grade.description}
      </p>

      <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone.chip}`}>
        {grade.combinedLabel}
      </p>

      <span className="mt-auto block pt-8">
        <span
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold ${tone.cta}`}
        >
          {grade.cta}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </span>
      </span>
    </Link>
  );
}
