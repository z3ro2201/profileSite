"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Globe,
  Terminal,
  Zap,
  Layers,
  Database,
  Cpu,
  FileText,
  Search,
  X,
} from "lucide-react";
import type { PublicPostListItem } from "@/types/Posts";
import type { Category } from "@/types/Category";
import { TEAL, mono } from "@/lib/nav-shared";
import { serif } from "@/app/s4/_lib/theme";

type TagWithCount = { id: number; slug: string; name: string; count: number };

const stripAndTrim = (html: string | null | undefined, maxLen = 90) => {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
};

// 태그 이름으로 아이콘을 골라줌 (장식용. 모르는 태그는 기본 아이콘)
const TAG_ICONS: Record<string, React.ElementType> = {
  "Next.js": Globe,
  React: Zap,
  TypeScript: Terminal,
  CSS: Layers,
  PostgreSQL: Database,
  MariaDB: Database,
  MySQL: Database,
  Prisma: Database,
};
const iconForTag = (tagName?: string) => TAG_ICONS[tagName ?? ""] ?? Cpu;

export default function BlogListClient({
  posts,
  categories,
  tags,
  activeTag,
  activeCategory,
  activeQuery,
}: {
  posts: PublicPostListItem[];
  categories: Category[];
  tags: TagWithCount[];
  activeTag?: string;
  activeCategory?: string;
  activeQuery?: string;
}) {
  const [blogView, setBlogView] = useState<"posts" | "tags" | "categories">("posts");
  const [drilldownCategory, setDrilldownCategory] = useState<Category | null>(null);

  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQ("");
  };

  const submitSearch = () => {
    const q = searchQ.trim();
    if (!q) return;
    closeSearch();
    router.push(`/blog?q=${encodeURIComponent(q)}`);
  };

  // "/" 로 검색창 열기, Esc로 닫기 (입력창에 포커스 중일 땐 "/" 무시)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !searchOpen && !inInput) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (searchOpen && e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 40);
  }, [searchOpen]);

  const topCategories = categories.filter((c) => c.depth === 0);

  return (
    <div>
      {/* ── search modal overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "rgba(22,22,20,0.96)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <Search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="포스트 검색… (Enter로 이동)"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                style={mono}
              />
              <button
                type="button"
                onClick={closeSearch}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={15} />
              </button>
            </form>

            <div
              className="flex items-center gap-3 px-4 py-2.5 border-t flex-wrap"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
              {[
                { key: "/", label: "검색창 열기" },
                { key: "Enter", label: "검색" },
                { key: "Esc", label: "닫기" },
              ].map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1.5">
                  <kbd
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "monospace",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {key}
                  </kbd>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)", ...mono }}>
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── page header ── */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: TEAL, ...mono }}>
            블로그
          </p>
          {activeQuery ? (
            <h2 className="text-3xl sm:text-4xl font-light leading-tight" style={serif}>
              &ldquo;{activeQuery}&rdquo; 검색 결과
            </h2>
          ) : (
            <h2 className="text-4xl sm:text-5xl font-light leading-tight" style={serif}>
              배운 것들을
              <br />
              <span className="italic">기록합니다.</span>
            </h2>
          )}
        </div>

        {/* search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-150 flex-shrink-0"
          style={mono}
        >
          <Search size={13} />
          <span className="hidden sm:inline">검색</span>
          <kbd
            className="hidden sm:inline text-[9px] px-1 py-0.5 rounded ml-0.5"
            style={{ background: "var(--secondary)", border: "1px solid var(--border)", fontFamily: "monospace" }}
          >
            /
          </kbd>
        </button>
      </div>

      {/* ── view tab bar ── */}
      <div className="flex items-center gap-1 mb-7 border-b border-border">
        {(
          [
            ["posts", "글 목록"],
            ["tags", "태그"],
            ["categories", "카테고리"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => {
              setBlogView(v);
              setDrilldownCategory(null);
            }}
            className="px-4 py-2.5 text-sm transition-colors relative"
            style={
              blogView === v ? { color: "var(--foreground)", fontWeight: 500 } : { color: "var(--muted-foreground)" }
            }
          >
            {label}
            {blogView === v && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: TEAL }} />
            )}
          </button>
        ))}
      </div>

      {/* ── 글 목록 view ── */}
      {blogView === "posts" && (
        <>
          {/* 태그 필터 pills (실제 이동 — searchParams 기반이라 SEO/공유 안 깨짐) */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
            <Link
              href="/blog"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0"
              style={
                !activeTag
                  ? { background: TEAL, color: "#fff", ...mono }
                  : { background: "var(--secondary)", color: "var(--muted-foreground)", ...mono }
              }
            >
              전체
            </Link>
            {tags.map((t) => (
              <Link
                key={t.slug}
                href={`/blog?tag=${encodeURIComponent(t.slug)}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-150 flex-shrink-0"
                style={
                  activeTag === t.slug
                    ? { background: TEAL, color: "#fff", ...mono }
                    : { background: "var(--secondary)", color: "var(--muted-foreground)", ...mono }
                }
              >
                {t.name}
                <span className="text-[9px] opacity-70">{t.count}</span>
              </Link>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {posts.map((post) => {
                const Icon = iconForTag(post.tags[0]?.name);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/posts/view/${post.id}`}
                    className="group rounded-2xl p-5 flex flex-col justify-between text-left overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{ background: "var(--secondary)", minHeight: 220 }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                        {post.category && (
                          <span className="text-[10px] font-medium text-muted-foreground" style={mono}>
                            {post.category.name}
                          </span>
                        )}
                        {post.tags.map((tag) => (
                          <span key={tag.slug} className="text-[10px] text-muted-foreground" style={mono}>
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                      <h3
                        className="text-xl font-semibold leading-snug text-foreground group-hover:text-[#23c6a9] transition-colors"
                        style={serif}
                      >
                        {post.title}
                      </h3>
                      {post.contentHtml && (
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                          {stripAndTrim(post.contentHtml)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end justify-between mt-6">
                      <span className="text-xs text-muted-foreground" style={mono}>
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ko-KR") : ""}
                      </span>
                      <Icon
                        size={56}
                        className="flex-shrink-0"
                        style={{ color: "var(--muted-foreground)", opacity: 0.18 }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-sm" style={mono}>
                {activeQuery
                  ? `"${activeQuery}" 검색 결과가 없습니다`
                  : activeTag || activeCategory
                    ? "해당 조건의 글이 없습니다"
                    : "등록된 글이 없습니다"}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── 태그 view ── */}
      {blogView === "tags" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Link
            href="/blog"
            className="group rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            style={{ background: `${TEAL}14`, border: `1px solid ${TEAL}30` }}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${TEAL}22` }}>
                <BookOpen size={15} style={{ color: TEAL }} />
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: `${TEAL}18`, color: TEAL, ...mono }}
              >
                {posts.length}편
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground" style={serif}>
                전체보기
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">모든 글</p>
            </div>
          </Link>

          {tags.map((t) => {
            const Icon = iconForTag(t.name);
            return (
              <Link
                key={t.slug}
                href={`/blog?tag=${encodeURIComponent(t.slug)}`}
                className="group rounded-2xl p-4 flex flex-col gap-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{ background: "var(--secondary)" }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(35,198,169,0.15)" }}
                  >
                    <Icon size={15} style={{ color: TEAL }} />
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(35,198,169,0.15)", color: TEAL, ...mono }}
                  >
                    {t.count}편
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground" style={serif}>
                  {t.name}
                </p>
              </Link>
            );
          })}

          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full py-10 text-center">등록된 태그가 없습니다</p>
          )}
        </div>
      )}

      {/* ── 카테고리 view (실제 depth 2단계 트리) ── */}
      {blogView === "categories" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            {drilldownCategory ? (
              <>
                <button
                  onClick={() => setDrilldownCategory(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  style={mono}
                >
                  <ChevronLeft size={12} /> 카테고리
                </button>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-foreground font-medium" style={mono}>
                  {drilldownCategory.name}
                </span>
              </>
            ) : (
              <>
                <h3 className="text-base font-medium text-foreground" style={serif}>
                  카테고리
                </h3>
                <span className="text-xs text-muted-foreground" style={mono}>
                  {topCategories.length}개
                </span>
              </>
            )}
          </div>

          {!drilldownCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topCategories.map((cat) => {
                const Icon = iconForTag(cat.name);
                const hasChildren = (cat.children?.length ?? 0) > 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => (hasChildren ? setDrilldownCategory(cat) : undefined)}
                    className="group flex items-start gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                    style={{ background: "var(--secondary)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(35,198,169,0.15)" }}
                    >
                      <Icon size={20} style={{ color: TEAL }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground" style={serif}>
                          {cat.name}
                        </p>
                        {hasChildren && (
                          <ChevronRight
                            size={12}
                            className="text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                          />
                        )}
                      </div>
                      {hasChildren && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cat.children!.map((s) => (
                            <span
                              key={s.id}
                              className="text-[9px] px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(35,198,169,0.1)", color: TEAL, ...mono }}
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {topCategories.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-10 text-center">
                  등록된 카테고리가 없습니다
                </p>
              )}
            </div>
          )}

          {drilldownCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(drilldownCategory.children ?? []).map((sub) => (
                <Link
                  key={sub.id}
                  href={`/blog?category=${encodeURIComponent(sub.slug)}`}
                  className="group rounded-2xl p-5 flex flex-col gap-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{ background: "var(--secondary)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(35,198,169,0.15)" }}
                  >
                    <FileText size={17} style={{ color: TEAL }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground" style={serif}>
                    {sub.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
