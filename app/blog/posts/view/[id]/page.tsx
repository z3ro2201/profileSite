import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";

import { cn } from "@/lib/cn";

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
  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, { cache: "force-cache" });

  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;

  return (
    <div className="mx-auto w-full px-5 py-10">
      <div className="p-2 mb-2 w-full h-[146px] flex flex-col justify-end">
        <div className="mb-2">
          <div className="w-full">
            <span className="py-1 px-3 min-w-[50px] inline-block bg-black text-white rounded-full text-[.8rem]">{post.category?.name ?? "Uncategorized"}</span>
          </div>
          <h1 className="pb-1 inline-block border-b border-white text-[2.24rem] font-bold">{post.title}</h1>
        </div>

        <div className="mt-1 flex justify-between text-[0.9rem]">
          <div>
            <span className="inline-block mr-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleString("ko-KR") : new Date(post.createdAt).toLocaleString("ko-KR")}</span>
            {/* <span className="inline-block">/</span>
          <span className="inline-block ml-2">0 comments</span> */}
          </div>
        </div>
      </div>

      <div className={cn("relative py-2 pr-4 lg:pt-6 lg:pr-6", toc.length > 0 ? "grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]" : "")}>
        {/* 본문 */}
        <article className="px-3 py-2 prose max-w-none bg-white border border-black/10 rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
        </article>

        {/* TOC */}
        {toc.length > 0 && (
          <aside className="fixed lg:sticky lg:top-6 lg:overflow-auto">
            <div className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-xl font-extrabold">Contents</div>

              <nav className="mt-4 space-y-2 text-[15px] leading-6">
                {toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={["block text-black/70 hover:text-black", item.level === 2 ? "pl-0" : item.level === 3 ? "pl-4" : "pl-8"].join(" ")}>
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BlogPostViewPage;
