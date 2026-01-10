import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";
import Link from "next/link";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

type SearchParams = {
  category?: string | string[];
  tag?: string | string[];
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

// 잘못된 페이지 접근
const validateSearchParams = (sp: SearchParams) => {
  const invalid = (sp.category !== undefined && typeof sp.category !== "string") || (sp.tag !== undefined && typeof sp.tag !== "string") || (sp.q !== undefined && typeof sp.q !== "string");

  if (invalid) notFound();
};

// 메타데이터
export const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const sp = (await searchParams) ?? {};
  validateSearchParams(sp);
  const category = typeof sp.category === "string" ? decodeURIComponent(sp.category) : "";
  const tag = typeof sp.tag === "string" ? decodeURIComponent(sp.tag) : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  // title
  let title = "전체목록";
  if (category) title = `${category}의 글 목록`;
  else if (tag) title = `#${tag} 글 목록`;
  else if (q) title = `"${q}" 검색 결과`;

  // description
  let description = "블로그 전체 글 목록";
  if (category) description = `${category} 카테고리 글 모음`;
  else if (tag) description = `${tag} 태그가 포함된 글 모음`;
  else if (q) description = `"${q}"에 대한 검색 결과`;

  return { title, description };
};
// 본문
const BlogListPage = async ({ searchParams }: Props) => {
  const sp = (await searchParams) ?? {};
  validateSearchParams(sp);

  const qs = new URLSearchParams();

  const hasFilter = typeof sp.category === "string" || typeof sp.tag === "string" || typeof sp.q === "string";

  if (typeof sp.category === "string") qs.set("category", sp.category);
  if (typeof sp.tag === "string") qs.set("tag", sp.tag);
  if (typeof sp.q === "string") qs.set("q", sp.q);

  const query = qs.toString();

  const pageTitle = (() => {
    if (typeof sp.category === "string") return `${decodeURIComponent(sp.category)} 글 목록`;
    if (typeof sp.tag === "string") return `#${decodeURIComponent(sp.tag)} 글 목록`;
    if (typeof sp.q === "string") return `"${sp.q}" 검색 결과`;
    return "공개된 글 목록";
  })();

  const { posts } = await apiFetch<PublicPostListResponse>(`/blog/posts/list${query ? `?${query}` : ""}`, { cache: "no-store" });

  // ✅ feed 모드: 필터 없을 때
  const isFeed = !hasFilter;

  // ✅ 등록된 글이 없는경우
  const isEmpty = posts.length === 0;

  return (
    <div className="mx-auto w-full px-5 py-10">
      {hasFilter && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
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

                {/* ✅ 단건처럼: contentHtml이 있을 때만 */}
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
