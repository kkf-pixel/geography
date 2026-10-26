export type District = {
  id: string;
  name: string;
  shortName: string;
  number: number;
  x: number;
  y: number;
  area: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
};

export const QUESTION_MAP_SRC = "/maps/hk-18-question.jpg";

export const DISTRICTS: District[] = [
  {
    id: "yuen_long",
    name: "元朗區 (Yuen Long)",
    shortName: "元朗區",
    number: 1,
    x: 32,
    y: 26,
    area: { left: 12, top: 6, right: 50, bottom: 40 },
  },
  {
    id: "north",
    name: "北區 (North)",
    shortName: "北區",
    number: 2,
    x: 55,
    y: 12,
    area: { left: 34, top: 2, right: 84, bottom: 24 },
  },
  {
    id: "tai_po",
    name: "大埔區 (Tai Po)",
    shortName: "大埔區",
    number: 3,
    x: 54,
    y: 24,
    area: { left: 42, top: 14, right: 76, bottom: 36 },
  },
  {
    id: "tuen_mun",
    name: "屯門區 (Tuen Mun)",
    shortName: "屯門區",
    number: 4,
    x: 22,
    y: 44,
    area: { left: 6, top: 26, right: 38, bottom: 56 },
  },
  {
    id: "tsuen_wan",
    name: "荃灣區 (Tsuen Wan)",
    shortName: "荃灣區",
    number: 5,
    x: 47,
    y: 38,
    area: { left: 30, top: 26, right: 58, bottom: 48 },
  },
  {
    id: "sha_tin",
    name: "沙田區 (Sha Tin)",
    shortName: "沙田區",
    number: 6,
    x: 58,
    y: 34,
    area: { left: 46, top: 22, right: 74, bottom: 46 },
  },
  {
    id: "kwai_tsing",
    name: "葵青區 (Kwai Tsing)",
    shortName: "葵青區",
    number: 7,
    x: 47,
    y: 48,
    area: { left: 36, top: 38, right: 56, bottom: 58 },
  },
  {
    id: "sai_kung",
    name: "西貢區 (Sai Kung)",
    shortName: "西貢區",
    number: 8,
    x: 72,
    y: 46,
    area: { left: 60, top: 14, right: 98, bottom: 62 },
  },
  {
    id: "sham_shui_po",
    name: "深水埗區 (Sham Shui Po)",
    shortName: "深水埗區",
    number: 9,
    x: 54,
    y: 48,
    area: { left: 46, top: 40, right: 62, bottom: 56 },
  },
  {
    id: "yau_tsim_mong",
    name: "油尖旺區 (Yau Tsim Mong)",
    shortName: "油尖旺區",
    number: 10,
    x: 54,
    y: 56,
    area: { left: 46, top: 48, right: 62, bottom: 64 },
  },
  {
    id: "kowloon_city",
    name: "九龍城區 (Kowloon City)",
    shortName: "九龍城區",
    number: 11,
    x: 57,
    y: 52,
    area: { left: 50, top: 44, right: 66, bottom: 60 },
  },
  {
    id: "wong_tai_sin",
    name: "黃大仙區 (Wong Tai Sin)",
    shortName: "黃大仙區",
    number: 12,
    x: 60,
    y: 47,
    area: { left: 52, top: 38, right: 70, bottom: 54 },
  },
  {
    id: "kwun_tong",
    name: "觀塘區 (Kwun Tong)",
    shortName: "觀塘區",
    number: 13,
    x: 64,
    y: 53,
    area: { left: 56, top: 44, right: 76, bottom: 62 },
  },
  {
    id: "central_western",
    name: "中西區 (Central & Western)",
    shortName: "中西區",
    number: 14,
    x: 51,
    y: 62,
    area: { left: 42, top: 54, right: 58, bottom: 72 },
  },
  {
    id: "wan_chai",
    name: "灣仔區 (Wan Chai)",
    shortName: "灣仔區",
    number: 15,
    x: 57,
    y: 64,
    area: { left: 48, top: 54, right: 66, bottom: 74 },
  },
  {
    id: "eastern",
    name: "東區 (Eastern)",
    shortName: "東區",
    number: 16,
    x: 63,
    y: 64,
    area: { left: 56, top: 54, right: 78, bottom: 74 },
  },
  {
    id: "southern",
    name: "南區 (Southern)",
    shortName: "南區",
    number: 17,
    x: 60,
    y: 73,
    area: { left: 46, top: 62, right: 76, bottom: 86 },
  },
  {
    id: "islands",
    name: "離島區 (Islands)",
    shortName: "離島區",
    number: 18,
    x: 38,
    y: 68,
    area: { left: 2, top: 48, right: 52, bottom: 94 },
  },
];

export function shuffleDistricts(districts: District[] = DISTRICTS): District[] {
  const next = [...districts];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function distanceTo(district: District, x: number, y: number) {
  return Math.hypot(x - district.x, y - district.y);
}

function contains(district: District, x: number, y: number) {
  const { left, top, right, bottom } = district.area;
  return x >= left && x <= right && y >= top && y <= bottom;
}

function closestDistrict(districts: District[], x: number, y: number) {
  return districts.reduce((best, district) => {
    if (distanceTo(district, x, y) < distanceTo(best, x, y)) {
      return district;
    }
    return best;
  });
}

export function hitDistrict(x: number, y: number): District {
  const inside = DISTRICTS.filter((district) => contains(district, x, y));
  if (inside.length > 0) {
    return closestDistrict(inside, x, y);
  }
  return closestDistrict(DISTRICTS, x, y);
}
