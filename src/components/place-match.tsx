"use client";

import { MapPinned, RotateCcw, Trophy } from "lucide-react";
import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  INDUSTRIAL_MAP_HEIGHT,
  INDUSTRIAL_MAP_SRC,
  INDUSTRIAL_MAP_WIDTH,
  INDUSTRIAL_PLACES,
  findPlace,
  shufflePlaces,
  type IndustrialPlace,
  type LabelAnchor,
} from "@/lib/industrial-places";

type Placements = Record<string, string | null>;

type DragState = {
  countryId: string;
  fromPlaceId: string | null;
  x: number;
  y: number;
};

const INITIAL_ORDER = [
  "usa",
  "thailand",
  "uk",
  "indonesia",
  "japan",
  "mexico",
  "india",
  "korea",
  "china",
];

const LABEL_CLASS: Record<LabelAnchor, string> = {
  left: "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  right: "left-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  top: "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
};

function emptyPlacements(): Placements {
  return Object.fromEntries(INDUSTRIAL_PLACES.map((place) => [place.id, null]));
}

function resultMessage(mistakes: number) {
  if (mistakes === 0) {
    return "一次就全部配對正確，你對這張工業帶地圖很熟。";
  }
  return "九個國家都放對位置了。";
}

export function PlaceMatch() {
  const titleId = useId();
  const trayRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef(new Map<string, HTMLButtonElement>());
  const skipClickRef = useRef(false);
  const [placements, setPlacements] = useState<Placements>(emptyPlacements);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[]>(INITIAL_ORDER);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [flashToken, setFlashToken] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [notice, setNotice] = useState("把國家名稱拖到地圖上的數字，或先點名稱再點數字。");

  const placedCount = INDUSTRIAL_PLACES.filter((place) => placements[place.id]).length;
  const correctCount = locked.size;
  const finished = correctCount === INDUSTRIAL_PLACES.length;
  const placedIds = new Set(
    Object.values(placements).filter((id): id is string => Boolean(id)),
  );
  const trayIds = order.filter((id) => !placedIds.has(id));

  function placeCountry(countryId: string, placeId: string) {
    if (locked.has(placeId)) {
      return;
    }
    setPlacements((current) => {
      const next = { ...current };
      for (const id of Object.keys(next)) {
        if (next[id] === countryId && !locked.has(id)) {
          next[id] = null;
        }
      }
      next[placeId] = countryId;
      return next;
    });
    setSelectedId(null);
    setNotice(`${findPlace(countryId)?.name ?? "名稱"}已放到數字 ${findPlace(placeId)?.number ?? ""}。`);
  }

  function unplace(countryId: string) {
    setPlacements((current) => {
      const next = { ...current };
      for (const id of Object.keys(next)) {
        if (next[id] === countryId && !locked.has(id)) {
          next[id] = null;
        }
      }
      return next;
    });
    setSelectedId(null);
    setNotice(`${findPlace(countryId)?.name ?? "名稱"}已放回名稱列。`);
  }

  function nearestPlace(clientX: number, clientY: number): string | null {
    let best: { id: string; distance: number } | null = null;
    for (const place of INDUSTRIAL_PLACES) {
      const element = pinRefs.current.get(place.id);
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      const distance = Math.hypot(
        clientX - (rect.left + rect.width / 2),
        clientY - (rect.top + rect.height / 2),
      );
      const limit = Math.max(rect.width, rect.height) * 0.8 + 26;
      if (distance <= limit && (!best || distance < best.distance)) {
        best = { id: place.id, distance };
      }
    }
    return best?.id ?? null;
  }

  function overTray(clientX: number, clientY: number) {
    const rect = trayRef.current?.getBoundingClientRect();
    if (!rect) {
      return false;
    }
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  function beginDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    countryId: string,
    fromPlaceId: string | null,
  ) {
    if (fromPlaceId && locked.has(fromPlaceId)) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    setDrag({ countryId, fromPlaceId, x: startX, y: startY });

    function onMove(moveEvent: PointerEvent) {
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) {
        moved = true;
      }
      setDrag({
        countryId,
        fromPlaceId,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });
    }

    function onUp(upEvent: PointerEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDrag(null);
      if (!moved) {
        return;
      }
      skipClickRef.current = true;
      queueMicrotask(() => {
        skipClickRef.current = false;
      });
      const placeId = nearestPlace(upEvent.clientX, upEvent.clientY);
      if (placeId && !locked.has(placeId)) {
        placeCountry(countryId, placeId);
        return;
      }
      if (overTray(upEvent.clientX, upEvent.clientY)) {
        unplace(countryId);
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function onPinActivate(placeId: string) {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    if (locked.has(placeId)) {
      return;
    }
    if (selectedId) {
      placeCountry(selectedId, placeId);
      return;
    }
    const occupant = placements[placeId];
    if (occupant) {
      setSelectedId(occupant);
    }
  }

  function onChipClick(countryId: string) {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    const name = findPlace(countryId)?.name ?? "名稱";
    if (selectedId === countryId) {
      setSelectedId(null);
      setNotice("已取消選擇。");
      return;
    }
    setSelectedId(countryId);
    setNotice(`已選擇${name}。點地圖上的數字，或直接拖到數字上。`);
  }

  function checkAnswers() {
    const nextLocked = new Set(locked);
    const nextPlacements = { ...placements };
    const wrong = new Set<string>();
    let unplaced = 0;

    for (const place of INDUSTRIAL_PLACES) {
      if (nextLocked.has(place.id)) {
        continue;
      }
      const countryId = nextPlacements[place.id];
      if (!countryId) {
        unplaced += 1;
        continue;
      }
      if (countryId === place.id) {
        nextLocked.add(place.id);
        continue;
      }
      nextPlacements[place.id] = null;
      wrong.add(place.id);
    }

    setPlacements(nextPlacements);
    setLocked(nextLocked);
    setWrongIds(wrong);
    setFlashToken((current) => current + 1);
    setMistakes((current) => current + wrong.size);
    setSelectedId(null);

    if (nextLocked.size === INDUSTRIAL_PLACES.length) {
      setNotice("全部配對正確。");
      return;
    }
    if (wrong.size > 0 && unplaced > 0) {
      setNotice(
        `${wrong.size} 個位置不正確，名稱已放回；還有 ${unplaced} 個空位。`,
      );
      return;
    }
    if (wrong.size > 0) {
      setNotice(`${wrong.size} 個位置不正確，名稱已放回名稱列。`);
      return;
    }
    setNotice(`正確的已鎖上。還有 ${unplaced} 個位置未放入名稱。`);
  }

  function resetGame() {
    setPlacements(emptyPlacements());
    setLocked(new Set());
    setWrongIds(new Set());
    setSelectedId(null);
    setMistakes(0);
    setOrder(shufflePlaces(INDUSTRIAL_PLACES).map((place) => place.id));
    setNotice("新的一局開始了。把國家名稱拖到對應的數字。");
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            PLACE MATCH
          </p>
          <h2 id={titleId} className="mt-1 text-2xl font-bold tracking-tight">
            工業帶國家配對
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            地圖上每個國家都有一個數字按鈕。把名稱拖到正確的數字，或先點名稱再點數字。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-orange-50 px-3 text-sm font-bold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
          <MapPinned className="size-4" aria-hidden="true" />
          九國配對
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border-l-4 border-orange-500 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950/60">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          已放上地圖
          <span className="ml-1 text-blue-700 dark:text-sky-300">
            {placedCount}/{INDUSTRIAL_PLACES.length}
          </span>
        </p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200" aria-live="polite">
          {notice}
        </p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          正確
          <span className="ml-1 text-emerald-600 dark:text-emerald-300">
            {correctCount}/{INDUSTRIAL_PLACES.length}
          </span>
          <span className="mx-2 text-slate-300">·</span>
          錯誤
          <span className="ml-1 text-orange-600 dark:text-orange-300">{mistakes}</span>
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-[#d7eef8] dark:border-slate-700">
        <div
          className="relative mx-auto w-full min-w-[960px]"
          style={{ aspectRatio: `${INDUSTRIAL_MAP_WIDTH} / ${INDUSTRIAL_MAP_HEIGHT}` }}
        >
          <img
            src={INDUSTRIAL_MAP_SRC}
            alt="世界工業帶地圖。數字按鈕標在中國、日本、韓國、泰國、印尼、印度、英國、美國和墨西哥。"
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />
          {INDUSTRIAL_PLACES.map((place) => (
            <PlacePin
              key={place.id}
              place={place}
              countryId={placements[place.id]}
              locked={locked.has(place.id)}
              wrong={wrongIds.has(place.id)}
              flashToken={flashToken}
              selected={selectedId === placements[place.id] && Boolean(placements[place.id])}
              dragging={drag?.countryId === placements[place.id]}
              pinRef={(element) => {
                if (element) {
                  pinRefs.current.set(place.id, element);
                } else {
                  pinRefs.current.delete(place.id);
                }
              }}
              onActivate={() => onPinActivate(place.id)}
              onPointerDown={(event) => {
                const occupant = placements[place.id];
                if (!occupant || locked.has(place.id)) {
                  return;
                }
                if (selectedId && selectedId !== occupant) {
                  return;
                }
                beginDrag(event, occupant, place.id);
              }}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        手機可以左右滑動地圖。名稱可以拖回下方名稱列再放一次。
      </p>

      <div
        ref={trayRef}
        className="mt-4 min-h-20 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-950/50"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
            國家名稱
          </p>
          {selectedId && placedIds.has(selectedId) && !finished ? (
            <button
              type="button"
              onClick={() => unplace(selectedId)}
              className="press text-xs font-bold text-orange-700 underline-offset-2 hover:underline dark:text-orange-300"
            >
              放回名稱列
            </button>
          ) : null}
        </div>
        {trayIds.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {trayIds.map((id) => {
              const place = findPlace(id);
              if (!place) {
                return null;
              }
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onChipClick(id)}
                    onPointerDown={(event) => beginDrag(event, id, null)}
                    aria-pressed={selectedId === id}
                    className={`press cursor-grab touch-none rounded-full border px-4 py-2 text-sm font-bold shadow-sm active:cursor-grabbing ${
                      selectedId === id
                        ? "border-orange-500 bg-orange-500 text-slate-950"
                        : "border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                    } ${drag?.countryId === id ? "opacity-40" : ""}`}
                  >
                    {place.name}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-2 text-sm text-slate-500 dark:text-slate-400">
            {finished ? "九個國家都已鎖在正確位置。" : "名稱都在地圖上了。"}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {finished ? (
          <button
            type="button"
            onClick={resetGame}
            className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            再玩一次
          </button>
        ) : (
          <button
            type="button"
            onClick={checkAnswers}
            className="press inline-flex min-h-12 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-bold text-slate-950"
          >
            核對答案
          </button>
        )}
        {!finished ? (
          <button
            type="button"
            onClick={resetGame}
            className="press inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            重新開始
          </button>
        ) : null}
      </div>

      {finished ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <Trophy className="mx-auto size-9 text-orange-500" aria-hidden="true" />
          <h3 className="mt-2 text-xl font-bold">配對完成</h3>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {resultMessage(mistakes)}
          </p>
          <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            錯誤次數
            <span className="ml-1 text-orange-600 dark:text-orange-300">{mistakes}</span>
          </p>
        </div>
      ) : null}

      {drag ? (
        <div
          className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg"
          style={{ left: drag.x, top: drag.y }}
        >
          {findPlace(drag.countryId)?.name}
        </div>
      ) : null}
    </section>
  );
}

function PlacePin({
  place,
  countryId,
  locked,
  wrong,
  flashToken,
  selected,
  dragging,
  pinRef,
  onActivate,
  onPointerDown,
}: {
  place: IndustrialPlace;
  countryId: string | null;
  locked: boolean;
  wrong: boolean;
  flashToken: number;
  selected: boolean;
  dragging: boolean;
  pinRef: (element: HTMLButtonElement | null) => void;
  onActivate: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const country = countryId ? findPlace(countryId) : undefined;
  const circleClass = locked
    ? "bg-emerald-500 text-slate-950"
    : wrong
      ? "bg-red-500 text-white"
      : "bg-orange-500 text-slate-950";

  return (
    <button
      ref={pinRef}
      type="button"
      style={{ left: `${place.x}%`, top: `${place.y}%` }}
      onClick={onActivate}
      onPointerDown={onPointerDown}
      aria-label={
        locked
          ? `數字 ${place.number}，${country?.name ?? ""}，正確`
          : country
            ? `數字 ${place.number}，已放入${country.name}`
            : `數字 ${place.number}，空位`
      }
      className={`absolute aspect-square w-[2.3%] -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-white shadow-md ${
        country ? "z-30" : "z-10"
      } ${country && !locked ? "cursor-grab" : "cursor-pointer"} ${
        selected ? "ring-2 ring-slate-950 ring-offset-2 dark:ring-white" : ""
      }`}
    >
      <span
        key={wrong ? `wrong-${flashToken}` : "steady"}
        className={`grid size-full place-items-center rounded-full text-[11px] font-black sm:text-xs ${circleClass} ${
          wrong ? "pin-shake" : ""
        }`}
      >
        {place.number}
      </span>
      {country ? (
        <span
          className={`absolute z-20 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold text-white shadow ${LABEL_CLASS[place.label]} ${
            locked ? "bg-emerald-700" : "bg-slate-900"
          } ${dragging ? "opacity-40" : ""}`}
        >
          {country.name}
        </span>
      ) : null}
    </button>
  );
}
