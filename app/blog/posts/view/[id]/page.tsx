import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtml } from "@/lib/markdown";

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};

const BlogPostViewPage = async (props: Props) => {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const raw = params?.id ?? searchParams?.id;
  const postId = Number(raw);

  if (!Number.isFinite(postId)) {
    throw new Error(`Invalid post id: ${String(raw)}`);
  }

  // ✅ 단건 API 호출 (apiFetch는 내부적으로 /api 붙임)
  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "no-store",
  });

  const html = await markdownToHtml(post.contentMd);

  return (
    <>
      <div className="pl-6 pr-4 pt-4 pb-6 w-full h-[calc(100%/2)] flex flex-col justify-end bg-[rgba(0,0,0,.5)] text-white">
        <div className="mb-2">
          <div className="w-full">
            <span className="py-1 px-3 min-w-[50px] inline-block bg-black text-white rounded-full text-[.8rem]">{post.category?.name ?? "Uncategorized"}</span>
          </div>

          <h1 className="pb-1 inline-block border-b border-white text-[2.24rem] font-bold">{post.title}</h1>
        </div>

        <div className="mt-1 flex justify-between text-[0.9rem]">
          <div>
            <span className="inline-block mr-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleString("ko-KR") : new Date(post.createdAt).toLocaleString("ko-KR")}</span>
            <span className="inline-block">/</span>
            <span className="inline-block ml-2">0 comments</span>
          </div>
        </div>
      </div>
      {/* 본문은 markdown 렌더러 붙이기 전이라면 일단 이렇게 */}
      <article className="p-6 prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </>
  );
};

export default BlogPostViewPage;
