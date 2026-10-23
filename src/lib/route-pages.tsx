import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GradeView } from "@/components/grade-view";
import { UnitView } from "@/components/unit-view";
import { findGrade, findUnit, type GradeId } from "@/lib/curriculum";

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
      title: grade.pageTitle,
      description: `${grade.pageTitle}。${grade.description}`,
    },
    Page: function GradeRoutePage() {
      return <GradeView grade={grade} />;
    },
  };
}

export function unitRoute(
  gradeId: GradeId,
  slug: string,
): {
  metadata: Metadata;
  Page: () => ReactNode;
} {
  const match = findUnit(gradeId, slug);
  if (!match) {
    throw new Error(`Missing unit ${gradeId}/${slug}`);
  }

  return {
    metadata: {
      title: match.unit.heading,
      description: `${match.grade.pageTitle}／${match.unit.heading}`,
    },
    Page: function UnitRoutePage() {
      return <UnitView grade={match.grade} unit={match.unit} />;
    },
  };
}
