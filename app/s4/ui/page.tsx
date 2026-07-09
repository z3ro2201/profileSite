import type { Metadata } from "next";
import { PROFILE } from "@/lib/profile";
import UIClient from "../_components/UIClient";

export const metadata: Metadata = {
  title: `${PROFILE.name} - UI Components`,
  description: `${PROFILE.nameKo} 포트폴리오 사이트에서 쓰는 UI 컴포넌트 쇼케이스입니다.`,
  alternates: { canonical: "https://2er0.io/s4/ui" },
  robots: { index: false, follow: true },
};

export default function Season4UI() {
  return <UIClient />;
}
