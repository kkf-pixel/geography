import type { Grade } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";
import { MapGameLink } from "@/components/map-game-link";
import { SkyQuizLink } from "@/components/sky-quiz-link";
import { SquadGameLink } from "@/components/squad-game-link";

export function GradeView({ grade }: { grade: Grade }) {
  const Icon = grade.icon;
  const accent =
    grade.tone === "blue"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-sky-300"
      : "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb
        items={[
          { href: "/", label: "首頁" },
          { label: grade.navLabel },
        ]}
      />

      <header className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className={`grid size-12 place-items-center rounded-2xl ${accent}`}>
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <p className="font-display text-sm font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {grade.code} · {grade.combinedLabel}
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {grade.pageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          {grade.combinedLabel}合在這一頁，不用再分開進入各單元。
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{grade.combinedLabel}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {grade.topics.map((topic, index) => (
            <li
              key={topic.title}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="font-display text-xs font-semibold tracking-[0.16em] text-slate-500 dark:text-slate-400">
                單元{["一", "二", "三"][index]}
              </p>
              <p className="mt-2 text-sm font-bold leading-snug">{topic.title}</p>
            </li>
          ))}
        </ul>
      </section>

      {grade.id === "s1" ? (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold">溫習遊戲</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              單元一至三共用兩個遊戲：先認18區，再以衝鋒隊溫習土地利用。
            </p>
          </div>
          <MapGameLink />
          <SquadGameLink />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold">溫習遊戲</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              單元一至三共用一個遊戲：按掣開啟雲階問答塔。
            </p>
          </div>
          <SkyQuizLink />
        </div>
      )}
    </Container>
  );
}
