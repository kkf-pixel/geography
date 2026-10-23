import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradeView } from "@/components/grade-view";
import { findGrade, grades } from "@/lib/curriculum";

export function generateStaticParams() {
  return grades.map((grade) => ({ grade: grade.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ grade: string }>;
}): Promise<Metadata> {
  const { grade: gradeId } = await params;
  const grade = findGrade(gradeId);
  if (!grade) {
    return { title: "找不到頁面" };
  }
  return {
    title: grade.pageTitle,
    description: `${grade.pageTitle}。${grade.description}`,
  };
}

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade: gradeId } = await params;
  const grade = findGrade(gradeId);
  if (!grade) {
    notFound();
  }
  return <GradeView grade={grade} />;
}
