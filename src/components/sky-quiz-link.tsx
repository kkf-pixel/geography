import { Cloud, ExternalLink } from "lucide-react";

export const SKY_QUIZ_URL = "https://skyquiz-jmhexs5j.manus.game";

export function SkyQuizLink() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            SKY QUIZ
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">雲階問答塔</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            中二溫習遊戲：按「開始遊戲」開啟問答塔，溫習產業及製造業課題。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-orange-50 px-3 text-sm font-bold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          <Cloud className="size-4" aria-hidden="true" />
          溫習遊戲
        </span>
      </div>
      <a
        href={SKY_QUIZ_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
      >
        開始遊戲
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}
