import { ExternalLink, Swords } from "lucide-react";

export const SQUAD_GAME_URL = "https://geoquiz-euszfnjo.manus.game";

export function SquadGameLink() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            SQUAD RUNNER
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            地理溫習衝鋒隊
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            第二遊戲：揀單元一至三，一路向前跑一路答香港土地利用溫習題。答啱加兵升級，答錯減兵減火力；Boss
            攻擊前要答 QTE，答啱即可閃避。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-orange-50 px-3 text-sm font-bold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          <Swords className="size-4" aria-hidden="true" />
          遊戲二
        </span>
      </div>
      <a
        href={SQUAD_GAME_URL}
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
