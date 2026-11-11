import { ArrowRight, MapPinned } from "lucide-react";
import Link from "next/link";

export const PLACE_MATCH_HREF = "/s2/place-match";

export function PlaceMatchLink() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            PLACE MATCH
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">工業帶國家配對</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            在世界工業帶地圖上，把中國、日本、韓國、泰國、印尼、印度、英國、美國、墨西哥拖到對應的數字按鈕。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-orange-50 px-3 text-sm font-bold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          <MapPinned className="size-4" aria-hidden="true" />
          九國配對
        </span>
      </div>
      <Link
        href={PLACE_MATCH_HREF}
        className="press mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
      >
        開始遊戲
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
