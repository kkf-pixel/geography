import { withBasePath } from "@/lib/base-path";

export type LabelAnchor = "left" | "right" | "top" | "bottom";

export type IndustrialPlace = {
  id: string;
  name: string;
  number: number;
  /** Pin center, as a percentage of the industrial-belt map. */
  x: number;
  y: number;
  label: LabelAnchor;
};

export const INDUSTRIAL_MAP_SRC = withBasePath("/maps/industrial-belts.png");

export const INDUSTRIAL_MAP_WIDTH = 1044;
export const INDUSTRIAL_MAP_HEIGHT = 484;

/**
 * Numbered pins sit on each country of the industrial-belt map.
 * Coordinates were measured against the 1044×484 source image.
 */
export const INDUSTRIAL_PLACES: IndustrialPlace[] = [
  { id: "china", name: "中國", number: 1, x: 37.55, y: 40.91, label: "left" },
  { id: "japan", name: "日本", number: 2, x: 43.49, y: 45.04, label: "right" },
  { id: "korea", name: "韓國", number: 3, x: 40.61, y: 44.21, label: "bottom" },
  { id: "thailand", name: "泰國", number: 4, x: 33.33, y: 55.37, label: "right" },
  { id: "indonesia", name: "印尼", number: 5, x: 33.24, y: 68.18, label: "right" },
  { id: "india", name: "印度", number: 6, x: 26.82, y: 55.37, label: "left" },
  { id: "uk", name: "英國", number: 7, x: 4.21, y: 28.93, label: "right" },
  { id: "usa", name: "美國", number: 8, x: 76.82, y: 39.67, label: "top" },
  { id: "mexico", name: "墨西哥", number: 9, x: 76.82, y: 53.31, label: "bottom" },
];

const PLACES_BY_ID = new Map(INDUSTRIAL_PLACES.map((place) => [place.id, place]));

export function findPlace(id: string): IndustrialPlace | undefined {
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
