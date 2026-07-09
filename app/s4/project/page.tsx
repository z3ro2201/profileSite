import type { Metadata } from "next";
import { PROFILE } from "@/lib/profile";
import { getProjects } from "@/lib/projects";
import ProjectClient from "../_components/ProjectClient";

export const revalidate = 86400; // 프로젝트는 자주 안 바뀌니 하루 단위로

export const metadata: Metadata = {
  title: `${PROFILE.name} - 프로젝트`,
  description: `${PROFILE.nameKo}가 만든 웹/앱 프로젝트 모음입니다.`,
  alternates: { canonical: "https://2er0.io/s4/project" },
  openGraph: {
    title: `${PROFILE.name} - 프로젝트`,
    description: `${PROFILE.nameKo}가 만든 웹/앱 프로젝트 모음입니다.`,
    url: "https://2er0.io/s4/project",
    type: "website",
  },
};

export default async function Season4Project() {
  const items = await getProjects().catch((err) => {
    console.error("[s4] 프로젝트 목록 조회 실패:", err);
    return [];
  });

  return <ProjectClient items={items} />;
}
