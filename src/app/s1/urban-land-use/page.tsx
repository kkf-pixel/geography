import type { Metadata } from "next";
import { MapChallenge } from "@/components/map-challenge";
import { UnitView } from "@/components/unit-view";
import { findUnit } from "@/lib/curriculum";

const match = findUnit("s1", "urban-land-use");

if (!match) {
  throw new Error("Missing S1 unit one");
}

export const metadata: Metadata = {
  title: match.unit.heading,
  description: `${match.grade.pageTitle}／${match.unit.heading}。香港18區地圖挑戰。`,
};

export default function UrbanLandUsePage() {
  return (
    <UnitView grade={match.grade} unit={match.unit}>
      <MapChallenge />
    </UnitView>
  );
}
