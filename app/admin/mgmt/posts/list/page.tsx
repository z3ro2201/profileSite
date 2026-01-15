import PostListLayout from "@/layout/admin/posts/postList";
import { apiFetch } from "@/lib/apiFetch";
const ListPage = async () => {
  const { posts } = await apiFetch<{ ok: true; posts: any[]; nextCursor: number | null }>("/admin/blog/posts/list", { cache: "no-store" });

  return (
    <>
      <h1>글 관리</h1>
      <div className="w-full">
        <div className="px-4 py-2 flex border-b border-gray-800/20 text-center items-center">
          <span className="block w-1/12">상태</span>
          <span className="block w-8/12">제목</span>
          <span className="block w-2/12">작성일</span>
          <span className="block w-3/12">관리</span>
        </div>
        <PostListLayout posts={posts} />
      </div>
    </>
  );
};

export default ListPage;
