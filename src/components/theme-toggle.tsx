"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerTheme(): Theme {
  return "light";
}

function publish() {
  listeners.forEach((listener) => listener());
}

export function applyStoredTheme() {
  try {
    const stored = localStorage.getItem("theme");
    const theme: Theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
    publish();
  } catch {
    /* Storage can be blocked; keep the theme already on the page. */
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme);
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* Storage can be blocked; the choice still applies for this visit. */
    }
    publish();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "切換至淺色模式" : "切換至暗黑模式"}
      className="press grid size-11 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-amber-200"
    >
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
    </button>
  );
}
