import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";

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

  return <PostViewClient post={post} finalHtml={finalHtml} toc={toc} />;
};

export default BlogPostViewPage;
