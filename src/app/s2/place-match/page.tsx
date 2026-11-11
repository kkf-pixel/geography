import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Container } from "@/components/container";
import { PlaceMatch } from "@/components/place-match";

export const metadata: Metadata = {
  title: "工業帶國家配對",
  description:
    "中二地理溫習遊戲：把國家名稱拖到世界工業帶地圖上的數字按鈕。",
};

export default function PlaceMatchPage() {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumb
        items={[
          { href: "/", label: "首頁" },
          { href: "/s2", label: "中二地理" },
          { label: "工業帶國家配對" },
        ]}
      />
      <PlaceMatch />
    </Container>
  );
}
