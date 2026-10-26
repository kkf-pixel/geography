"use client";

import { Lightbulb, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DISTRICTS,
  HINT_MAP_SRC,
  QUESTION_MAP_SRC,
  type District,
} from "@/lib/hk-districts";

type FeedbackNode = {
  id: number;
  status: "correct" | "wrong";
};

export function MapChallenge() {
  const [targetDistrict, setTargetDistrict] = useState<District | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("點擊「開始遊戲」找出香港18區！");
  const [showHint, setShowHint] = useState(false);
  const [feedbackNode, setFeedbackNode] = useState<FeedbackNode | null>(null);
  const nextRoundTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (nextRoundTimer.current !== null) {
        window.clearTimeout(nextRoundTimer.current);
      }
    };
  }, []);

  function startNewRound() {
    if (nextRoundTimer.current !== null) {
      window.clearTimeout(nextRoundTimer.current);
      nextRoundTimer.current = null;
    }

    const randomDistrict =
      DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)] ?? null;
    setTargetDistrict(randomDistrict);
    setMessage(randomDistrict ? `請找出：${randomDistrict.name}` : message);
    setShowHint(false);
    setFeedbackNode(null);
  }

  function handleDistrictClick(district: District) {
    if (!targetDistrict || feedbackNode?.status === "correct") {
      return;
    }

    if (district.id === targetDistrict.id) {
      setFeedbackNode({ id: district.id, status: "correct" });
      setScore((previous) => previous + 10);
      setMessage(`答對了！那是 ${district.name}。`);
      nextRoundTimer.current = window.setTimeout(() => {
        startNewRound();
      }, 1500);
      return;
    }

    setFeedbackNode({ id: district.id, status: "wrong" });
    setScore((previous) => previous - 5);
    setMessage(`答錯了，你點擊的是 ${district.name}。請再試一次！`);
  }

  function useHint() {
    if (showHint || !targetDistrict) {
      return;
    }
    if (score < 3) {
      setMessage("分數不足，無法使用提示（需要 3 分）");
      return;
    }
    setScore((previous) => previous - 3);
    setShowHint(true);
    setMessage("提示已開啟（扣除 3 分）！");
  }

  const bannerTone =
    feedbackNode?.status === "correct"
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200"
      : feedbackNode?.status === "wrong"
        ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200"
        : "border-2 border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            MAP CHALLENGE
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-50">
            <MapPinned className="size-6 text-orange-500" aria-hidden="true" />
            香港18區尋寶
          </h2>
        </div>
        <div className="flex gap-3">
          <div className="rounded-full bg-yellow-400 px-6 py-2 text-lg font-bold text-yellow-900 shadow-md">
            分數: {score}
          </div>
          <button
            type="button"
            onClick={startNewRound}
            className="press rounded-full bg-blue-600 px-6 py-2 font-bold text-white shadow-md hover:bg-blue-500"
          >
            {targetDistrict ? "跳過此題" : "開始遊戲"}
          </button>
        </div>
      </div>

      <div
        className={`mb-6 rounded-xl p-4 text-center text-xl font-bold ${bannerTone}`}
        aria-live="polite"
      >
        {message}
      </div>

      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={useHint}
          disabled={!targetDistrict || showHint}
          className="press inline-flex items-center gap-2 rounded-lg bg-purple-100 px-6 py-2 font-semibold text-purple-700 transition-colors hover:bg-purple-200 disabled:opacity-50 dark:bg-purple-500/20 dark:text-purple-200 dark:hover:bg-purple-500/30"
        >
          <Lightbulb className="size-4" aria-hidden="true" />
          顯示地圖提示（-3 分）
        </button>
      </div>

      <div className="relative w-full overflow-hidden rounded-xl border-4 border-slate-300 bg-white dark:border-slate-600">
        <img
          src={showHint ? HINT_MAP_SRC : QUESTION_MAP_SRC}
          alt="香港18區地圖"
          className="block h-auto w-full select-none"
          draggable={false}
        />
        {DISTRICTS.map((district) => {
          const isCorrect =
            feedbackNode?.id === district.id && feedbackNode.status === "correct";
          const isWrong =
            feedbackNode?.id === district.id && feedbackNode.status === "wrong";
          return (
            <button
              key={district.id}
              type="button"
              onClick={() => handleDistrictClick(district)}
              className={`absolute z-10 flex size-8 -mt-4 -ml-4 cursor-pointer items-center justify-center rounded-full text-transparent transition-all duration-200 hover:border-2 hover:border-blue-500 hover:bg-blue-400/40 md:size-12 md:-mt-6 md:-ml-6 ${
                isCorrect
                  ? "border-4 border-green-600 bg-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                  : ""
              } ${
                isWrong
                  ? "animate-bounce border-4 border-red-600 bg-red-500/60"
                  : ""
              }`}
              style={{ top: district.top, left: district.left }}
              title={district.name}
              aria-label={district.name}
            />
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-slate-400">
        遊戲說明：根據上方提示，在地圖上點擊正確的數字區域。
      </p>
    </section>
  );
}
