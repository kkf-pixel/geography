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
 * Numbered pins replace letters A–J on the Victoria Harbour old-town map.
 * Coordinates were measured on the 646×385 source, at each letter.
 * B has no separate letter glyph on the scan, so 2 sits above that district.
 */
export const OLD_TOWN_PLACES: OldTownPlace[] = [
  { id: "wan-chai", name: "灣仔", number: 1, x: 47.21, y: 66.88, label: "bottom" },
  { id: "ma-tau-kok", name: "馬頭角 / 土瓜灣 / 紅磡", number: 2, x: 54.49, y: 11.95, label: "right" },
  { id: "kwun-tong", name: "觀塘", number: 3, x: 79.41, y: 25.45, label: "right" },
  { id: "sham-shui-po", name: "深水埗", number: 4, x: 34.71, y: 6.23, label: "left" },
  { id: "sai-ying-pun", name: "西營盤", number: 5, x: 28.72, y: 58.31, label: "top" },
  { id: "tai-kok-tsui", name: "大角咀", number: 6, x: 31.35, y: 23.51, label: "left" },
  { id: "yau-tong", name: "油塘", number: 7, x: 87.0, y: 49.87, label: "top" },
  { id: "kennedy-town", name: "堅尼地城", number: 8, x: 18.34, y: 63.77, label: "bottom" },
  { id: "mong-kok", name: "旺角 / 油麻地", number: 9, x: 40.71, y: 24.42, label: "top" },
  { id: "shau-kei-wan", name: "筲箕灣", number: 10, x: 80.19, y: 65.71, label: "top" },
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
