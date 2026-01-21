// layout/blog/BlogSSRShell.tsx
import Link from "next/link";
import type { SessionUserProp } from "@/types/Users";
import type { Category } from "@/types/Category";

/**
 * SSR 전용 블로그 레이아웃 (봇 및 JavaScript 미지원 환경)
 */
export default function BlogSSRShell({ children, categories, user, isLoggedIn, currentCategory }: { children: React.ReactNode; categories: Category[]; user: SessionUserProp; isLoggedIn: boolean; currentCategory?: string }) {
  return (
    <>
      {/* 사이드바 */}
      <aside className="my-3 ms-4 w-[250px] h-[calc(100%-2rem)] rounded-xl bg-white z-100 shadow-lg overflow-y-auto fixed">
        <Link href="/blog/posts" className="p-6 flex h-[70px] items-center text-xl font-bold sticky top-0 bg-white z-10">
          2ER0
        </Link>
        <hr className="my-2 h-px border-0 bg-gradient-to-r from-transparent via-black/40 to-transparent" />

        {/* 카테고리 목록 (SSR 버전 - 펼치기 없음) */}
        <nav className="pb-4">
          <CategoryTree categories={categories} currentCategory={currentCategory} />
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="absolute py-2 min-h-dvh h-[calc(100%-1.25rem)] ml-[calc(250px+2rem)] w-[calc(100%-250px-3rem)] z-50">
        {/* 헤더 */}
        <div className="w-full py-1 px-3 flex justify-between items-center">
          <nav className="flex items-center">
            <ol className="flex flex-wrap gap-1">
              <li>
                <Link href="/">첫 화면</Link>
              </li>
              <li>
                <Link href="/s3/profile">프로필</Link>
              </li>
              <li>
                <Link href="/blog/prologue">프롤로그</Link>
              </li>
              <li>
                <Link href="/blog/posts" className="font-bold text-orange-500">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/tools">앱</Link>
              </li>
              <li>
                <Link href="/rss.xml">RSS</Link>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-4">
            {/* 검색 폼 */}
            <form action="/blog/posts" method="get" className="pl-6 pr-4 py-2 flex items-center rounded-xl border-1 border-lime-800/20 bg-white text-[.8rem]">
              <select name="scope" className="px-1 mr-1 border-0 focus:outline-0">
                <option value="all">전체</option>
                <option value="post">글</option>
                <option value="tag">태그</option>
                <option value="category">카테고리</option>
              </select>
              <input type="search" name="q" className="inline-block mx-2 w-full border-l pl-4 border-lime-800/20 focus:outline-0" placeholder="검색" />
              <button type="submit" className="px-2 py-1 bg-black text-white rounded text-xs">
                검색
              </button>
            </form>

            {/* 사용자 정보 */}
            {isLoggedIn ? (
              <div className="flex gap-2 items-center text-sm">
                <span>안녕하세요, {user?.name ?? user?.email}</span>
                <Link href="/admin/mgmt/dashboard" className="py-2 px-4 rounded-full bg-black text-white">
                  관리자
                </Link>
                <Link href="/admin/logout" className="py-2 px-4 rounded-full bg-black text-white">
                  로그아웃
                </Link>
              </div>
            ) : (
              <Link href="/admin/login" className="py-2 px-4 flex items-center gap-2 rounded-full bg-black text-white text-sm">
                관리자 로그인
              </Link>
            )}
          </div>
        </div>

        {/* 페이지 콘텐츠 */}
        <section className="w-full h-[calc(100%-60px-1rem)]">{children}</section>
      </main>
    </>
  );
}

/**
 * 카테고리 트리 (SSR 버전)
 * 펼치기/접기 없이 모든 카테고리 표시
 */
function CategoryTree({ categories, currentCategory, level = 0 }: { categories: Category[]; currentCategory?: string; level?: number }) {
  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/blog/posts?category=${category.slug}`}
            className={`
              flex items-center py-2 pr-2 hover:bg-gray-50 rounded transition
              ${currentCategory === category.slug ? "bg-blue-50 font-semibold text-blue-600" : ""}
            `}
            style={{ paddingLeft: `${24 + level * 16}px` }}
          >
            {level > 0 && <span className="text-gray-400 mr-2">└</span>}
            {category.name}
          </Link>

          {/* 자식 카테고리 재귀 렌더링 */}
          {category.children && category.children.length > 0 && <CategoryTree categories={category.children} currentCategory={currentCategory} level={level + 1} />}
        </li>
      ))}
    </ul>
  );
}
