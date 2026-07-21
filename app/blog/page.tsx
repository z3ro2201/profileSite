import { headers } from "next/headers";
import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";
import type { CategoryListResponse } from "@/types/Category";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBot } from "@/lib/botDetection";
import BlogListClient from "@/layout/blog/BlogListClient";

type SearchParams = {
  category?: string | string[];
  tag?: string | string[];
  q?: string;
  take?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const validateSearchParams = (sp: SearchParams) => {
  const invalid =
    (sp.category !== undefined && typeof sp.category !== "string") ||
    (sp.tag !== undefined && typeof sp.tag !== "string") ||
    (sp.q !== undefined && typeof sp.q !== "string");

  if (invalid) notFound();
};

// ✅ 향상된 메타데이터
export const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};
  validateSearchParams(sp);

  const category = typeof sp.category === "string" ? decodeURIComponent(sp.category) : "";
  const tag = typeof sp.tag === "string" ? decodeURIComponent(sp.tag) : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  let title = "2ER0 블로그";
  if (category) title = `${category} - 2ER0 블로그`;
  else if (tag) title = `#${tag} - 2ER0 블로그`;
  else if (q) title = `"${q}" 검색 결과`;

  let description = "개발/기록/메모를 쌓는 공간. 짧아도 일단 남긴다.";
  if (category) description = `${category} 카테고리의 글 모음`;
  else if (tag) description = `${tag} 태그 글 모음`;
  else if (q) description = `"${q}" 검색 결과`;

  const baseUrl = "https://2er0.io";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const url = `${baseUrl}/blog${params.toString() ? `?${params}` : ""}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
    // 검색어(q) 조합은 사실상 무한히 생길 수 있는 얇은 콘텐츠라 색인에서 제외.
    // 카테고리/태그는 그 자체로 의미 있는 아카이브 페이지라 계속 색인 허용.
    robots: q ? { index: false, follow: true } : undefined,
  };
};

const BlogMainPage = async ({ searchParams }: Props) => {
  const sp = (await searchParams) ?? {};
  validateSearchParams(sp);

  // ✅ 봇 감지
  const h = await headers();
  const isBotRequest = isBot(h.get("user-agent") || "");

  const qs = new URLSearchParams();
  const hasFilter =
    typeof sp.category === "string" ||
    typeof sp.tag === "string" ||
    typeof sp.q === "string" ||
    typeof sp.take === "string";

  if (typeof sp.category === "string") qs.set("category", sp.category);
  if (typeof sp.tag === "string") qs.set("tag", sp.tag);
  if (typeof sp.q === "string") qs.set("q", sp.q);
  // take를 안 주면 API가 필터 여부 상관없이 10개로 캡을 걸어서(clampInt 기본값 10),
  // "전체 글" 볼 때도 태그 눌러서 필터할 때도 10개까지만 보였음.
  // API 허용 최대치(50)를 명시적으로 요청해서 사실상 전체가 다 보이게 함.
  qs.set("take", typeof sp.take === "string" ? sp.take : "50");

  const query = qs.toString();

  const categorySlug = typeof sp.category === "string" ? sp.category : null;
  const isSearch = typeof sp.q === "string" && sp.q.trim().length > 0;

  // 검색(q)만 매번 라이브로 (결과가 매 검색어마다 달라서 캐싱 의미 없음).
  // 카테고리/태그/기본 목록은 방문자 대부분이 겹치는 조회라 60초 ISR로 DB 부하 줄임.
  // (글 작성/수정/삭제 시엔 admin API에서 revalidatePath로 즉시 갱신됨)
  const listCache = isSearch ? { cache: "no-store" as const } : { next: { revalidate: 60 } };

  const [postsData, categoryData, treeData, tagsData] = await Promise.all([
    apiFetch<PublicPostListResponse>(`/blog/posts/list${query ? `?${query}` : ""}`, listCache),
    categorySlug
      ? apiFetch<{ ok: boolean; category: { id: number; name: string; slug: string; description: string } }>(
          `/blog/category/list/${categorySlug}`,
          { next: { revalidate: 300 } },
        ).catch(() => null)
      : null, // ✅ category 없으면 null
    apiFetch<CategoryListResponse>(`/blog/category/list?tree=1`, { next: { revalidate: 300 } }).catch(() => ({
      ok: false as const,
      categories: [],
    })),
    apiFetch<{ ok: boolean; tags: { id: number; slug: string; name: string; count: number }[] }>(`/blog/tags/list`, {
      next: { revalidate: 300 },
    }).catch(() => ({ ok: false, tags: [] })),
  ]);

  const { posts } = postsData;
  const categoryInfo = categoryData?.category;

  const pageDescription = categoryInfo ? categoryInfo.description : null;

  const pageTitle = (() => {
    if (categoryInfo) return `${categoryInfo.name} 글 목록`;
    if (typeof sp.tag === "string") return `#${decodeURIComponent(sp.tag)} 글 목록`;
    if (typeof sp.q === "string") return `"${sp.q}" 검색 결과`;
    return "블로그";
  })();

  const isFeed = !hasFilter;
  const isEmpty = posts.length === 0;

  // ✅ 봇용 SSR
  if (isBotRequest) {
    return (
      <PostListSSR
        posts={posts}
        pageTitle={pageTitle}
        isEmpty={isEmpty}
        isFeed={isFeed}
        pageDescription={pageDescription}
        category={typeof sp.category === "string" ? sp.category : undefined}
        tag={typeof sp.tag === "string" ? sp.tag : undefined}
        q={typeof sp.q === "string" ? sp.q : undefined}
        categories={treeData.ok ? treeData.categories : []}
        tags={tagsData.ok ? tagsData.tags : []}
      />
    );
  }

  // 기존 CSR
  return (
    <div className="mx-auto w-full">
      {hasFilter && (
        <header className="mb-4">
          {pageDescription && (
            <h4 className="text-sm text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {pageDescription}
            </h4>
          )}
        </header>
      )}

      <BlogListClient
        posts={posts}
        categories={treeData.ok ? treeData.categories : []}
        tags={tagsData.ok ? tagsData.tags : []}
        activeTag={typeof sp.tag === "string" ? sp.tag : undefined}
        activeCategory={typeof sp.category === "string" ? sp.category : undefined}
        activeQuery={typeof sp.q === "string" ? sp.q : undefined}
      />
    </div>
  );
};

