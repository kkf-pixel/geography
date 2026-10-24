export type UnitId = 1 | 2 | 3;

export type SquadUnit = {
  id: UnitId;
  label: string;
  title: string;
};

export type QuizQuestion = {
  id: string;
  unit: UnitId;
  prompt: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explain: string;
};

export const SQUAD_UNITS: SquadUnit[] = [
  { id: 1, label: "單元一", title: "市區土地利用" },
  { id: 2, label: "單元二", title: "住宅及工業用地" },
  { id: 3, label: "單元三", title: "商業中心區" },
];

export const START_SQUAD = 8;
export const MAX_SQUAD = 18;
export const RUN_QUESTION_COUNT = 6;
export const BOSS_QUESTION_COUNT = 3;
export const QUIZ_SECONDS = 18;
export const BOSS_SECONDS = 10;

export const SQUAD_QUESTIONS: QuizQuestion[] = [
  {
    id: "u1-01",
    unit: 1,
    prompt: "香港市區最常見的土地利用特徵是？",
    choices: ["高密度混合用途", "低密度農地為主", "單一重工業地帶", "純低層住宅區"],
    answer: 0,
    explain: "香港市區平地少、地價高，住宅、商業和機構用地常常疊在同一區，形成高密度混合用途。",
  },
  {
    id: "u1-02",
    unit: 1,
    prompt: "下列哪一項屬於機構用地？",
    choices: ["醫院及學校", "貨櫃碼頭", "商場及寫字樓", "公園及泳灘"],
    answer: 0,
    explain: "機構用地包括學校、醫院、政府部門和社區設施，服務市民的公共功能。",
  },
  {
    id: "u1-03",
    unit: 1,
    prompt: "香港市區土地供應緊張的主要自然原因是？",
    choices: ["山多平地少", "全年降雨過多", "河流經常氾濫", "颱風令土地流失"],
    answer: 0,
    explain: "香港地形以山地丘陵為主，可供發展的平坦土地有限，因此市區用地特別緊張。",
  },
  {
    id: "u1-04",
    unit: 1,
    prompt: "填海造地主要是為了解決什麼問題？",
    choices: ["市區土地不足", "海水污染", "漁業衰退", "夏季過熱"],
    answer: 0,
    explain: "香港長期以填海增加市區可發展土地，應付房屋、道路和商業需求。",
  },
  {
    id: "u1-05",
    unit: 1,
    prompt: "伯吉斯同心圓模式中，最接近市中心的通常是？",
    choices: ["商業中心區", "高級住宅區", "新市鎮", "郊野公園"],
    answer: 0,
    explain: "同心圓模式把商業中心區放在最內圈，向外才是過渡帶、住宅區和郊區。",
  },
  {
    id: "u1-06",
    unit: 1,
    prompt: "下列哪一項最能代表休憩用地？",
    choices: ["維多利亞公園", "觀塘工廠大廈", "中環銀行區", "葵涌貨櫃碼頭"],
    answer: 0,
    explain: "休憩用地提供康樂和綠化空間，維園是市區公園的典型例子。",
  },
  {
    id: "u1-07",
    unit: 1,
    prompt: "香港市區交通用地比例偏高，主要因為？",
    choices: [
      "人口密集、通勤需求大",
      "農業運輸為主",
      "全港沒有鐵路",
      "禁止行人走路",
    ],
    answer: 0,
    explain: "大量居民每日跨區上班上學，道路、鐵路和車站佔用不少市區土地。",
  },
  {
    id: "u1-08",
    unit: 1,
    prompt: "市區更新的主要目的是？",
    choices: [
      "改善舊區環境及土地利用",
      "把全港改成農地",
      "取消公共交通",
      "遷移所有居民到離島",
    ],
    answer: 0,
    explain: "市區更新透過重建、復修和活化，改善殘舊樓宇、擠迫街道和過時的土地利用。",
  },
  {
    id: "u2-01",
    unit: 2,
    prompt: "香港公共屋邨的主要功能是？",
    choices: [
      "為低收入家庭提供房屋",
      "發展豪華別墅",
      "專門安置工廠",
      "興建甲級寫字樓",
    ],
    answer: 0,
    explain: "公屋以較低租金幫助未能負擔私人樓宇的家庭，是香港主要的公共房屋類型。",
  },
  {
    id: "u2-02",
    unit: 2,
    prompt: "沙田、屯門、將軍澳屬於哪一類規劃地區？",
    choices: ["新市鎮", "傳統漁村", "純工業邨", "郊野公園核心"],
    answer: 0,
    explain: "這些都是政府規劃的新市鎮，同時提供住宅、就業、學校和社區設施。",
  },
  {
    id: "u2-03",
    unit: 2,
    prompt: "香港傳統市區工廠大廈較常見於哪一區？",
    choices: ["觀塘、長沙灣", "中環、金鐘", "太平山山頂", "西貢郊野"],
    answer: 0,
    explain: "戰後工業多集中在觀塘、長沙灣、荃灣等市區邊緣，形成工廠大廈地帶。",
  },
  {
    id: "u2-04",
    unit: 2,
    prompt: "大埔、元朗等工業邨的區位優勢是？",
    choices: [
      "較大塊廉價土地、規劃完善",
      "位於核心商業區",
      "鄰近山頂豪宅",
      "禁止貨車進出",
    ],
    answer: 0,
    explain: "工業邨設在新界較大型地段，地價較市區低，並有道路和基礎設施配合廠房。",
  },
  {
    id: "u2-05",
    unit: 2,
    prompt: "葵青貨櫃碼頭主要屬於哪類用地？",
    choices: ["工業／運輸用地", "純住宅用地", "農業用地", "康樂用地"],
    answer: 0,
    explain: "貨櫃碼頭負責貨物裝卸和轉運，屬於港口工業與運輸用地。",
  },
  {
    id: "u2-06",
    unit: 2,
    prompt: "香港製造業自1980年代大量北移的主因是？",
    choices: [
      "內地土地及工資較低",
      "香港禁止出口",
      "香港沒有港口",
      "氣候不適合工業",
    ],
    answer: 0,
    explain: "改革開放後，珠三角土地和勞工成本較低，很多工廠把生產線遷往內地。",
  },
  {
    id: "u2-07",
    unit: 2,
    prompt: "「居者有其屋」計劃主要提供什麼房屋？",
    choices: ["資助出售房屋", "豪華酒店", "工廠宿舍", "臨時寮屋"],
    answer: 0,
    explain: "居屋以低於市價出售給合資格家庭，協助市民自置居所。",
  },
  {
    id: "u2-08",
    unit: 2,
    prompt: "新市鎮同時發展住宅與工業，主要好處是？",
    choices: [
      "減少跨區通勤、職住接近",
      "把地價抬到中環水平",
      "取消公共交通",
      "禁止工廠運作",
    ],
    answer: 0,
    explain: "職住接近可以減少居民每日長途通勤，紓緩市區擠迫和交通壓力。",
  },
  {
    id: "u3-01",
    unit: 3,
    prompt: "香港傳統商業中心區主要位於哪裡？",
    choices: ["中環", "天水圍", "大嶼山南部", "西貢市中心"],
    answer: 0,
    explain: "中環是香港最早、最核心的商業中心區，集中銀行、跨國公司和政府機構。",
  },
  {
    id: "u3-02",
    unit: 3,
    prompt: "商業中心區最顯著的特徵是？",
    choices: [
      "地價高、高樓密集、寫字樓集中",
      "農田廣闊",
      "低層村屋為主",
      "重工業廠房林立",
    ],
    answer: 0,
    explain: "CBD 土地競爭激烈，因此高樓、辦公室和商舖高度集中，地價和租金都很高。",
  },
  {
    id: "u3-03",
    unit: 3,
    prompt: "中環地價極高的主要原因是？",
    choices: [
      "交通方便、商業需求大、土地供應少",
      "遠離港口和鐵路",
      "禁止興建高樓",
      "常住人口極少且沒有公司",
    ],
    answer: 0,
    explain: "中環交通樞紐地位強、企業願意付出高租金，但可發展土地非常有限。",
  },
  {
    id: "u3-04",
    unit: 3,
    prompt: "尖沙咀除了寫字樓，還特別以什麼功能見稱？",
    choices: ["觀光、酒店及零售", "貨櫃裝卸", "重工業冶煉", "大規模公屋"],
    answer: 0,
    explain: "尖沙咀面向維港，集中酒店、商場和旅遊設施，是商業與觀光並重的核心區。",
  },
  {
    id: "u3-05",
    unit: 3,
    prompt: "把部分商業功能遷往九龍東，主要目的是？",
    choices: [
      "紓緩傳統 CBD 擠迫及高租金",
      "取消所有銀行",
      "把中環改成農地",
      "減少全港就業機會",
    ],
    answer: 0,
    explain: "商業去中心化可分散辦公室需求，減輕中環擠迫，並活化舊工業區。",
  },
  {
    id: "u3-06",
    unit: 3,
    prompt: "CBD 夜間常住人口較少，是因為？",
    choices: [
      "土地利用以辦公室及商舖為主",
      "禁止夜間照明",
      "完全沒有交通",
      "全部用地都是工廠",
    ],
    answer: 0,
    explain: "日間上班族很多，但住宅比例低，下班後街道和大樓使用量明顯下降。",
  },
  {
    id: "u3-07",
    unit: 3,
    prompt: "銅鑼灣作為商業區，最突出的功能是？",
    choices: ["零售及娛樂", "重工業", "貨櫃倉儲", "大規模農業"],
    answer: 0,
    explain: "銅鑼灣以商場、食肆和娛樂場所聞名，是香港主要的零售核心之一。",
  },
  {
    id: "u3-08",
    unit: 3,
    prompt: "金鐘一帶常見政府辦公大樓，反映 CBD 亦具有？",
    choices: ["行政功能", "純農業功能", "採礦功能", "漁業加工功能"],
    answer: 0,
    explain: "CBD 不只有私人商業，也常集中政府總部和公共行政機構。",
  },
];

