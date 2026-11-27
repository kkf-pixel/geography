"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { mountRunner, type Hud, type RunnerApi } from "./engine";

const initialHud: Hud = {
  phase: "ready",
  score: 0,
  best: 0,
  distance: 0,
  multOn: false,
  multLeft: 0,
  muted: false,
  newBest: false,
  action: "run",
};

export function StreetRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<RunnerApi | null>(null);
  const hudRef = useRef<Hud>(initialHud);
  const swipeRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const [hud, setHud] = useState<Hud>(initialHud);
  const [fx, setFx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hudRef.current = hud;
  }, [hud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let api: RunnerApi | null = null;
    try {
      api = mountRunner(canvas, {
        onHud: setHud,
        onFx: setFx,
      });
      apiRef.current = api;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "無法啟動遊戲";
      queueMicrotask(() => setError(message));
    }

    return () => {
      api?.dispose();
      apiRef.current = null;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!fx) return;
    const timer = window.setTimeout(() => setFx(null), 900);
    return () => window.clearTimeout(timer);
  }, [fx]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const control =
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === " " ||
        key === "a" ||
        key === "d" ||
        key === "w" ||
        key === "s" ||
        key === "enter";
      if (!control) return;
      event.preventDefault();
      if (event.repeat) return;
      const api = apiRef.current;
      if (!api) return;
      const phase = hudRef.current.phase;
      if (phase !== "running") {
        if (event.key === " " || key === "enter") api.start();
        return;
      }
      if (event.key === "ArrowLeft" || key === "a") api.input("left");
      else if (event.key === "ArrowRight" || key === "d") api.input("right");
      else if (event.key === "ArrowUp" || key === "w" || event.key === " ") api.input("jump");
      else if (event.key === "ArrowDown" || key === "s") api.input("slide");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function press(action: "left" | "right" | "jump" | "slide") {
    const api = apiRef.current;
    if (!api) return;
    if (hudRef.current.phase !== "running") api.start();
    api.input(action);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a")) return;
    swipeRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 28) return;
    if (Math.abs(dx) > Math.abs(dy)) press(dx > 0 ? "right" : "left");
    else press(dy > 0 ? "slide" : "jump");
  }

  const scoreLabel = String(hud.score).padStart(4, "0");

  return (
    <div
      className="fixed inset-0 z-[80] touch-none bg-[#070b16] text-white select-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeRef.current = null;
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
        aria-hidden="true"
      />

      {hud.phase !== "ready" ? (
        <div className="pointer-events-none absolute top-4 left-4 border-[3px] border-[#e7edf5] bg-[#121826]/92 px-3 py-2 shadow-[4px_4px_0_#05070c]">
          <p className="font-display text-lg leading-none font-bold text-[#ffe56a]">
            得分：{scoreLabel}
          </p>
          <p className="mt-1 text-sm text-slate-200">距離 {hud.distance} m</p>
          {hud.multOn ? (
            <p className="font-display mt-1 text-sm font-bold text-orange-300">
              x2 · {hud.multLeft}s
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className="absolute top-4 right-4 border-[3px] border-[#e7edf5] bg-[#121826] px-3 py-2 text-sm font-bold shadow-[4px_4px_0_#05070c]"
        aria-pressed={hud.muted}
        onClick={() => apiRef.current?.setMuted(!hud.muted)}
      >
        {hud.muted ? "音效關" : "音效開"}
      </button>

      {fx ? (
        <p className="font-display pointer-events-none absolute top-[16%] left-1/2 -translate-x-1/2 text-5xl font-black tracking-wide text-orange-400 drop-shadow-[0_4px_0_#2a1000] sm:text-7xl">
          {fx}
        </p>
      ) : null}

      {error ? (
        <div className="absolute inset-0 grid place-items-center bg-[#070b16] p-6 text-center">
          <p>{error}</p>
        </div>
      ) : null}

      {hud.phase === "ready" ? (
        <div className="absolute top-20 left-4 w-[min(92vw,22rem)] border-[3px] border-[#e7edf5] bg-[#121826]/88 p-5 shadow-[6px_6px_0_#05070c]">
          <p className="font-display text-xs font-bold tracking-[0.22em] text-orange-300">
            NIGHT RAILS
          </p>
          <h1 className="mt-1 text-3xl font-black">街道跑者</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            三條軌道一直往前。A / D 或方向鍵換道，空白鍵跳躍，S 下滑。手機可直接滑動。
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            跳過黃黑路障，滑過霓虹拱門，換道躲開列車。金幣加分，拾取 x2 後 8 秒得分加倍。
          </p>
          <p className="font-display mt-4 text-sm font-bold text-[#ffe56a]">
            最高分 {hud.best}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 items-center bg-orange-500 px-6 text-base font-black text-slate-950"
            onClick={(event) => {
              event.currentTarget.blur();
              apiRef.current?.start();
            }}
          >
            開始跑
          </button>
        </div>
      ) : null}

      {hud.phase === "crashed" ? (
        <div className="absolute bottom-24 left-1/2 w-[min(92vw,24rem)] -translate-x-1/2 border-[3px] border-[#e7edf5] bg-[#121826]/92 p-5 text-center shadow-[6px_6px_0_#05070c]">
          <h2 className="text-3xl font-black text-orange-400">撞上了！</h2>
          <p className="mt-3 text-lg">
            這次得分 <span className="font-display font-bold text-[#ffe56a]">{hud.score}</span>
          </p>
          <p className="mt-1 text-sm text-slate-300">奔跑距離 {hud.distance} m</p>
          <p className="mt-1 text-sm text-slate-300">最高分 {hud.best}</p>
          {hud.newBest ? <p className="mt-2 font-black text-orange-300">新高分！</p> : null}
          <button
            type="button"
            className="mt-4 inline-flex min-h-12 items-center bg-orange-500 px-6 font-black text-slate-950"
            onClick={() => apiRef.current?.start()}
          >
            再跑一次
          </button>
        </div>
      ) : null}

      {hud.phase === "running" ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-3">
          <Control label="左" hint="向左換道" onPress={() => press("left")} />
          <Control label="跳" hint="跳躍" onPress={() => press("jump")} />
          <Control label="滑" hint="下滑" onPress={() => press("slide")} />
          <Control label="右" hint="向右換道" onPress={() => press("right")} />
        </div>
      ) : null}

      <Link
        href="/"
        className="absolute top-16 right-4 text-sm font-bold text-slate-300 underline decoration-slate-500 underline-offset-4"
      >
        返回首頁
      </Link>
    </div>
  );
}

function Control({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={hint}
      className="min-h-14 min-w-16 border-[3px] border-[#e7edf5] bg-[#121826]/92 px-3 text-lg font-black shadow-[3px_3px_0_#05070c]"
      onClick={onPress}
    >
      {label}
    </button>
  );
}
