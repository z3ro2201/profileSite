"use client";
import type { SessionUserProp } from "@/types/Users";
import type { Categories } from "@/types/Category";

import { cn } from "@/lib/cn";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";

import { LogInIcon } from "lucide-react";

import Link from "next/link";

const BlogSideMenu = ({ categories }: { categories: Categories[] }) => {
  const pathname = usePathname();

  const categorys = categories.sort();
  const [mounted, setMounted] = useState(false);
  const useMenu = mounted ? !pathname.startsWith("/blog/prologue") : true;
  useEffect(() => setMounted(true), []);

  return (
    <aside className={cn("my-3 ms-4 w-[250px] h-[calc(100%-2rem)] rounded-xl bg-white z-100 shadow-lg", useMenu ? "fixed" : "hidden")}>
      <Link href={pathname.startsWith("/blog/prologue") ? "/blog/prologue" : "/blog/posts"} className="p-6 flex h-[70px] items-center text-xl font-bold">
        2ER0
      </Link>
      <hr className="my-2 h-px border-0 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
      <ul>
        {categorys.map((item, key) => (
          <li key={key}>
            <Link href={`/blog/posts?category=${item.name}`} className="px-6 py-2 block">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const ContentLayout = ({ children, isLoggedIn, user }: { children: ReactNode; isLoggedIn: boolean; user: SessionUserProp }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const useMenu = !pathname.startsWith("/blog/prologue");
  const menuList = [
    { menuLink: "/", menuName: "첫 화면" },
    { menuLink: "/s3/profile", menuName: "프로필" },
    { menuLink: "/blog/prologue", menuName: "프롤로그" },
    { menuLink: "/blog/posts", menuName: "블로그" },
  ];

  const [scope, setScope] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setScope(searchParams.get("scope") ?? "all");
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const next = new URLSearchParams(searchParams.toString());

    const nextScope = scope.trim();
    const nextQ = q.trim();
    // 커서/페이지네이션 리셋
    next.delete("cursor");

    if (nextScope && nextScope !== "all") next.set("scope", nextScope);
    else next.delete("scope");

    if (nextQ) next.set("q", nextQ);
    else next.delete("q");

    // ✅ 검색 결과 페이지로 이동(새로고침 없이)
    // 이미 /blog/posts에 있든 아니든, 검색은 posts로 보내는 게 자연스러움
    router.replace(`/blog/posts?${next.toString()}`, { scroll: false });
  };

  return (
    <main className={cn("absolute py-2 h-[calc(100%-1.25rem)]", useMenu ? "ml-[calc(250px+2rem)] w-[calc(100%-250px-3rem)]" : "w-full", "z-50")}>
      <div className="w-full py-1 px-3 flex justify-between">
        <nav className="flex items-center">
          <ol className="flex flex-wrap">
            {menuList.map((item, key) => {
              const isActive = (() => {
                if (item.menuLink === "/") {
                  return pathname === "/";
                }

                const base = item.menuLink;

                // 정확히 일치
                if (pathname === base) return true;

                // 하위 경로 (/blog/posts/123)
                if (pathname.startsWith(base + "/")) return true;

                return false;
              })();

              return (
                <li className="not-last:mr-1" key={key}>
                  <Link href={item.menuLink} className={cn(isActive && "font-bold text-orange-500 underline")}>
                    {item.menuName}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="flex items-center">
          <form className="pl-6 pr-4 py-2 mr-4 flex items-center rounded-xl border-1 border-lime-800/20 focus:border-1 focus:border-lime-900/90 bg-white text-[.8rem]" onSubmit={submitSearch} method="get">
            <select className="px-1 mr-1 border-0 focus:outline-0" value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all">전체</option>
              <option value="post">글</option>
              <option value="tag">태그</option>
              <option value="category">카테고리</option>
            </select>
            <input type="search" name="q" className="inline-block mx-2 w-full border-l pl-4 border-lime-800/20 focus:outline-0" value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색" />
          </form>
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
      {children}
    </main>
  );
};

export { BlogSideMenu, ContentLayout };
