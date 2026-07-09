// /blog/posts는 /blog로 통합됨. 기존 공유된 링크(?tag=, ?category=, ?q=)가 깨지지 않도록
// 쿼리스트링은 그대로 유지해서 리다이렉트.
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

const BlogPostsRedirect = async ({ searchParams }: { searchParams?: Promise<SearchParams> }) => {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
  }
  const query = qs.toString();
  redirect(`/blog${query ? `?${query}` : ""}`);
};

export default BlogPostsRedirect;
