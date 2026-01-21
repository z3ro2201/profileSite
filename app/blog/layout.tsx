// app/blog/layout.tsx
import type { SessionUserProp } from "@/types/Users";

import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { verifyAuthToken, getAuthCookieName } from "@/lib/auth/jwt";

import { BlogSideMenu, ContentLayout } from "@/layout/blog/blogClient";
import BlogSSRShell from "@/layout/blog/BlogSSRShell";
import { apiFetch } from "@/lib/apiFetch";
import type { CategoryListResponse } from "@/types/Category";
import { isBot } from "@/lib/botDetection";

import type { Metadata } from "next";
import BlogPublicShell from "@/layout/blog/BlogPublicShell";

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

const BlogLayout = async ({ children }: { children: ReactNode }) => {
  const h = await headers();
  const pathname = h.get("x-pathname");
  const userAgent = h.get("user-agent") || "";

  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  let isLoggedIn = false;
  let user: SessionUserProp = null;

  if (token) {
    try {
      const payload = await verifyAuthToken(token);
      isLoggedIn = true;
      user = {
        id: payload.sub as string,
        email: payload.email as string,
        name: payload.name as string | null,
      };
    } catch (error) {
      // 토큰 만료/위조 -> 로그인 아님
    }
  }

  // ✅ 트리 구조로 카테고리 가져오기
  const category = await apiFetch<CategoryListResponse>(`/blog/category/list?tree=1`, { cache: "no-store" });

  // ✅ 봇 감지
  const isBotRequest = isBot(userAgent);

  // 현재 카테고리 (쿼리 파라미터에서)
  const url = h.get("x-url");
  const currentCategory = url ? new URL(url).searchParams.get("category") : undefined;

  return (
    <>
      <div className="absolute w-full min-h-[300px] bg-lime-400/20 z-[-1]"></div>
      <div className="relative min-h-screen w-screen min-h-dvh overflow-auto">
        {isBotRequest ? (
          // ✅ SSR 버전 (봇 및 JavaScript 미지원)
          <BlogSSRShell user={user} isLoggedIn={isLoggedIn} categories={category?.categories ?? []} currentCategory={currentCategory ?? undefined}>
            {children}
          </BlogSSRShell>
        ) : (
          // ✅ CSR 버전 (일반 사용자)
          <>
            <BlogPublicShell user={user} isLoggedIn={isLoggedIn} categories={category?.categories ?? []}>
              {children}
            </BlogPublicShell>
          </>
        )}

        {/* noscript 대체 콘텐츠 */}
        <noscript>
          <div className="fixed inset-0 bg-yellow-50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
              <h2 className="text-xl font-bold mb-4">JavaScript가 비활성화되어 있습니다</h2>
              <p className="text-gray-600 mb-4">이 사이트는 JavaScript를 사용합니다. 최상의 경험을 위해 JavaScript를 활성화해주세요.</p>
              <a href="/blog/posts" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                기본 버전으로 계속하기
              </a>
            </div>
          </div>
        </noscript>
      </div>
    </>
  );
};

export default BlogLayout;
