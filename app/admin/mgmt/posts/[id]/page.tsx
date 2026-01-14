import { apiFetch } from "@/lib/apiFetch";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import type { PublicPostDetailResponse } from "@/types/Posts";
import type { Metadata } from "next";
import AdminPostView from "@/layout/admin/posts/postView";
import PostViewClient from "@/layout/blog/PostViewClient";
import { parsePostId } from "@/lib/parsePostId";

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const postId = parsePostId((await params).id);

  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  return {
    title: post.title ?? `Post #${postId}`,
  };
}

export default async function PostViewPage({ params }: Props) {
  const postId = parsePostId((await params).id);

  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;

  return <PostViewClient post={post} finalHtml={finalHtml} toc={toc} isAdmin={true} />;
}
