"use client";

import {
  Crosshair,
  RotateCcw,
  Shield,
  Swords,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BOSS_QUESTION_COUNT,
  BOSS_SECONDS,
  MAX_SQUAD,
  QUIZ_SECONDS,
  RUN_QUESTION_COUNT,
  SQUAD_UNITS,
  START_SQUAD,
  pickQuestions,
  unitLabel,
  type QuizQuestion,
  type UnitId,
} from "@/lib/squad-quiz";

type Phase =
  | "select"
  | "running"
  | "quiz"
  | "feedback"
  | "boss-intro"
  | "boss-quiz"
  | "result";

type Stage = "run" | "boss";
type Outcome = "victory" | "defeat";

type Toast = {
  kind: "good" | "bad";
  text: string;
};

const BUILDINGS = [
  { w: 34, h: 58 },
  { w: 22, h: 86 },
  { w: 40, h: 48 },
  { w: 18, h: 72 },
  { w: 30, h: 96 },
  { w: 26, h: 54 },
  { w: 36, h: 80 },
  { w: 20, h: 64 },
  { w: 28, h: 110 },
  { w: 24, h: 46 },
  { w: 32, h: 74 },
  { w: 18, h: 90 },
];

function outcomeMessage(outcome: Outcome, squad: number, score: number) {
  if (outcome === "defeat") {
    return "衝鋒隊兵力歸零。再選單元，重整隊伍再戰。";
  }
  if (squad >= 14 || score >= 90) {
    return "衝鋒隊大獲全勝！土地利用溫習得很扎實。";
  }
  if (score >= 60) {
    return "成功擊敗 Boss。再練一輪，隊伍會更強。";
  }
  return "險勝 Boss。多溫習住宅、工業和商業中心區，下次更穩。";
}

