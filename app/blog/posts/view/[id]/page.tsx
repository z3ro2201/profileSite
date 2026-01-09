import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";

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

  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;

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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        {/* TOC */}
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-auto">
          <div className="rounded-xl border border-black/10 bg-white p-5">
            <div className="text-xl font-extrabold">Contents</div>

            <nav className="mt-4 space-y-2 text-[15px] leading-6">
              {toc.length === 0 ? (
                <div className="text-black/50">No headings</div>
              ) : (
                toc.map((item) => (
                  <a key={item.id} href={`#${item.id}`} className={["block text-black/70 hover:text-black", item.level === 2 ? "pl-0" : item.level === 3 ? "pl-4" : "pl-8"].join(" ")}>
                    {item.text}
                  </a>
                ))
              )}
            </nav>
          </div>
        </aside>

        {/* 본문 */}
        <article className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
        </article>
      </div>
    </>
  );
};

export default BlogPostViewPage;
