import { Building2, Factory, type LucideIcon } from "lucide-react";

export type GradeId = "s1" | "s2";

export type Topic = {
  title: string;
};

export type Grade = {
  id: GradeId;
  href: "/s1" | "/s2";
  code: "S1" | "S2";
  navLabel: string;
  cardTitle: string;
  pageTitle: string;
  topic: string;
  combinedLabel: string;
  description: string;
  cta: string;
  tone: "blue" | "orange";
  icon: LucideIcon;
  topics: Topic[];
};

export const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/s1", label: "中一地理" },
  { href: "/s2", label: "中二地理" },
] as const;

export const grades: Grade[] = [
  {
    id: "s1",
    href: "/s1",
    code: "S1",
    navLabel: "中一地理",
    cardTitle: "中一地理 (S1)",
    pageTitle: "中一地理：香港的市區",
    topic: "香港的市區",
    combinedLabel: "單元一至三",
    description: "單元一至三：市區與土地利用、住宅及工業用地、商業中心區。",
    cta: "進入中一",
    tone: "blue",
    icon: Building2,
    topics: [
      { title: "香港的市區與土地利用" },
      { title: "香港的住宅及工業用地" },
      { title: "香港的商業中心區" },
    ],
  },
  {
    id: "s2",
    href: "/s2",
    code: "S2",
    navLabel: "中二地理",
    cardTitle: "中二地理 (S2)",
    pageTitle: "中二地理：工業與製造業",
    topic: "工業與製造業",
    combinedLabel: "單元一至三",
    description: "單元一至三：產業及製造業、香港製造業的區位轉移、全球轉移。",
    cta: "進入中二",
    tone: "orange",
    icon: Factory,
    topics: [
      { title: "產業及製造業" },
      { title: "香港製造業的區位轉移" },
      { title: "製造業的全球轉移" },
    ],
  },
];

export function findGrade(id: string): Grade | undefined {
  return grades.find((grade) => grade.id === id);
}
