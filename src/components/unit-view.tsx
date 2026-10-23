import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { unitNumber, type Grade, type Unit } from "@/lib/curriculum";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";

export function UnitView({ grade, unit }: { grade: Grade; unit: Unit }) {
  const Icon = unit.icon;
  const accent =
    grade.tone === "blue"
      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-sky-300"
      : "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";

  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb
        items={[
          { href: "/", label: "首頁" },
          { href: grade.href, label: grade.navLabel },
          { label: unit.heading },
        ]}
      />

      <Link
        href={grade.href}
        className="press inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回{grade.navLabel}
      </Link>

      <header className="mt-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className={`grid size-12 place-items-center rounded-2xl ${accent}`}>
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <p className="font-display text-sm font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {grade.code} · {unitNumber(grade, unit)}
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {unit.heading}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          {unit.summary}
        </p>
      </header>

      <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-6 sm:p-8 dark:border-slate-600 dark:bg-slate-900/80">
        <h2 className="text-lg font-bold">單元入口</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          這頁負責把課題位置留好。筆記、地圖練習和溫習工具尚未加入，可以先返回年級頁，或改看其他單元。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">同一年級的單元</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {grade.units.map((item) => {
            const current = item.slug === unit.slug;
            if (current) {
              return (
                <li
                  key={item.slug}
                  className="flex min-h-16 flex-col justify-center rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-bold text-white dark:border-white dark:bg-white dark:text-slate-950"
                  aria-current="page"
                >
                  {item.heading}
                  <span className="mt-1 text-xs font-medium text-orange-300 dark:text-orange-700">
                    目前位置
                  </span>
                </li>
              );
            }

            return (
              <li key={item.slug} className="h-full">
                <Link
                  href={`${grade.href}/${item.slug}`}
                  data-tone={grade.tone}
                  className="lift-card flex h-full min-h-16 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  {item.heading}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
