import type { Metadata } from "next";

import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";
import type { RecentTagsResponse } from "@/types/Tags";

import Link from "next/link";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "프롤로그",
    description: "개발/기록/메모를 쌓는 공간. 짧아도 일단 남긴다.",
  };
};

const PrologPage = async () => {
  const [{ posts }, { tags }] = await Promise.all([apiFetch<PublicPostListResponse>("/blog/posts/list?take=5", { next: { revalidate: 60 } }), apiFetch<RecentTagsResponse>("/blog/tags/recent?take=10", { next: { revalidate: 60 } })]);

  return (
    <div className="mx-auto w-full px-5 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">프롤로그</h1>
        <p className="mt-3 text-sm opacity-80">개발/기록/메모를 쌓는 공간. 짧아도 일단 남긴다.</p>

        <div className="mt-5 flex gap-2">
          <Link href="/blog/posts" className="px-3 py-2 rounded-lg bg-white border border-black/15 text-sm hover:bg-black/5">
            전체 글
          </Link>
          {tags.map((t) => (
            <Link key={t.slug} href={`/blog/posts?tag=${t.slug}`} className="px-3 py-2 rounded-lg bg-white border border-black/15 text-sm hover:bg-black/5" title={`사용 ${t.usedCount}회`}>
              #{t.slug}
            </Link>
          ))}
        </div>
      </header>
      <section className="p-4 min-h-[calc(100%-2rem)] bg-white rounded-lg">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-semibold">최신 글</h2>
          <Link href="/blog/posts" className="text-sm underline opacity-70 hover:opacity-100">
            더보기
          </Link>
        </div>

        <div className="space-y-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/posts/view/${p.id}`} className="block rounded-xl border border-black/10 p-4 hover:bg-black/5">
              <div className="flex items-center gap-2 text-xs opacity-70">
                <span className="rounded-full bg-black/80 px-2 py-1 text-white">{p.category?.name ?? "Uncategorized"}</span>
                <span>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ko-KR") : ""}</span>
              </div>

              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags?.slice(0, 4).map((t) => (
                  <span key={t.slug} className="text-xs opacity-70">
                    #{t.slug}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PrologPage;
