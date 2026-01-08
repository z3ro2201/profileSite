import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
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
        {posts.map((p: any) => (
          <div className="px-4 py-2 flex border-b border-gray-800/20 text-center items-center" key={p.id}>
            <span className="block w-1/12">[{p.state}]</span>
            <span className="block w-8/12">
              <Link className="block" href={`./${p.id}`}>
                {p.title}
              </Link>
            </span>
            <span className="block w-2/12">{p.createdAt}</span>
            <span className="block w-3/12">
              <button type="button" className="px-2 py-1 border border-gray-800/20 rounded-full">
                편집
              </button>
              <button type="button" className="px-2 py-1 border border-gray-800/20 rounded-full">
                수정
              </button>
              <button type="button" className="px-2 py-1 border border-gray-800/20 rounded-full">
                삭제
              </button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListPage;
