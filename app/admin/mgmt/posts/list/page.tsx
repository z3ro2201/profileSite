import PostListLayout from "@/layout/admin/posts/postList";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
const ListPage = async () => {
  const { posts } = await apiFetch<{ ok: true; posts: any[]; nextCursor: number | null }>("/admin/blog/posts/list", { cache: "no-store" });
  const submitDeletePost = async (id: number) => {
    try {
      const data = await apiFetch(`posts/${id}`, { method: "DELETE" });
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <h1>글 관리</h1>

      <PostListLayout posts={posts} />
    </>
  );
};

export default ListPage;
