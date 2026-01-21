"use client";
import type { SessionUserProp } from "@/types/Users";
import type { Category } from "@/types/Category";

import { cn } from "@/lib/cn";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";

import { LogInIcon, ChevronDown, ChevronRight } from "lucide-react";

import Link from "next/link";

const BlogSideMenu = ({ categories }: { categories: Category[] }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const [mounted, setMounted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const useMenu = mounted ? !pathname.startsWith("/blog/prologue") : true;

  useEffect(() => setMounted(true), []);

  // 현재 선택된 카테고리의 부모들을 자동으로 펼침
  useEffect(() => {
    if (!currentCategory) return;

    const findCategoryPath = (cats: Category[], targetSlug: string): number[] => {
      for (const cat of cats) {
        if (cat.slug === targetSlug) {
          return [cat.id];
        }
        if (cat.children) {
          const childPath = findCategoryPath(cat.children, targetSlug);
          if (childPath.length > 0) {
            return [cat.id, ...childPath];
          }
        }
      }
      return [];
    };

    const path = findCategoryPath(categories, currentCategory);
    setExpandedIds(new Set(path));
  }, [currentCategory, categories]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isActive = currentCategory === category.slug;

    return (
      <li key={category.id}>
        <div className={cn("flex items-center py-2 pr-2 hover:bg-gray-50 rounded transition", isActive && "bg-blue-50 font-semibold text-blue-600")} style={{ paddingLeft: `${24 + level * 16}px` }}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(category.id)} className="mr-1 p-0.5 hover:bg-gray-200 rounded" aria-label={isExpanded ? "접기" : "펼치기"}>
              {isExpanded ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-600" />}
            </button>
          ) : (
            <span className="w-5" /> // 간격 유지
          )}

          <Link href={`/blog/posts?category=${category.slug}`} className="flex-1">
            {category.name}
          </Link>
        </div>

        {hasChildren && isExpanded && <ul>{category.children!.map((child) => renderCategory(child, level + 1))}</ul>}
      </li>
    );
  };

  return (
    <aside className={cn("my-3 ms-4 w-[250px] h-[calc(100%-2rem)] rounded-xl bg-white z-100 shadow-lg overflow-y-auto", useMenu ? "fixed" : "hidden")}>
      <Link href={pathname.startsWith("/blog/prologue") ? "/blog/prologue" : "/blog/posts"} className="p-6 flex h-[70px] items-center text-xl font-bold sticky top-0 bg-white z-10">
        2ER0
      </Link>
      <hr className="my-2 h-px border-0 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
      <ul className="pb-4">{categories.map((category) => renderCategory(category))}</ul>
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
    { menuLink: "/tools", menuName: "앱" },
    { menuLink: "/rss.xml", menuName: "RSS" },
  ];

  const [scope, setScope] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setScope(searchParams.get("scope") ?? "all");
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pathname.startsWith("/tools/game/onstove/lostark/auction-chart")) return;

    const next = new URLSearchParams(searchParams.toString());

    const nextScope = scope.trim();
    const nextQ = q.trim();
    next.delete("cursor");

    if (nextScope && nextScope !== "all") next.set("scope", nextScope);
    else next.delete("scope");

    if (nextQ) next.set("q", nextQ);
    else next.delete("q");

    router.replace(`/blog/posts?${next.toString()}`, { scroll: false });
  };

  return (
    <main className={cn("absolute py-2 min-h-dvh h-[calc(100%-1.25rem)]", useMenu ? "ml-[calc(250px+2rem)] w-[calc(100%-250px-3rem)]" : "w-full", "z-50")}>
      <div className="w-full py-1 px-3 flex justify-between">
        <nav className="flex items-center">
          <ol className="flex flex-wrap">
            {menuList.map((item, key) => {
              const isActive = (() => {
                if (item.menuLink === "/") {
                  return pathname === "/";
                }

                const base = item.menuLink;

                if (pathname === base) return true;

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
                  <Link href="/admin/mgmt/dashboard" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white cursor-pointer text-sm">
                    관리자
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
