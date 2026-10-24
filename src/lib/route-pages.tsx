import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GradeView } from "@/components/grade-view";
import { findGrade, type GradeId } from "@/lib/curriculum";

export function gradeRoute(id: GradeId): {
  metadata: Metadata;
  Page: () => ReactNode;
} {
  const grade = findGrade(id);
  if (!grade) {
    throw new Error(`Missing grade ${id}`);
  }

  return {
    metadata: {
      title: `${grade.pageTitle}｜${grade.combinedLabel}`,
      description: `${grade.pageTitle}。${grade.description}`,
    },
    Page: function GradeRoutePage() {
      return <GradeView grade={grade} />;
    },
  };
}
