// app/blog/page.tsx — prologue + posts 목록을 통합한 블로그 메인
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
function PostListSSR({ posts, pageTitle, pageDescription, isEmpty, isFeed, category, tag, q }: any) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isFeed ? "Blog" : "CollectionPage",
    name: pageTitle,
    blogPost: posts.map((post: any) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.publishedAt,
      url: `https://2er0.io/blog/posts/view/${post.id}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>{" "}
          {pageDescription && <h4 className="text-md text-gray-500">{pageDescription}</h4>}
          {posts.length > 0 && <p className="mt-2 text-gray-600">총 {posts.length}개</p>}
        </header>
        <section>
          {isEmpty ? (
            <p className="text-center py-20">등록된 글이 없습니다</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <article key={post.id} className="p-6 bg-white rounded-xl border">
                  <Link href={`/blog/posts/view/${post.id}`}>
                    <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                    <time className="text-sm text-gray-600">{new Date(post.publishedAt).toLocaleDateString()}</time>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
