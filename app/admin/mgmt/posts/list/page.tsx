import PostListLayout from "@/layout/admin/posts/postList";
import { apiFetch } from "@/lib/apiFetch";

type Props = {
  searchParams?: {
    take?: string;
  };
};

const DEFAULT_TAKE = 20;

const ListPage = async ({ searchParams }: Props) => {
  const takeRaw = searchParams?.take;
  const take = Number.isFinite(Number(takeRaw)) ? Math.min(Math.max(Number(takeRaw), 1), 100) : DEFAULT_TAKE;

  const { posts } = await apiFetch<{
    ok: true;
    posts: any[];
    nextCursor: number | null;
  }>(`/admin/blog/posts/list?take=${take}`, {
    cache: "no-store",
  });

  return (
    <>
      <h1>글 관리</h1>
      <PostListLayout posts={posts} />
    </>
  );
};

export default ListPage;
