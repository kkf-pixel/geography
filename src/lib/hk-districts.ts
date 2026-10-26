import { withBasePath } from "@/lib/base-path";

export type District = {
  id: number;
  name: string;
  top: string;
  left: string;
};

export const QUESTION_MAP_SRC = withBasePath("/maps/hk-18-question.jpg");
export const HINT_MAP_SRC = withBasePath("/maps/hk-18-hint.jpg");

export const DISTRICTS: District[] = [
  { id: 1, name: "元朗區", top: "26%", left: "32%" },
  { id: 2, name: "北區", top: "13%", left: "55%" },
  { id: 3, name: "大埔區", top: "26%", left: "60%" },
  { id: 4, name: "屯門區", top: "48%", left: "19%" },
  { id: 5, name: "荃灣區", top: "40%", left: "47%" },
  { id: 6, name: "沙田區", top: "40%", left: "65%" },
  { id: 7, name: "葵青區", top: "54%", left: "44%" },
  { id: 8, name: "西貢區", top: "52%", left: "82%" },
  { id: 9, name: "深水埗區", top: "55%", left: "55%" },
  { id: 10, name: "油尖旺區", top: "64%", left: "57%" },
  { id: 11, name: "九龍城區", top: "60%", left: "61%" },
  { id: 12, name: "黃大仙區", top: "53%", left: "63%" },
  { id: 13, name: "觀塘區", top: "59%", left: "69%" },
  { id: 14, name: "中西區", top: "71%", left: "52%" },
  { id: 15, name: "灣仔區", top: "71%", left: "60%" },
  { id: 16, name: "東區", top: "70%", left: "68%" },
  { id: 17, name: "南區", top: "80%", left: "62%" },
  { id: 18, name: "離島區", top: "74%", left: "40%" },
];
