import type { Metadata } from "next";
import { PROFILE } from "@/lib/profile";
import { getGithubStats, type GithubStats } from "@/lib/github";
import HomeClient from "./_components/HomeClient";

export const revalidate = 3600; // lib/github.ts의 fetch revalidate(1시간)와 맞춤

export const metadata: Metadata = {
  title: `${PROFILE.name} - 첫화면`,
  description: `${PROFILE.tagline}, ${PROFILE.nameKo}의 포트폴리오입니다.`,
  alternates: { canonical: "https://2er0.io/s4" },
  openGraph: {
    title: `${PROFILE.name} - 첫화면`,
    description: `${PROFILE.tagline}, ${PROFILE.nameKo}의 포트폴리오입니다.`,
    url: "https://2er0.io/s4",
    type: "website",
  },
};

// GitHub 장애/토큰 만료 등으로 실패해도 페이지 전체가 죽지 않도록 폴백값 사용
const FALLBACK_STATS: GithubStats = { repos: 0, prs: 0, commits: 0, languages: [] };

export default async function Season4Index() {
  const githubStats = await getGithubStats().catch((err) => {
    console.error("[s4] GitHub stats fetch 실패:", err);
    return FALLBACK_STATS;
  });

  return <HomeClient githubStats={githubStats} />;
}
