import PostListLayout from "@/layout/admin/posts/postList";
import { apiFetch } from "@/lib/apiFetch";
import type { PostStateProp } from "@/types/Posts";

type PostRow = {
  id: number;
  title: string;
  state: PostStateProp;
  createdAt: string;
  category: { id: number; slug: string; name: string } | null;
  tags: { id: number; slug: string; name: string }[];
};

type Props = {
  searchParams?: Promise<{ take?: string }>;
};

const DEFAULT_TAKE = 20;

const ListPage = async ({ searchParams }: Props) => {
  const sp = (await searchParams) ?? {};
  const take = Number.isFinite(Number(sp.take)) ? Math.min(Math.max(Number(sp.take), 1), 100) : DEFAULT_TAKE;

  const { posts } = await apiFetch<{
    ok: true;
    posts: PostRow[];
    nextCursor: number | null;
  }>(`/admin/blog/posts/list?take=${take}`, {
    cache: "no-store",
  });

  return <PostListLayout posts={posts} />;
};

export default ListPage;
