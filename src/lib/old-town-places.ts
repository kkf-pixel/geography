import { withBasePath } from "@/lib/base-path";

export type LabelAnchor = "left" | "right" | "top" | "bottom";

export type OldTownPlace = {
  id: string;
  name: string;
  /** Number that replaces the letter on the textbook map. A is 1, B is 2, through J as 10. */
  number: number;
  /** Pin center, as a percentage of the 646×385 old-urban map. */
  x: number;
  y: number;
  label: LabelAnchor;
};

export const OLD_TOWN_MAP_SRC = withBasePath("/maps/old-urban-areas.png");

export const OLD_TOWN_MAP_WIDTH = 646;
export const OLD_TOWN_MAP_HEIGHT = 385;

/**
 * Numbered pins sit on the red old-town districts of the 646×385 map.
 * Each center is the red area for that place, not a label beside it.
 */
export const OLD_TOWN_PLACES: OldTownPlace[] = [
  { id: "wan-chai", name: "灣仔", number: 1, x: 44.13, y: 69.92, label: "bottom" },
  { id: "ma-tau-kok", name: "馬頭角 / 土瓜灣 / 紅磡", number: 2, x: 53.89, y: 28.57, label: "right" },
  { id: "kwun-tong", name: "觀塘", number: 3, x: 76.25, y: 28.94, label: "right" },
  { id: "sham-shui-po", name: "深水埗", number: 4, x: 36.18, y: 14.05, label: "left" },
  { id: "sai-ying-pun", name: "西營盤", number: 5, x: 24.69, y: 60.91, label: "bottom" },
  { id: "tai-kok-tsui", name: "大角咀", number: 6, x: 36.75, y: 22.29, label: "left" },
  { id: "yau-tong", name: "油塘", number: 7, x: 83.42, y: 53.04, label: "top" },
  { id: "kennedy-town", name: "堅尼地城", number: 8, x: 18.79, y: 62.7, label: "bottom" },
  { id: "mong-kok", name: "旺角 / 油麻地", number: 9, x: 40.74, y: 22.88, label: "right" },
  { id: "shau-kei-wan", name: "筲箕灣", number: 10, x: 77.83, y: 68.42, label: "top" },
];

const PLACES_BY_ID = new Map(OLD_TOWN_PLACES.map((place) => [place.id, place]));

export function findOldTown(id: string): OldTownPlace | undefined {
  return PLACES_BY_ID.get(id);
}

export function shufflePlaces<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }
  return next;
}
