"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ClientRedirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <p className="px-6 py-10 text-sm text-slate-600 dark:text-slate-300">
      正在前往課題頁…
    </p>
  );
}
