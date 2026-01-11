import type { SessionUserProp } from "@/types/Users";

import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { verifyAuthToken, getAuthCookieName } from "@/lib/auth/jwt";

import { BlogSideMenu, ContentLayout } from "@/layout/blog/blogClient";
import { apiFetch } from "@/lib/apiFetch";
import type { CategoryListResponse, Categories } from "@/types/Category";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2ERO - Blog",
  description: "2ER0 블로그",
};

const BlogLayout = async ({ children }: { children: ReactNode }) => {
  const h = await headers();
  const pathname = h.get("x-pathname");

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

  const category = await apiFetch<CategoryListResponse>(`/blog/category/list`, { cache: "force-cache" });

  return (
    <div className="relative min-h-screen w-screen  min-h-dvh overflow-auto">
      <div className="absolute w-full min-h-[300px] bg-lime-400/20"></div>

      <BlogSideMenu categories={category?.categories ?? []} />
      <ContentLayout isLoggedIn={isLoggedIn} user={user}>
        <section className="w-full h-[calc(100%-60px-1rem)]">{children}</section>
      </ContentLayout>
    </div>
  );
};

export default BlogLayout;
