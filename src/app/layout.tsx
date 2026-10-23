import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const themeScript = `(function(){try{var stored=localStorage.getItem("theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",theme);}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "初中地理溫習網",
    template: "%s｜初中地理溫習網",
  },
  description:
    "初中地理溫習網（Junior Form Geography Revision Platform）提供中一香港的市區，以及中二工業與製造業的課題導覽。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-Hant"
      data-theme="light"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-full focus:bg-orange-500 focus:px-4 focus:py-2 focus:font-bold focus:text-slate-950"
        >
          跳至主要內容
        </a>
        <Suspense
          fallback={
            <div className="h-16 border-b border-slate-200 bg-[#e7eef5] dark:border-slate-800 dark:bg-[#0b111a]" />
          }
        >
          <Navbar />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
