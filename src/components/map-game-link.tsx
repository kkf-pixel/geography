import { ArrowRight, MapPinned } from "lucide-react";
import Link from "next/link";

export const MAP_GAME_HREF = "/s1/map-challenge";

export function MapGameLink() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            MAP CHALLENGE
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            香港18區尋寶大挑戰
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            中學地理溫習小遊戲：測試你對香港行政分區的認識。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-blue-50 px-3 text-sm font-bold text-blue-800 dark:bg-blue-500/15 dark:text-sky-200">
          <MapPinned className="size-4" aria-hidden="true" />
          遊戲一 · 18 區
        </span>
      </div>
      <Link
        href={MAP_GAME_HREF}
        className="press mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
      >
        開始遊戲
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
