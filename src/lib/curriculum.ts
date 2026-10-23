import {
  ArrowLeftRight,
  Building,
  Building2,
  Cog,
  Factory,
  Globe,
  Map,
  Store,
  type LucideIcon,
} from "lucide-react";

export type GradeId = "s1" | "s2";

export type Unit = {
  slug: string;
  label: string;
  title: string;
  heading: string;
  summary: string;
  icon: LucideIcon;
};

export type Grade = {
  id: GradeId;
  href: "/s1" | "/s2";
  code: "S1" | "S2";
  navLabel: string;
  cardTitle: string;
  pageTitle: string;
  topic: string;
  description: string;
  cta: string;
  tone: "blue" | "orange";
  icon: LucideIcon;
  units: Unit[];
};

export const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/s1", label: "中一地理" },
  { href: "/s2", label: "中二地理" },
] as const;

function createUnit(
  slug: string,
  label: string,
  title: string,
  summary: string,
  icon: LucideIcon,
): Unit {
  return {
    slug,
    label,
    title,
    heading: `${label}：${title}`,
    summary,
    icon,
  };
}

export const grades: Grade[] = [
  {
    id: "s1",
    href: "/s1",
    code: "S1",
    navLabel: "中一地理",
    cardTitle: "中一地理 (S1)",
    pageTitle: "中一地理：香港的市區",
    topic: "香港的市區",
    description: "三個單元：市區與土地利用、住宅及工業用地、商業中心區。",
    cta: "進入中一",
    tone: "blue",
    icon: Building2,
    units: [
      createUnit(
        "urban-land-use",
        "單元一",
        "香港的市區與土地利用",
        "看市區範圍，以及土地可以怎樣劃分用途。",
        Map,
      ),
      createUnit(
        "housing-industry",
        "單元二",
        "香港的住宅及工業用地",
        "比較住宅與工業用地出現在城市的哪裡。",
        Building,
      ),
      createUnit(
        "cbd",
        "單元三",
        "香港的商業中心區",
        "走進市中心，認識商業活動最集中的地方。",
        Store,
      ),
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
    description: "三個單元：產業及製造業、香港製造業的區位轉移、全球轉移。",
    cta: "進入中二",
    tone: "orange",
    icon: Factory,
    units: [
      createUnit(
        "industries",
        "單元一",
        "產業及製造業",
        "分辨不同產業，並認識製造業在做什麼。",
        Cog,
      ),
      createUnit(
        "relocation",
        "單元二",
        "香港製造業的區位轉移",
        "看看香港的工廠為什麼會換位置。",
        ArrowLeftRight,
      ),
      createUnit(
        "global-shift",
        "單元三",
        "製造業的全球轉移",
        "追蹤製造活動怎樣移到世界其他地方。",
        Globe,
      ),
    ],
  },
];

export function findGrade(id: string): Grade | undefined {
  return grades.find((grade) => grade.id === id);
}

export function findUnit(
  gradeId: string,
  slug: string,
): { grade: Grade; unit: Unit } | undefined {
  const grade = findGrade(gradeId);
  const unit = grade?.units.find((item) => item.slug === slug);
  if (!grade || !unit) {
    return undefined;
  }
  return { grade, unit };
}

export function unitNumber(grade: Grade, unit: Unit): string {
  const index = grade.units.findIndex((item) => item.slug === unit.slug);
  return String(index + 1).padStart(2, "0");
}
