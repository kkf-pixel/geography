import Image from "next/image";
import hintMap from "@/assets/maps/hk-18-hint.jpg";

export function HintMapImage() {
  return (
    <Image
      src={hintMap}
      alt="香港18區彩色提示地圖"
      className="h-auto w-full"
      sizes="(max-width: 896px) 100vw, 896px"
      priority
    />
  );
}
