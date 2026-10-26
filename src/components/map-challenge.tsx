"use client";

import { Lightbulb, MapPinned, RotateCcw, Trophy, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { HintMapImage } from "@/components/hint-map-image";
import {
  DISTRICTS,
  QUESTION_MAP_SRC,
  hitDistrict,
  loadHitMap,
  shuffleDistricts,
  type District,
} from "@/lib/hk-districts";

type GameState = "start" | "playing" | "end";

type Feedback = {
  id: number;
  x: number;
  y: number;
  isCorrect: boolean;
};

function scoreMessage(score: number) {
  if (score >= 150) {
    return "太神啦！你簡直是香港地理活字典！";
  }
  if (score >= 100) {
    return "做得不錯！你對香港已經很熟悉了！";
  }
  return "還要再多練習哦，下次一定會更好！";
}

export function MapChallenge() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [queue, setQueue] = useState<District[]>([]);
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hintUsedForCurrent, setHintUsedForCurrent] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const hitMapRef = useRef<ImageData | null>(null);
  const titleId = useId();

  useEffect(() => {
    let cancelled = false;
    loadHitMap()
      .then((hitMap) => {
        if (!cancelled) {
          hitMapRef.current = hitMap;
        }
      })
      .catch(() => {
        if (!cancelled) {
          hitMapRef.current = null;
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showHint) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowHint(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showHint]);

  function startGame() {
    const shuffled = shuffleDistricts();
    setQueue(shuffled);
    setCurrentDistrict(shuffled[0] ?? null);
    setScore(0);
    setMistakes(0);
    setFeedbacks([]);
    setHintUsedForCurrent(false);
    setShowHint(false);
    setGameState("playing");
  }

  function nextQuestion(remaining: District[]) {
    setHintUsedForCurrent(false);
    if (remaining.length > 0) {
      setCurrentDistrict(remaining[0]);
      return;
    }
    setCurrentDistrict(null);
    setGameState("end");
  }

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    if (gameState !== "playing" || !currentDistrict || !imageRef.current) {
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;
    const clickedDistrict = hitDistrict(clickX, clickY, hitMapRef.current);
    const isCorrect = clickedDistrict?.id === currentDistrict.id;
    const feedback: Feedback = {
      id: Date.now(),
      x: clickX,
      y: clickY,
      isCorrect,
    };

    setFeedbacks((previous) => [...previous, feedback]);
    window.setTimeout(() => {
      setFeedbacks((previous) => previous.filter((item) => item.id !== feedback.id));
    }, 500);

    if (clickedDistrict && isCorrect) {
      setScore((previous) => previous + 10);
      const remaining = queue.slice(1);
      setQueue(remaining);
      nextQuestion(remaining);
      return;
    }

    setScore((previous) => Math.max(0, previous - 2));
    setMistakes((previous) => previous + 1);
  }

  function handleUseHint() {
    if (!hintUsedForCurrent) {
      setScore((previous) => Math.max(0, previous - 3));
      setHintUsedForCurrent(true);
    }
    setShowHint(true);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            MAP CHALLENGE
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            香港18區尋寶大挑戰
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            中學地理溫習小遊戲：測試你對香港行政分區的認識。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-blue-50 px-3 text-sm font-bold text-blue-800 dark:bg-blue-500/15 dark:text-sky-200">
          <MapPinned className="size-4" aria-hidden="true" />
          遊戲一 · 18 區
        </span>
      </div>

      {gameState === "start" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-950/60">
          <h3 className="text-lg font-bold">準備好了嗎？</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <li>系統會隨機顯示 18 區名稱。</li>
            <li>請在下方無字地圖中點擊正確位置。</li>
            <li>點對加 10 分，點錯扣 2 分。</li>
            <li>忘記了可使用「提示圖」，但每次扣 3 分！</li>
          </ol>
          <button
            type="button"
            onClick={startGame}
            className="press mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            開始遊戲
          </button>
        </div>
      ) : null}

      {gameState === "playing" && currentDistrict ? (
        <div className="mt-6">
          <div className="flex flex-col gap-3 rounded-2xl border-l-4 border-orange-500 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950/60">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              剩餘：
              <span className="ml-1 text-blue-700 dark:text-sky-300">{queue.length}</span>
              區
            </p>
            <p
              className="text-center text-lg font-extrabold text-slate-900 dark:text-slate-50"
              aria-live="polite"
            >
              請找出：
              <span className="ml-2 text-blue-700 dark:text-sky-300">
                {currentDistrict.name}
              </span>
            </p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              分數：
              <span className="ml-1 text-orange-600 dark:text-orange-300">{score}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseHint}
              className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-bold text-slate-950"
            >
              <Lightbulb className="size-4" aria-hidden="true" />
              偷看提示圖（扣 3 分）
            </button>
            {hintUsedForCurrent ? (
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                本題已使用提示
              </p>
            ) : null}
          </div>

          <div
            className="map-container mt-4 cursor-crosshair rounded-2xl border-8 border-white shadow-2xl dark:border-slate-800"
            onClick={handleMapClick}
          >
            <img
              ref={imageRef}
              src={QUESTION_MAP_SRC}
              alt="香港18區無字地圖"
              className="map-image block h-auto w-full cursor-crosshair drop-shadow-md"
              draggable={false}
            />
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="click-feedback"
                style={{
                  left: `${feedback.x}%`,
                  top: `${feedback.y}%`,
                  backgroundColor: feedback.isCorrect ? "#10b981" : "#ef4444",
                }}
              >
                {feedback.isCorrect ? "✓" : "✗"}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {gameState === "end" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950/60">
          <Trophy className="mx-auto size-10 text-orange-500" aria-hidden="true" />
          <h3 className="mt-3 text-2xl font-bold">挑戰完成！</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            你已經找出了全部 {DISTRICTS.length} 個行政區
          </p>
          <div className="mt-6 flex items-center justify-center gap-8">
            <div>
              <p className="text-xs text-slate-500">最終分數</p>
              <p className="text-5xl font-black text-orange-500">{score}</p>
            </div>
            <div className="h-16 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs text-slate-500">錯誤次數</p>
              <p className="text-3xl font-bold text-red-500">{mistakes}</p>
            </div>
          </div>
          <p className="mt-6 font-medium text-slate-700 dark:text-slate-200">
            {scoreMessage(score)}
          </p>
          <button
            type="button"
            onClick={startGame}
            className="press mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            再玩一次
          </button>
        </div>
      ) : null}

      {showHint ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 sm:p-6 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="press absolute top-3 right-3 grid size-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">關閉提示</span>
            </button>
            <h3 id={titleId} className="pr-12 text-xl font-bold">
              香港18區提示圖
            </h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-[#e8f4ff] dark:border-slate-700">
              <HintMapImage />
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="press inline-flex min-h-11 items-center rounded-full bg-orange-500 px-6 text-sm font-bold text-slate-950"
              >
                我記住了，繼續挑戰
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
