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
  const sp = (await searchParams) ?? {}; // ✅ Promise unwrap

  const qs = new URLSearchParams();

  if (typeof sp.category === "string") qs.set("category", sp.category);
  if (typeof sp.tag === "string") qs.set("tag", sp.tag);
  if (typeof sp.q === "string") qs.set("q", sp.q);

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
