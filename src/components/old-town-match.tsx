"use client";

import { MapPinned, RotateCcw, Trophy } from "lucide-react";
import { useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  OLD_TOWN_MAP_HEIGHT,
  OLD_TOWN_MAP_SRC,
  OLD_TOWN_MAP_WIDTH,
  OLD_TOWN_PLACES,
  findOldTown,
  shufflePlaces,
  type LabelAnchor,
  type OldTownPlace,
} from "@/lib/old-town-places";

type Placements = Record<string, string | null>;

type DragState = {
  placeId: string;
  fromPlaceId: string | null;
  x: number;
  y: number;
};

const INITIAL_ORDER = [
  "kwun-tong",
  "wan-chai",
  "sham-shui-po",
  "yau-tong",
  "kennedy-town",
  "mong-kok",
  "sai-ying-pun",
  "shau-kei-wan",
  "tai-kok-tsui",
  "ma-tau-kok",
];

const LABEL_CLASS: Record<LabelAnchor, string> = {
  left: "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  right: "left-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  top: "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
};

function emptyPlacements(): Placements {
  return Object.fromEntries(OLD_TOWN_PLACES.map((place) => [place.id, null]));
}

function resultMessage(mistakes: number) {
  if (mistakes === 0) {
    return "一次就全部配對正確，你對維多利亞港兩岸的舊市區很熟。";
  }
  return "十個舊市區都放對位置了。";
}

