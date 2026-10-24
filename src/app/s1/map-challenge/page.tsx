import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";
import { MapChallenge } from "@/components/map-challenge";

export const metadata: Metadata = {
  title: "香港18區尋寶大挑戰",
  description: "中一地理溫習遊戲：在無字地圖找出香港18區。",
};

export default function MapChallengePage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb
        items={[
          { href: "/", label: "首頁" },
          { href: "/s1", label: "中一地理" },
          { label: "香港18區尋寶大挑戰" },
        ]}
      />
      <MapChallenge />
    </Container>
  );
}
