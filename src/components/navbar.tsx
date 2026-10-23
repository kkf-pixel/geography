"use client";

import { Compass, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/curriculum";
import { Container } from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";

function isCurrent(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClass(active: boolean, mobile = false) {
  const layout = mobile
    ? "min-h-14 w-full justify-start rounded-2xl px-4 text-base"
    : "min-h-11 rounded-full px-4 text-sm";

  const tone = active
    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
    : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800";

  return `press inline-flex items-center font-medium ${layout} ${tone}`;
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#e7eef5]/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b111a]/85">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="press flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl"
        >
          <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-orange-400 dark:bg-white dark:text-slate-900">
            <Compass className="size-5" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-orange-500 ring-2 ring-[#e7eef5] dark:ring-[#0b111a]" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-bold sm:text-base">
              初中地理溫習網
            </span>
            <span className="font-display hidden text-[11px] font-medium tracking-[0.14em] text-slate-500 sm:block dark:text-slate-400">
              JUNIOR GEOGRAPHY
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden md:block" aria-label="主要">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isCurrent(link.href, pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={linkClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            className="press grid size-11 place-items-center rounded-full border border-slate-300 bg-white text-slate-800 md:hidden dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            aria-expanded={open}
            aria-controls={open ? "mobile-nav" : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
            <span className="sr-only">{open ? "關閉選單" : "開啟選單"}</span>
          </button>

          <ThemeToggle />
        </div>
      </Container>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="手機選單"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-2">
            {navLinks.map((link) => {
              const active = isCurrent(link.href, pathname);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={linkClass(active, true)}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