export function OldTownMatch() {
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
  const [notice, setNotice] = useState("把舊市區名稱拖到數字上，放下就會立刻顯示對錯。");

  const placedCount = OLD_TOWN_PLACES.filter((place) => placements[place.id]).length;
  const correctCount = locked.size;
  const finished = correctCount === OLD_TOWN_PLACES.length;
  const placedIds = new Set(
    Object.values(placements).filter((id): id is string => Boolean(id)),
  );
  const trayIds = order.filter((id) => !placedIds.has(id));

  function placeName(nameId: string, placeId: string) {
    if (locked.has(placeId) || placements[placeId] === nameId) {
      return;
    }
    const correct = nameId === placeId;
    const name = findOldTown(nameId)?.name ?? "名稱";
    setPlacements((current) => {
      const next = { ...current };
      for (const id of Object.keys(next)) {
        if (next[id] === nameId && !locked.has(id)) {
          next[id] = null;
        }
      }
      next[placeId] = nameId;
      return next;
    });
    setWrongIds((current) => {
      const next = new Set(current);
      for (const id of Object.keys(placements)) {
        if (placements[id] === nameId) {
          next.delete(id);
        }
      }
      if (correct) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
    if (correct) {
      setLocked((current) => new Set(current).add(placeId));
      setFlashToken((current) => current + 1);
      setNotice(
        locked.size + 1 === OLD_TOWN_PLACES.length ? "全部配對正確。" : `${name}，正確。`,
      );
    } else {
      setFlashToken((current) => current + 1);
      setMistakes((current) => current + 1);
      setNotice(`${name}放錯了。`);
    }
    setSelectedId(null);
  }

  function unplace(nameId: string) {
    setPlacements((current) => {
      const next = { ...current };
      for (const id of Object.keys(next)) {
        if (next[id] === nameId && !locked.has(id)) {
          next[id] = null;
        }
      }
      return next;
    });
    setWrongIds((current) => {
      const next = new Set(current);
      for (const id of Object.keys(placements)) {
        if (placements[id] === nameId) {
          next.delete(id);
        }
      }
      return next;
    });
    setSelectedId(null);
    setNotice(`${findOldTown(nameId)?.name ?? "名稱"}已放回名稱列。`);
  }

  function nearestPlace(clientX: number, clientY: number): string | null {
    let best: { id: string; distance: number } | null = null;
    for (const place of OLD_TOWN_PLACES) {
      const element = pinRefs.current.get(place.id);
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      const distance = Math.hypot(
        clientX - (rect.left + rect.width / 2),
        clientY - (rect.top + rect.height / 2),
      );
      const limit = Math.max(rect.width, rect.height) * 0.7 + 18;
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
    nameId: string,
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
    setDrag({ placeId: nameId, fromPlaceId, x: startX, y: startY });

    function onMove(moveEvent: PointerEvent) {
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 6) {
        moved = true;
      }
      setDrag({
        placeId: nameId,
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
        placeName(nameId, placeId);
        return;
      }
      if (overTray(upEvent.clientX, upEvent.clientY)) {
        unplace(nameId);
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
      placeName(selectedId, placeId);
      return;
    }
    const occupant = placements[placeId];
    if (occupant) {
      setSelectedId(occupant);
    }
  }

  function onChipClick(nameId: string) {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    const name = findOldTown(nameId)?.name ?? "名稱";
    if (selectedId === nameId) {
      setSelectedId(null);
      setNotice("已取消選擇。");
      return;
    }
    setSelectedId(nameId);
    setNotice(`已選擇${name}。點地圖上的數字，或直接拖到數字上。`);
  }

  function resetGame() {
    setPlacements(emptyPlacements());
    setLocked(new Set());
    setWrongIds(new Set());
    setSelectedId(null);
    setMistakes(0);
    setOrder(shufflePlaces(OLD_TOWN_PLACES).map((place) => place.id));
    setNotice("新的一局開始了。放到數字上會立刻顯示對錯。");
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-orange-600 dark:text-orange-300">
            OLD TOWN MATCH
          </p>
          <h2 id={titleId} className="mt-1 text-2xl font-bold tracking-tight">
            舊市區配對
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            把名稱拖到數字上，或先點名稱再點數字。放下之後會立刻顯示對錯。
          </p>
        </div>
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-blue-50 px-3 text-sm font-bold text-blue-800 dark:bg-blue-500/15 dark:text-sky-200">
          <MapPinned className="size-4" aria-hidden="true" />
          十個舊市區
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border-l-4 border-orange-500 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950/60">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          已放上地圖
          <span className="ml-1 text-blue-700 dark:text-sky-300">
            {placedCount}/{OLD_TOWN_PLACES.length}
          </span>
        </p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200" aria-live="polite">
          {notice}
        </p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          正確
          <span className="ml-1 text-emerald-600 dark:text-emerald-300">
            {correctCount}/{OLD_TOWN_PLACES.length}
          </span>
          <span className="mx-2 text-slate-300">·</span>
          錯誤
          <span className="ml-1 text-orange-600 dark:text-orange-300">{mistakes}</span>
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-[#f4efe0] dark:border-slate-700">
        <div
          className="relative mx-auto w-full min-w-[720px]"
          style={{ aspectRatio: `${OLD_TOWN_MAP_WIDTH} / ${OLD_TOWN_MAP_HEIGHT}` }}
        >
          <img
            src={OLD_TOWN_MAP_SRC}
            alt="維多利亞港兩岸舊市區分布圖。數字按鈕標在十個舊市區。"
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />
          {OLD_TOWN_PLACES.map((place) => (
            <TownPin
              key={place.id}
              place={place}
              nameId={placements[place.id]}
              locked={locked.has(place.id)}
              wrong={wrongIds.has(place.id)}
              flashToken={flashToken}
              selected={selectedId === placements[place.id] && Boolean(placements[place.id])}
              dragging={drag?.placeId === placements[place.id]}
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
        綠色是正確並已鎖上，紅色是放錯，可以再拖去另一個數字。手機可以左右滑動地圖。
      </p>

      <div
        ref={trayRef}
        className="mt-4 min-h-20 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-950/50"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
            舊市區名稱
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
              const place = findOldTown(id);
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
                    } ${drag?.placeId === id ? "opacity-40" : ""}`}
                  >
                    {place.name}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-2 text-sm text-slate-500 dark:text-slate-400">
            {finished ? "十個舊市區都已鎖在正確位置。" : "紅色的可以再拖去正確數字。"}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={resetGame}
          className={`press inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold ${
            finished
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
              : "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
          }`}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {finished ? "再玩一次" : "重新開始"}
        </button>
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
          {findOldTown(drag.placeId)?.name}
        </div>
      ) : null}
    </section>
  );
}

function TownPin({
  place,
  nameId,
  locked,
  wrong,
  flashToken,
  selected,
  dragging,
  pinRef,
  onActivate,
  onPointerDown,
}: {
  place: OldTownPlace;
  nameId: string | null;
  locked: boolean;
  wrong: boolean;
  flashToken: number;
  selected: boolean;
  dragging: boolean;
  pinRef: (element: HTMLButtonElement | null) => void;
  onActivate: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const named = nameId ? findOldTown(nameId) : undefined;
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
          ? `數字 ${place.number}，${named?.name ?? ""}，正確`
          : named
            ? `數字 ${place.number}，已放入${named.name}，不正確`
            : `數字 ${place.number}，空位`
      }
      className={`absolute aspect-square w-[3.8%] -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-white shadow-md ${
        named ? "z-30" : "z-10"
      } ${named && !locked ? "cursor-grab" : "cursor-pointer"} ${
        selected ? "ring-2 ring-slate-950 ring-offset-2 dark:ring-white" : ""
      }`}
    >
      <span
        key={wrong ? `wrong-${flashToken}` : "steady"}
        className={`grid size-full place-items-center rounded-full text-[10px] leading-none font-black sm:text-xs ${circleClass} ${
          wrong ? "pin-shake" : ""
        }`}
      >
        {place.number}
      </span>
      {named ? (
        <span
          className={`absolute z-20 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold text-white shadow ${LABEL_CLASS[place.label]} ${
            locked ? "bg-emerald-700" : wrong ? "bg-red-600" : "bg-slate-900"
          } ${dragging ? "opacity-40" : ""}`}
        >
          {named.name}
        </span>
      ) : null}
    </button>
  );
}
