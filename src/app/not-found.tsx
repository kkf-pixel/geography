import type { Metadata } from "next";
import { Compass } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "找不到頁面",
};

export default function NotFound() {
  return (
    <Container className="py-20">
      <Compass className="size-10 text-orange-500" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-bold">找不到這個頁面</h1>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-300">
        這條路徑不在溫習導覽裡。返回首頁，再選擇中一或中二。
      </p>
      <Link
        href="/"
        className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-slate-900 px-5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
      >
        回到首頁
      </Link>
    </Container>
  );
}
