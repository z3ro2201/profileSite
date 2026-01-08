import { ReactNode } from "react";
import { cookies } from "next/headers";

import { verifyAuthToken, getAuthCookieName } from "@/lib/auth/jwt";

import Link from "next/link";

import { LogInIcon } from "lucide-react";

const BlogLayout = async ({ children }: { children: ReactNode }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  let isLoggedIn = false;
  let user: { id: string; email?: string; name?: string | null } | null = null;

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

  return (
    <div className="w-screen h-screen bg-white">
      <header className="absolute top-0 left-0 w-full max-h-[52px] p-2 flex justify-between uppercase items-center z-99 bg-[rgba(255,255,255,.8)] border-b-1 border-gray-200">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold underline">2er0.io</h1>
          </Link>

          <ul className="ml-4 flex gap-2">
            <li>
              <Link href="/blog/prologue">프롤로그</Link>
            </li>
            <li>
              <Link href="/blog/posts">블로그</Link>
            </li>
          </ul>
        </div>
        {isLoggedIn ? (
          <div className="flex gap-2 items-center">
            <span>안녕하세요, {user?.name ?? user?.email}</span>
            <Link href="/admin/mgmt/posts/list" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
              포스트 관리
            </Link>
            <Link href="/admin/logout" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
              로그아웃
            </Link>
          </div>
        ) : (
          <Link href="/admin/login" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
            <LogInIcon size={14} />
            관리자 로그인
          </Link>
        )}
      </header>
      <main className="pt-[52px] w-full h-full overflow-auto">{children}</main>
    </div>
  );
};

export default BlogLayout;
