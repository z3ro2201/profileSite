import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";
import Link from "next/link";

type SearchParams = {
  category?: string | string[];
  tag?: string | string[];
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const BlogListPage = async ({ searchParams }: Props) => {
  const sp = (await searchParams) ?? {};

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

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      {hasFilter && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
        </header>
      )}

      <section>
        {isFeed ? (
          <div className="space-y-10">
            {posts.map((p) => (
              <article key={p.id} className="rounded-2xl border border-black/10 bg-white p-6">
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
              <Link href={`/blog/posts/view/${p.id}`} className="block rounded-xl border border-black/10 p-4 hover:bg-black/5" key={p.id}>
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
