import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnitView } from "@/components/unit-view";
import { findUnit, grades } from "@/lib/curriculum";

export function generateStaticParams() {
  return grades.flatMap((grade) =>
    grade.units.map((unit) => ({
      grade: grade.id,
      unit: unit.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ grade: string; unit: string }>;
}): Promise<Metadata> {
  const { grade: gradeId, unit: slug } = await params;
  const match = findUnit(gradeId, slug);
  if (!match) {
    return { title: "找不到頁面" };
  }
  return {
    title: match.unit.heading,
    description: `${match.grade.pageTitle}／${match.unit.heading}`,
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ grade: string; unit: string }>;
}) {
  const { grade: gradeId, unit: slug } = await params;
  const match = findUnit(gradeId, slug);
  if (!match) {
    notFound();
  }
  return <UnitView grade={match.grade} unit={match.unit} />;
}