export default BlogMainPage;

// SSR 버전 (봇용)
type PostListSSRProps = {
  posts: PublicPostListResponse["posts"];
  pageTitle: string;
  pageDescription?: string | null;
  isEmpty: boolean;
  isFeed: boolean;
  category?: string;
  tag?: string;
  q?: string;
  categories: { id: number; slug: string; name: string; depth: number }[];
  tags: { id: number; slug: string; name: string; count: number }[];
};

function PostListSSR({ posts, pageTitle, pageDescription, isEmpty, isFeed, categories, tags }: PostListSSRProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isFeed ? "Blog" : "CollectionPage",
    name: pageTitle,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.publishedAt ?? undefined,
      url: `https://2er0.io/blog/posts/view/${post.id}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>{" "}
          {pageDescription && <h4 className="text-md text-muted-foreground">{pageDescription}</h4>}
          {posts.length > 0 && <p className="mt-2 text-muted-foreground">총 {posts.length}개</p>}
        </header>

        <section>
          {isEmpty ? (
            <p className="text-center py-20">등록된 글이 없습니다</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.id} className="p-6 bg-[var(--card)] rounded-xl border border-border">
                  <Link href={`/blog/posts/view/${post.id}`}>
                    <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                    {post.publishedAt && (
                      <time className="text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </time>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 카테고리/태그로 들어가는 링크. CSR 버전(BlogListClient)의 탭 UI는 JS로만 렌더링되는데
            그 안의 /blog?category=X, /blog?tag=Y 링크가 봇이 이 페이지들을 발견하는 유일한 경로였음.
            사이트맵엔 개별 글만 있고 이 필터 페이지들은 없어서, SSR 버전에 안 넣으면
            봇이 이 URL들의 존재 자체를 알 방법이 없었음. */}
        {categories.length > 0 && (
          <nav className="mt-12 pt-8 border-t border-border" aria-label="카테고리 목록">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">카테고리</h3>
            <ul className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/blog?category=${encodeURIComponent(c.slug)}`} className="text-sm underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {tags.length > 0 && (
          <nav className="mt-6" aria-label="태그 목록">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">태그</h3>
            <ul className="flex flex-wrap gap-3">
              {tags.map((t) => (
                <li key={t.id}>
                  <Link href={`/blog?tag=${encodeURIComponent(t.slug)}`} className="text-sm underline">
                    #{t.name} ({t.count})
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
