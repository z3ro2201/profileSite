// app/blog/posts/page.tsx
import { headers } from "next/headers";
import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBot } from "@/lib/botDetection";

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
  const invalid = (sp.category !== undefined && typeof sp.category !== "string") || (sp.tag !== undefined && typeof sp.tag !== "string") || (sp.q !== undefined && typeof sp.q !== "string");

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

  let description = "2ER0의 일상이야기 블로그";
  if (category) description = `${category} 카테고리의 글 모음`;
  else if (tag) description = `${tag} 태그 글 모음`;
  else if (q) description = `"${q}" 검색 결과`;

  const baseUrl = "https://2er0.io";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const url = `${baseUrl}/blog/posts${params.toString() ? `?${params}` : ""}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
    alternates: { canonical: url },
  };
};

const BlogListPage = async ({ searchParams }: Props) => {
  const sp = (await searchParams) ?? {};
  validateSearchParams(sp);

  // ✅ 봇 감지
  const h = await headers();
  const isBotRequest = isBot(h.get("user-agent") || "");

  const qs = new URLSearchParams();
  const hasFilter = typeof sp.category === "string" || typeof sp.tag === "string" || typeof sp.q === "string" || typeof sp.take === "string";

  if (typeof sp.category === "string") qs.set("category", sp.category);
  if (typeof sp.tag === "string") qs.set("tag", sp.tag);
  if (typeof sp.q === "string") qs.set("q", sp.q);
  if (typeof sp.take === "string") qs.set("take", sp.take);
  else if (hasFilter) {
    qs.set("take", "10");
  }

  const query = qs.toString();

  const categorySlug = typeof sp.category === "string" ? sp.category : null;

  const [postsData, categoryData] = await Promise.all([
    apiFetch<PublicPostListResponse>(`/blog/posts/list${query ? `?${query}` : ""}`, { cache: "no-store" }),
    categorySlug ? apiFetch<{ ok: boolean; category: { id: number; name: string; slug: string; description: string } }>(`/blog/category/list/${categorySlug}`, { cache: "no-store" }).catch(() => null) : null, // ✅ category 없으면 null
  ]);

  const { posts } = postsData;
  const categoryInfo = categoryData?.category;

  const pageDescription = categoryInfo ? categoryInfo.description : null;
  console.log(categoryInfo);

  const pageTitle = (() => {
    if (categoryInfo) return `${categoryInfo.name} 글 목록`;
    if (typeof sp.tag === "string") return `#${decodeURIComponent(sp.tag)} 글 목록`;
    if (typeof sp.q === "string") return `"${sp.q}" 검색 결과`;
    return "공개된 글 목록";
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
    <div className="mx-auto w-full px-5 py-10">
      {hasFilter && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          {pageDescription && <h4 className="text-md text-gray-500">{pageDescription}</h4>}
        </header>
      )}

      <section className="w-full">
        {isEmpty ? (
          <div className="py-20 text-center text-black/60 bg-white border border-black/10 rounded-2xl">
            <p className="text-lg font-semibold">등록된 글이 없습니다</p>
            <p className="mt-2 text-sm">조건을 변경하거나 전체 글을 확인해보세요.</p>
            <div className="mt-6">
              <Link href="/blog/posts" className="inline-flex rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5">
                전체 글 보기
              </Link>
            </div>
          </div>
        ) : isFeed ? (
          <div className="space-y-10">
            {posts.map((p) => (
              <article key={p.id} className="p-6 rounded-2xl border border-black/10 bg-white">
                <header className="mb-4">
                  <Link href={`/blog/posts/view/${p.id}`} className="hover:underline">
                    <h2 className="text-2xl font-bold">{p.title}</h2>
                  </Link>
                  <div className="mt-1 text-sm text-black/60">{p.publishedAt ? new Date(p.publishedAt).toLocaleString("ko-KR") : ""}</div>
                </header>
                {p.contentHtml ? <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: p.contentHtml }} /> : <div className="text-sm text-black/60">(본문 미리보기가 없어요)</div>}
                <footer className="mt-6">
                  <Link href={`/blog/posts/view/${p.id}`} className="inline-flex items-center rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5">
                    계속 읽기 →
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <Link href={`/blog/posts/view/${p.id}`} className="p-4 block bg-white rounded-xl border border-gray-800/10 hover:border-gray-800/50 hover:bg-white/80" key={p.id}>
                <h2>{p.title}</h2>
                <small>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ko-KR") : ""}</small>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogListPage;

// SSR 버전
function PostListSSR({ posts, pageTitle, pageDescription, isEmpty, isFeed, category, tag, q }: any) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isFeed ? "Blog" : "CollectionPage",
    name: pageTitle,
    blogPost: posts.map((post: any) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.publishedAt,
      url: `https://example.com/blog/posts/view/${post.id}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full px-5 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1> {pageDescription && <h4 className="text-md text-gray-500">{pageDescription}</h4>}
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
