import type { Metadata } from "next";

import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};

const stripAndTrim = (input: string, maxLen = 160) => {
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId)) return { title: "Post" };

  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  const source = post.contentHtml ?? post.contentMd ?? "";
  const description = stripAndTrim(source);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
    },
    twitter: {
      title: post.title,
      description,
    },
  };
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
