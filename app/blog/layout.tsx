// app/blog/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SeasonShell } from "@/components/season/SeasonShell";

export const metadata: Metadata = {
  title: "2ERO - Blog",
  description: "2ER0 블로그",
  openGraph: {
    title: "2ERO - Blog",
    description: "2ER0 기술 블로그",
    type: "website",
    locale: "ko_KR",
  },
};

// 기존 사이드바+자체 헤더(BlogPublicShell/BlogSSRShell) 제거.
// 카테고리 트리 네비게이션은 BlogListClient의 "카테고리" 탭이 대체하고,
// 로그인 상태 표시/로그아웃은 관리자 페이지 쪽에만 있으면 되므로 여기선 안 씀.
// 이제 /s4, /privacy와 동일하게 SeasonShell 하나로만 렌더링.
const BlogLayout = ({ children }: { children: ReactNode }) => {
  return <SeasonShell>{children}</SeasonShell>;
};

export default BlogLayout;
