export type District = {
  id: string;
  name: string;
  shortName: string;
  number: number;
  x: number;
  y: number;
};

export const DISTRICTS: District[] = [
  { id: "north", name: "北區 (North)", shortName: "北區", number: 1, x: 56, y: 12 },
  { id: "yuen_long", name: "元朗區 (Yuen Long)", shortName: "元朗區", number: 2, x: 34, y: 25 },
  { id: "tai_po", name: "大埔區 (Tai Po)", shortName: "大埔區", number: 3, x: 56, y: 26 },
  { id: "tuen_mun", name: "屯門區 (Tuen Mun)", shortName: "屯門區", number: 4, x: 21, y: 48 },
  { id: "tsuen_wan", name: "荃灣區 (Tsuen Wan)", shortName: "荃灣區", number: 5, x: 45, y: 42 },
  { id: "sha_tin", name: "沙田區 (Sha Tin)", shortName: "沙田區", number: 6, x: 60, y: 37 },
  { id: "sai_kung", name: "西貢區 (Sai Kung)", shortName: "西貢區", number: 7, x: 75, y: 52 },
  { id: "kwai_tsing", name: "葵青區 (Kwai Tsing)", shortName: "葵青區", number: 8, x: 42, y: 53 },
  { id: "sham_shui_po", name: "深水埗區 (Sham Shui Po)", shortName: "深水埗區", number: 9, x: 51, y: 55 },
  { id: "wong_tai_sin", name: "黃大仙區 (Wong Tai Sin)", shortName: "黃大仙區", number: 10, x: 59, y: 53 },
  { id: "kowloon_city", name: "九龍城區 (Kowloon City)", shortName: "九龍城區", number: 11, x: 57, y: 59 },
  { id: "yau_tsim_mong", name: "油尖旺區 (Yau Tsim Mong)", shortName: "油尖旺區", number: 12, x: 53, y: 62 },
  { id: "kwun_tong", name: "觀塘區 (Kwun Tong)", shortName: "觀塘區", number: 13, x: 63, y: 60 },
  { id: "central_western", name: "中西區 (Central & Western)", shortName: "中西區", number: 14, x: 49, y: 69 },
  { id: "wan_chai", name: "灣仔區 (Wan Chai)", shortName: "灣仔區", number: 15, x: 56, y: 69 },
  { id: "eastern", name: "東區 (Eastern)", shortName: "東區", number: 16, x: 62, y: 69 },
  { id: "southern", name: "南區 (Southern)", shortName: "南區", number: 17, x: 57, y: 78 },
  { id: "islands", name: "離島區 (Islands)", shortName: "離島區", number: 18, x: 38, y: 74 },
];

export const HIT_RADIUS = 6;

export function shuffleDistricts(districts: District[] = DISTRICTS): District[] {
  const next = [...districts];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}
