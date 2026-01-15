"use client";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";

const PostListLayout = ({ posts }: { posts: any[] }) => {
  const submitDeletePost = async (id: number) => {
    try {
      const data = await apiFetch(`/admin/blog/posts/${id}`, { method: "DELETE" });
      console.log(data);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  return (
    <>
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
            <button type="button" className="px-2 py-1 border border-gray-800/20 rounded-full" onClick={() => submitDeletePost(p.id)}>
              삭제
            </button>
          </span>
        </div>
      ))}
    </>
  );
};

export default PostListLayout;
