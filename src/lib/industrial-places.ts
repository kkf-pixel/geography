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

export const INDUSTRIAL_MAP_SRC = withBasePath("/maps/s2-world-map.png");

export const INDUSTRIAL_MAP_WIDTH = 715;
export const INDUSTRIAL_MAP_HEIGHT = 382;

/**
 * Numbered pins replace letters A–J on the 715×382 world map.
 * A=1 … I=9, and J=10.
 */
export const INDUSTRIAL_PLACES: IndustrialPlace[] = [
  { id: "indonesia", name: "印尼", number: 1, x: 33.73, y: 65.76, label: "bottom" },
  { id: "usa", name: "美國", number: 2, x: 77.63, y: 30.48, label: "right" },
  { id: "thailand", name: "泰國", number: 3, x: 32.24, y: 52.33, label: "right" },
  { id: "uk", name: "英國", number: 4, x: 9.61, y: 9.30, label: "left" },
  { id: "vietnam", name: "越南", number: 5, x: 44.27, y: 46.69, label: "right" },
  { id: "china", name: "中國", number: 6, x: 35.98, y: 33.97, label: "left" },
  { id: "japan", name: "日本", number: 7, x: 50.13, y: 36.32, label: "right" },
  { id: "india", name: "印度", number: 8, x: 28.78, y: 42.39, label: "left" },
  { id: "bangladesh", name: "孟加拉", number: 9, x: 30.00, y: 54.32, label: "left" },
  { id: "mexico", name: "墨西哥", number: 10, x: 78.74, y: 42.66, label: "bottom" },
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
