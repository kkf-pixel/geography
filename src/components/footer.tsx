import { Container } from "@/components/container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/75 dark:border-slate-800 dark:bg-slate-950/70">
      <Container className="flex flex-col gap-2 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p className="font-medium text-slate-800 dark:text-slate-200">
          初中地理溫習網
          <span className="font-display ml-2 text-xs tracking-[0.12em] text-slate-500">
            JUNIOR GEOGRAPHY
          </span>
        </p>
        <p>基礎導覽版 · 課題筆記稍後加入</p>
      </Container>
    </footer>
  );
}
