import type { Metadata } from "next";
import { PROFILE } from "@/lib/profile";
import ProfileClient from "../_components/ProfileClient";

export const metadata: Metadata = {
  title: `${PROFILE.name} - 프로필`,
  description: `풀스택 개발자 ${PROFILE.nameKo}의 경력과 기술 스택을 소개합니다.`,
  alternates: { canonical: "https://2er0.io/s4/profile" },
  openGraph: {
    title: `${PROFILE.name} - 프로필`,
    description: `풀스택 개발자 ${PROFILE.nameKo}의 경력과 기술 스택을 소개합니다.`,
    url: "https://2er0.io/s4/profile",
    type: "profile",
  },
};

export default function Season4Profile() {
  return <ProfileClient />;
}
