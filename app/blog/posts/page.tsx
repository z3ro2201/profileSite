import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostListResponse } from "@/types/Posts";

import Link from "next/link";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const BlogListPage = async ({ searchParams }: Props) => {
  const qs = new URLSearchParams();

  if (typeof searchParams?.category === "string") {
    qs.set("category", searchParams.category);
  }
  if (typeof searchParams?.tag === "string") {
    qs.set("tag", searchParams.tag);
  }
  if (typeof searchParams?.q === "string") {
    qs.set("q", searchParams.q);
  }

  const query = qs.toString();

  const { posts } = await apiFetch<PublicPostListResponse>(`/blog/posts/list${query ? `?${query}` : ""}`, { cache: "no-store" });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">공개된 글 목록</h1>
      </header>
      <section>
        <div className="space-y-3">
          {posts.map((p) => (
            <Link href={`/blog/posts/view/${p.id}`} className="block rounded-xl border border-black/10 p-4 hover:bg-black/5" key={p.id}>
              <h2>{p.title}</h2>
              <small>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("ko-KR") : ""}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogListPage;
