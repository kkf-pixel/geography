import { Compass, Layers, MapPinned } from "lucide-react";
import { Container } from "@/components/container";
import { GradeCard } from "@/components/grade-card";
import { Skyline } from "@/components/skyline";
import { grades } from "@/lib/curriculum";

const steps = [
  {
    icon: Compass,
    title: "選擇年級",
    text: "中一看香港市區，中二看工業與製造業。",
  },
  {
    icon: Layers,
    title: "進入課題",
    text: "每個年級的單元一至三都合在同一頁。",
  },
  {
    icon: MapPinned,
    title: "跟著導覽走",
    text: "用上方列或麵包屑，隨時返回首頁和年級頁。",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#122033] to-[#1e3a8a] text-white">
        <div className="hero-grid absolute inset-0" />
        <div
          className="pointer-events-none absolute -top-10 -left-16 size-56 rounded-full bg-orange-500/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 size-72 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative grid items-end gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="font-display text-xs font-semibold tracking-[0.22em] text-orange-300">
              JUNIOR FORM GEOGRAPHY
            </p>
            <p className="mt-4 text-sm font-bold text-sky-200">初中地理溫習網</p>
            <h1 className="mt-3 text-[1.85rem] leading-tight font-bold text-balance sm:text-5xl lg:text-6xl">
              認識香港的市區，
              <span className="mt-1 block text-orange-400">追蹤工業的足跡。</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              歡迎。這裡是中一與中二的地理溫習起點：先選年級，再進入單元。
            </p>
            <p className="font-display mt-5 text-sm font-medium tracking-[0.16em] text-sky-300">
              22.32°N · 114.17°E
            </p>
          </div>
          <Skyline />
        </Container>
      </section>

      <Container className="py-10 sm:py-14">
        <div className="mb-5">
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-orange-600 dark:text-orange-300">
            START HERE
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">選擇年級</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {grades.map((grade) => (
            <GradeCard key={grade.id} grade={grade} />
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold sm:mt-16">怎樣開始</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-white/85 p-5 dark:border-slate-700 dark:bg-slate-900/85"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-orange-400 dark:bg-slate-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-semibold tracking-[0.16em] text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </>
  );
}