export function shuffleItems<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    const other = copy[swap];
    if (current === undefined || other === undefined) {
      continue;
    }
    copy[index] = other;
    copy[swap] = current;
  }
  return copy;
}

export function pickQuestions(units: UnitId[], count: number): QuizQuestion[] {
  const selected = new Set(units);
  const pool = shuffleItems(
    SQUAD_QUESTIONS.filter((question) => selected.has(question.unit)),
  );

  if (pool.length === 0 || count <= 0) {
    return [];
  }

  const picked: QuizQuestion[] = [];
  while (picked.length < count) {
    const question = pool[picked.length % pool.length];
    if (question) {
      picked.push(shuffleChoices(question));
    }
  }
  return picked;
}

function shuffleChoices(question: QuizQuestion): QuizQuestion {
  const order = shuffleItems([0, 1, 2, 3] as const);
  const choices = order.map((slot) => question.choices[slot]);
  if (choices.length !== 4 || choices.some((choice) => choice === undefined)) {
    return question;
  }

  const answer = order.indexOf(question.answer);
  if (answer !== 0 && answer !== 1 && answer !== 2 && answer !== 3) {
    return question;
  }

  return {
    ...question,
    choices: choices as QuizQuestion["choices"],
    answer,
  };
}

export function unitLabel(unit: UnitId): string {
  return SQUAD_UNITS.find((item) => item.id === unit)?.label ?? "單元";
}
