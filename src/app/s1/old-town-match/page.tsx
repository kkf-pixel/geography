import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";
import { OldTownMatch } from "@/components/old-town-match";

export const metadata: Metadata = {
  title: "舊市區配對",
  description: "中一地理溫習遊戲：把舊市區名稱拖到維多利亞港地圖上的數字按鈕。",
};

export default function OldTownMatchPage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb
        items={[
          { href: "/", label: "首頁" },
          { href: "/s1", label: "中一地理" },
          { label: "舊市區配對" },
        ]}
      />
      <OldTownMatch />
    </Container>
  );
}
