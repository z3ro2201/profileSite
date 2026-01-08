import { ReactNode } from "react";
import { cookies } from "next/headers";

import { verifyAuthToken, getAuthCookieName } from "@/lib/auth/jwt";

import Link from "next/link";
import { LogInIcon } from "lucide-react";

const AdminPageLayout = async ({ children }: { children: ReactNode }) => {
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
    <div className="mr-2 flex w-full h-screen flex-col">
      <header className="flex w-full h-[52px] justify-between items-center border-b border-gray-200">
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
            <span>안녕하세요, {user?.name ?? user?.email}</span>{" "}
            <Link href="/" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
              사이트 메인
            </Link>
            <Link href="/blog/posts" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
              블로그 홈
            </Link>
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
      <div className="flex h-[calc(100%-52px)]">
        <aside className="w-[200px] h-full flex flex-col sm:border-r border-gray-200">
          <Link href="/admin/mgmt/users/me">내 정보</Link>
          <Link href="/admin/mgmt/posts/write">글 작성</Link>
          <Link href="/admin/mgmt/posts/list">글 관리</Link>
        </aside>
        <section className="w-10/12 pl-4 pr-2 pt-4 pb-2">{children}</section>
      </div>
    </div>
  );
};
export default AdminPageLayout;
