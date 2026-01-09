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
    <div className="w-screen h-screen bg-gray-400/10">
      <div className="absolute w-full min-h-[300px] bg-lime-400/20"></div>
      <aside className="my-3 ms-4 fixed w-[250px] h-[calc(100%-2rem)] rounded-xl bg-white z-100 shadow-lg">
        <Link href="/blog" className="p-6 flex h-[70px] items-center text-xl font-bold">
          2ER0
        </Link>
        <hr className="my-2 h-px border-0 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
      </aside>
      <main className="absolute ml-[calc(250px+2rem)] w-[calc(100%-250px-3rem)] h-full z-50">
        <div className="w-full py-1 px-3 flex justify-between">
          <nav>
            <ol className="pt-1 flex flex-wrap">
              <li>2ER0.io</li>
              <li className="pl-1">
                <Link href="/blog/prologue">프롤로그</Link>
              </li>
              <li className="pl-1">
                <Link href="/blog/posts">블로그</Link>
              </li>
            </ol>
            <h6 className="font-weight text-black">블로그 / 첫 화면</h6>
          </nav>
          <div className="flex items-center">
            <div className="flex items-center">
              <input type="search" placeholder="검색" />
            </div>
            <ul className="flex justify-end">
              <li>
                {isLoggedIn ? (
                  <div className="flex gap-2 items-center">
                    <span>안녕하세요, {user?.name ?? user?.email}</span>
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
              </li>
              <li></li>
            </ul>
          </div>
        </div>
        <section className="w-full h-[calc(100%-60px-1rem)]">{children}</section>
      </main>
    </div>
  );
};

export default BlogLayout;
