import type { Metadata } from "next";
import { StreetRunner } from "@/components/street-runner/street-runner";

export const metadata: Metadata = {
  title: "街道跑者",
  description:
    "夜城三線軌道跑酷：換道避開列車，跳過黃黑路障，下滑穿過霓虹拱門。",
};

export default function StreetRunnerPage() {
  return <StreetRunner />;
}
