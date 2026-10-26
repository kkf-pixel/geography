import { withBasePath } from "@/lib/base-path";

export type District = {
  id: string;
  name: string;
  shortName: string;
  number: number;
  x: number;
  y: number;
};

export const QUESTION_MAP_SRC = withBasePath("/maps/hk-18-question.jpg");

// Percent-of-image radius. Nearest district wins, so a little overlap is fine.
export const HIT_TOLERANCE = 12;

export const DISTRICTS: District[] = [
  { id: "yuen_long", name: "元朗區 (Yuen Long)", shortName: "元朗區", number: 1, x: 32, y: 26 },
  { id: "north", name: "北區 (North)", shortName: "北區", number: 2, x: 55, y: 13 },
  { id: "tai_po", name: "大埔區 (Tai Po)", shortName: "大埔區", number: 3, x: 60, y: 26 },
  { id: "tuen_mun", name: "屯門區 (Tuen Mun)", shortName: "屯門區", number: 4, x: 20, y: 47 },
  { id: "tsuen_wan", name: "荃灣區 (Tsuen Wan)", shortName: "荃灣區", number: 5, x: 47, y: 40 },
  { id: "sha_tin", name: "沙田區 (Sha Tin)", shortName: "沙田區", number: 6, x: 65, y: 40 },
  { id: "kwai_tsing", name: "葵青區 (Kwai Tsing)", shortName: "葵青區", number: 7, x: 44, y: 54 },
  { id: "sai_kung", name: "西貢區 (Sai Kung)", shortName: "西貢區", number: 8, x: 82, y: 52 },
  { id: "sham_shui_po", name: "深水埗區 (Sham Shui Po)", shortName: "深水埗區", number: 9, x: 55, y: 55 },
  { id: "yau_tsim_mong", name: "油尖旺區 (Yau Tsim Mong)", shortName: "油尖旺區", number: 10, x: 57, y: 64 },
  { id: "kowloon_city", name: "九龍城區 (Kowloon City)", shortName: "九龍城區", number: 11, x: 61, y: 60 },
  { id: "wong_tai_sin", name: "黃大仙區 (Wong Tai Sin)", shortName: "黃大仙區", number: 12, x: 63, y: 53 },
  { id: "kwun_tong", name: "觀塘區 (Kwun Tong)", shortName: "觀塘區", number: 13, x: 69, y: 59 },
  { id: "central_western", name: "中西區 (Central & Western)", shortName: "中西區", number: 14, x: 52, y: 71 },
  { id: "wan_chai", name: "灣仔區 (Wan Chai)", shortName: "灣仔區", number: 15, x: 60, y: 71 },
  { id: "eastern", name: "東區 (Eastern)", shortName: "東區", number: 16, x: 68, y: 70 },
  { id: "southern", name: "南區 (Southern)", shortName: "南區", number: 17, x: 62, y: 80 },
  { id: "islands", name: "離島區 (Islands)", shortName: "離島區", number: 18, x: 40, y: 74 },
];

export function shuffleDistricts(districts: District[] = DISTRICTS): District[] {
  const next = [...districts];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function hitDistrict(x: number, y: number): District | null {
  let clickedDistrict: District | null = null;
  let minDistance = Infinity;

  DISTRICTS.forEach((district) => {
    const distance = Math.hypot(x - district.x, y - district.y);
    if (distance < minDistance && distance <= HIT_TOLERANCE) {
      minDistance = distance;
      clickedDistrict = district;
    }
  });

  return clickedDistrict;
}

export function isCurrentDistrictHit(district: District, x: number, y: number): boolean {
  return Math.hypot(x - district.x, y - district.y) < HIT_TOLERANCE;
}