export function SquadRunner() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selected, setSelected] = useState<UnitId[]>([1, 2, 3]);
  const [runDeck, setRunDeck] = useState<QuizQuestion[]>([]);
  const [bossDeck, setBossDeck] = useState<QuizQuestion[]>([]);
  const [stage, setStage] = useState<Stage>("run");
  const [index, setIndex] = useState(0);
  const [squad, setSquad] = useState(START_SQUAD);
  const [firepower, setFirepower] = useState(1);
  const [score, setScore] = useState(0);
  const [corrects, setCorrects] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [dodges, setDodges] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("victory");
  const timers = useRef<number[]>([]);
  const squadRef = useRef(START_SQUAD);
  const runDeckRef = useRef<QuizQuestion[]>([]);
  const bossDeckRef = useRef<QuizQuestion[]>([]);

  const current =
    stage === "boss" ? (bossDeck[index] ?? null) : (runDeck[index] ?? null);
  const totalRun = runDeck.length || RUN_QUESTION_COUNT;
  const progressLabel =
    stage === "boss"
      ? `Boss ${Math.min(index + 1, bossDeck.length)} / ${bossDeck.length || BOSS_QUESTION_COUNT}`
      : `路程 ${Math.min(index + 1, totalRun)} / ${totalRun}`;
  const limit = stage === "boss" ? BOSS_SECONDS : QUIZ_SECONDS;
  const inPlay = phase !== "select" && phase !== "result";
  const asking = phase === "quiz" || phase === "boss-quiz";
  const showQuestion = asking || phase === "feedback";
  const bossMode =
    phase === "boss-intro" || phase === "boss-quiz" || stage === "boss";

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }

  function writeSquad(next: number) {
    squadRef.current = next;
    setSquad(next);
  }

  function toggleUnit(id: UnitId) {
    setSelected((previous) => {
      if (previous.includes(id)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((item) => item !== id);
      }
      return [...previous, id].sort((a, b) => a - b) as UnitId[];
    });
  }

  function armTimer(seconds: number, onExpire: () => void) {
    setTimeLeft(seconds);
    const started = Date.now();
    const tick = () => {
      const left = Math.max(
        0,
        seconds - Math.floor((Date.now() - started) / 1000),
      );
      setTimeLeft(left);
      if (left <= 0) {
        onExpire();
        return;
      }
      later(tick, 250);
    };
    later(tick, 250);
  }

  function startGame() {
    if (selected.length === 0) {
      return;
    }

    clearTimers();
    const deck = pickQuestions(
      selected,
      RUN_QUESTION_COUNT + BOSS_QUESTION_COUNT,
    );
    const nextRun = deck.slice(0, RUN_QUESTION_COUNT);
    const nextBoss = deck.slice(RUN_QUESTION_COUNT);
    runDeckRef.current = nextRun;
    bossDeckRef.current = nextBoss;
    setRunDeck(nextRun);
    setBossDeck(nextBoss);
    setStage("run");
    setIndex(0);
    writeSquad(START_SQUAD);
    setFirepower(1);
    setScore(0);
    setCorrects(0);
    setWrongs(0);
    setDodges(0);
    setHits(0);
    setPicked(null);
    setLocked(false);
    setToast(null);
    setOutcome("victory");
    beginRunQuestion(0);
  }

  function beginRunQuestion(nextIndex: number) {
    setStage("run");
    setIndex(nextIndex);
    setPicked(null);
    setLocked(false);
    setPhase("running");
    later(() => {
      setPhase("quiz");
      armTimer(QUIZ_SECONDS, () => resolveAnswer(false, "run", nextIndex));
    }, 1100);
  }

  function beginBossQuestion(nextIndex: number) {
    setStage("boss");
    setIndex(nextIndex);
    setPicked(null);
    setLocked(false);
    setPhase("boss-quiz");
    armTimer(BOSS_SECONDS, () => resolveAnswer(false, "boss", nextIndex));
  }

  function resolveAnswer(
    correct: boolean,
    currentStage: Stage,
    currentIndex: number,
  ) {
    clearTimers();
    setLocked(true);

    const currentRun = runDeckRef.current;
    const currentBoss = bossDeckRef.current;
    const currentSquad = squadRef.current;
    let nextSquad = currentSquad;
    if (currentStage === "boss") {
      if (correct) {
        setDodges((value) => value + 1);
        setScore((value) => value + 15);
        setToast({ kind: "good", text: "閃避成功！答啱，避開 Boss 攻擊" });
      } else {
        nextSquad = Math.max(0, currentSquad - 3);
        setHits((value) => value + 1);
        setScore((value) => Math.max(0, value - 5));
        setToast({ kind: "bad", text: "被擊中！-3 兵力" });
      }
    } else if (correct) {
      nextSquad = Math.min(MAX_SQUAD, currentSquad + 2);
      setFirepower((value) => value + 1);
      setScore((value) => value + 10);
      setCorrects((value) => value + 1);
      setToast({ kind: "good", text: "答啱！+2 兵力 · 火力升級" });
    } else {
      nextSquad = Math.max(0, currentSquad - 2);
      setFirepower((value) => Math.max(1, value - 1));
      setScore((value) => Math.max(0, value - 2));
      setWrongs((value) => value + 1);
      setToast({ kind: "bad", text: "答錯！-2 兵力 · 火力下降" });
    }

    writeSquad(nextSquad);

    if (nextSquad <= 0) {
      setOutcome("defeat");
      setPhase("result");
      return;
    }

    setPhase("feedback");
    later(() => {
      if (currentStage === "run") {
        const upcoming = currentIndex + 1;
        if (upcoming < currentRun.length) {
          beginRunQuestion(upcoming);
          return;
        }
        setStage("boss");
        setIndex(0);
        setPhase("boss-intro");
        later(() => beginBossQuestion(0), 1600);
        return;
      }

      const upcoming = currentIndex + 1;
      if (upcoming < currentBoss.length) {
        beginBossQuestion(upcoming);
        return;
      }

      setOutcome("victory");
      setPhase("result");
    }, 1400);
  }

  function handlePick(choiceIndex: number) {
    if (!asking || locked || !current) {
      return;
    }
    setPicked(choiceIndex);
    resolveAnswer(choiceIndex === current.answer, stage, index);
  }

  function resetSelect() {
    clearTimers();
    setPhase("select");
    setToast(null);
    setPicked(null);
    setLocked(false);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            SQUAD RUNNER
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            地理溫習衝鋒隊
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            第二遊戲：揀單元一至三，一路向前跑一路答香港土地利用題。答啱加兵升級，答錯減兵減火力；Boss
            攻擊前要答 QTE，答啱即可閃避。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-orange-50 px-3 text-sm font-bold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          <Swords className="size-4" aria-hidden="true" />
          遊戲二
        </span>
      </div>

      {phase === "select" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-950/60">
          <h3 className="text-lg font-bold">出發前選單元</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <li>可選一個或同時選單元一至三，題目會按你的選擇出。 </li>
            <li>跑步途中出現選擇閘門，點擊答案帶領隊伍通過。</li>
            <li>答啱加 2 兵力並提升火力；答錯減 2 兵力並降低火力。</li>
            <li>終點 Boss 會連攻三次，限時答對才能閃避。</li>
          </ol>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {SQUAD_UNITS.map((unit) => {
              const active = selected.includes(unit.id);
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  aria-pressed={active}
                  className={`press rounded-2xl border px-4 py-4 text-left ${
                    active
                      ? "border-orange-400 bg-white shadow-sm dark:border-orange-400/70 dark:bg-slate-900"
                      : "border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/40"
                  }`}
                >
                  <p className="font-display text-xs font-semibold tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {unit.label}
                  </p>
                  <p className="mt-2 text-sm font-bold">{unit.title}</p>
                  <p className="mt-2 text-xs font-medium text-orange-700 dark:text-orange-300">
                    {active ? "已選" : "點擊加入"}
                  </p>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={startGame}
            className="press mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            開始衝鋒
          </button>
        </div>
      ) : null}

      {inPlay ? (
        <div className="mt-6">
          <div className="grid gap-3 rounded-2xl border-l-4 border-orange-500 bg-slate-50 px-4 py-4 sm:grid-cols-4 dark:bg-slate-950/60">
            <HudStat icon={Users} label="兵力" value={squad} />
            <HudStat icon={Zap} label="火力" value={`Lv.${firepower}`} />
            <HudStat icon={Crosshair} label="分數" value={score} />
            <HudStat
              icon={bossMode ? Shield : Swords}
              label={bossMode ? "Boss 戰" : "前進中"}
              value={progressLabel}
            />
          </div>

          <div
            className="runner-stage mt-4"
            data-boss={bossMode ? "true" : "false"}
          >
            <div className="runner-stars" aria-hidden="true" />
            <div className="runner-scroll" aria-hidden="true">
              <BuildingRow />
              <BuildingRow />
            </div>
            <div className="runner-road" aria-hidden="true">
              <div className="runner-lane" />
            </div>
            {bossMode ? (
              <div className="runner-boss" aria-hidden="true">
                <span className="runner-boss-eye" />
                <span className="runner-boss-eye" />
              </div>
            ) : null}
            <div className="runner-squad" aria-hidden="true">
              {Array.from({ length: Math.max(squad, 0) }).map((_, soldier) => (
                <span key={soldier} className="runner-soldier" />
              ))}
            </div>
            {toast ? (
              <p
                className={`runner-toast ${toast.kind === "good" ? "runner-toast-good" : "runner-toast-bad"}`}
                aria-live="polite"
              >
                {toast.text}
              </p>
            ) : null}
            {phase === "running" ? (
              <p className="runner-banner" aria-live="polite">
                衝鋒隊向前跑…
              </p>
            ) : null}
            {phase === "boss-intro" ? (
              <p className="runner-banner runner-banner-boss" aria-live="polite">
                Boss 出現！準備閃避
              </p>
            ) : null}
          </div>

          {showQuestion && current ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {unitLabel(current.unit)}
                  {stage === "boss" ? " · QTE 閃避" : " · 選擇閘門"}
                </p>
                {asking ? (
                  <p
                    className={`text-sm font-bold ${
                      timeLeft <= 4
                        ? "text-red-600 dark:text-red-300"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    剩餘 {timeLeft} 秒
                  </p>
                ) : (
                  <p className="text-sm font-bold text-slate-500">已作答</p>
                )}
              </div>
              {asking ? (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      stage === "boss" ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${(timeLeft / limit) * 100}%` }}
                  />
                </div>
              ) : null}
              <p
                className="mt-4 text-lg font-extrabold text-balance"
                aria-live="polite"
              >
                {current.prompt}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {current.choices.map((choice, choiceIndex) => {
                  const isAnswer = choiceIndex === current.answer;
                  const isPicked = picked === choiceIndex;
                  const mark = phase === "feedback";
                  const tone = mark
                    ? isAnswer
                      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-400/70 dark:bg-emerald-500/10"
                      : isPicked
                        ? "border-red-400 bg-red-50 dark:border-red-400/70 dark:bg-red-500/10"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950";
                  return (
                    <button
                      key={choice}
                      type="button"
                      disabled={locked}
                      onClick={() => handlePick(choiceIndex)}
                      className={`press min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-slate-50 ${tone}`}
                    >
                      <span className="mr-2 font-display text-orange-600 dark:text-orange-300">
                        {["A", "B", "C", "D"][choiceIndex]}
                      </span>
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {phase === "feedback" && current ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-sm font-bold">
                {picked === current.answer ? "正確" : "再記低呢條"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {current.explain}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === "result" ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950/60">
          <Swords
            className={`mx-auto size-10 ${
              outcome === "victory" ? "text-orange-500" : "text-red-500"
            }`}
            aria-hidden="true"
          />
          <h3 className="mt-3 text-2xl font-bold">
            {outcome === "victory" ? "衝鋒完成！" : "隊伍潰散"}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {outcomeMessage(outcome, squad, score)}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ResultStat label="分數" value={score} />
            <ResultStat label="剩餘兵力" value={squad} />
            <ResultStat label="答對 / 答錯" value={`${corrects} / ${wrongs}`} />
            <ResultStat label="閃避 / 中招" value={`${dodges} / ${hits}`} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={startGame}
              className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              再跑一輪
            </button>
            <button
              type="button"
              onClick={resetSelect}
              className="press inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-bold dark:border-slate-600"
            >
              重選單元
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BuildingRow() {
  return (
    <div className="runner-buildings">
      {BUILDINGS.map((building, index) => (
        <span
          key={`${building.w}-${building.h}-${index}`}
          className="runner-building"
          style={{ width: building.w, height: building.h }}
        />
      ))}
    </div>
  );
}

function HudStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
}

function ResultStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-orange-500">{value}</p>
    </div>
  );
}
