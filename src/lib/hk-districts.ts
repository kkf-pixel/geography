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
export const HIT_MAP_SRC = withBasePath("/maps/hk-18-hit.png");

export const DISTRICTS: District[] = [
  { id: "yuen_long", name: "元朗區 (Yuen Long)", shortName: "元朗區", number: 1, x: 32, y: 26 },
  { id: "north", name: "北區 (North)", shortName: "北區", number: 2, x: 55, y: 13 },
  { id: "tai_po", name: "大埔區 (Tai Po)", shortName: "大埔區", number: 3, x: 60, y: 26 },
  { id: "tuen_mun", name: "屯門區 (Tuen Mun)", shortName: "屯門區", number: 4, x: 20, y: 47 },
  { id: "tsuen_wan", name: "荃灣區 (Tsuen Wan)", shortName: "荃灣區", number: 5, x: 47, y: 40 },
  { id: "sha_tin", name: "沙田區 (Sha Tin)", shortName: "沙田區", number: 6, x: 65, y: 40 },
  { id: "kwai_tsing", name: "葵青區 (Kwai Tsing)", shortName: "葵青區", number: 7, x: 44, y: 54 },
  { id: "sai_kung", name: "西貢區 (Sai Kung)", shortName: "西貢區", number: 8, x: 80, y: 50 },
  { id: "sham_shui_po", name: "深水埗區 (Sham Shui Po)", shortName: "深水埗區", number: 9, x: 55, y: 55 },
  { id: "yau_tsim_mong", name: "油尖旺區 (Yau Tsim Mong)", shortName: "油尖旺區", number: 10, x: 56, y: 63 },
  { id: "kowloon_city", name: "九龍城區 (Kowloon City)", shortName: "九龍城區", number: 11, x: 61, y: 59 },
  { id: "wong_tai_sin", name: "黃大仙區 (Wong Tai Sin)", shortName: "黃大仙區", number: 12, x: 63, y: 53 },
  { id: "kwun_tong", name: "觀塘區 (Kwun Tong)", shortName: "觀塘區", number: 13, x: 68, y: 59 },
  { id: "central_western", name: "中西區 (Central & Western)", shortName: "中西區", number: 14, x: 52, y: 71 },
  { id: "wan_chai", name: "灣仔區 (Wan Chai)", shortName: "灣仔區", number: 15, x: 60, y: 71 },
  { id: "eastern", name: "東區 (Eastern)", shortName: "東區", number: 16, x: 70, y: 70 },
  { id: "southern", name: "南區 (Southern)", shortName: "南區", number: 17, x: 62, y: 80 },
  { id: "islands", name: "離島區 (Islands)", shortName: "離島區", number: 18, x: 40, y: 74 },
];

const DISTRICTS_BY_NUMBER = new Map(DISTRICTS.map((district) => [district.number, district]));

export function shuffleDistricts(districts: District[] = DISTRICTS): District[] {
  const next = [...districts];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function loadHitMap(src: string = HIT_MAP_SRC): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not read the district hit map."));
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    };
    image.onerror = () => reject(new Error("Could not load the district hit map."));
    image.src = src;
  });
}

function sampleDistrictNumber(hitMap: ImageData, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= hitMap.width || y >= hitMap.height) {
    return 0;
  }
  const index = (y * hitMap.width + x) * 4;
  const alpha = hitMap.data[index + 3];
  const number = hitMap.data[index];
  return alpha > 0 && number >= 1 && number <= 18 ? number : 0;
}

export function hitDistrict(xPercent: number, yPercent: number, hitMap: ImageData | null): District | null {
  if (!hitMap || xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) {
    return null;
  }

  const originX = Math.round((xPercent / 100) * (hitMap.width - 1));
  const originY = Math.round((yPercent / 100) * (hitMap.height - 1));
  const radius = 3;

  for (let offset = 0; offset <= radius; offset += 1) {
    for (let dy = -offset; dy <= offset; dy += 1) {
      for (let dx = -offset; dx <= offset; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== offset) {
          continue;
        }
        const number = sampleDistrictNumber(hitMap, originX + dx, originY + dy);
        if (number) {
          return DISTRICTS_BY_NUMBER.get(number) ?? null;
        }
      }
    }
  }

  return null;
}
