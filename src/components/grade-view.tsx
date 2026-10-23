import type { Grade } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";
import { UnitCard } from "@/components/unit-card";

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
            {grade.code}
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {grade.pageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          選擇一個單元進入課題入口。筆記與練習會在之後加入。
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:gap-5 lg:grid-cols-3">
        {grade.units.map((unit) => (
          <UnitCard key={unit.slug} grade={grade} unit={unit} />
        ))}
      </div>
    </Container>
  );
}
