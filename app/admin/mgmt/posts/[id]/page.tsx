import type { Metadata } from "next";
import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";
import CommentSection from "@/layout/blog/CommentClient";
import { parsePostId } from "@/lib/parsePostId";
import { isAdmin } from "@/lib/auth/server";

type Props = {
  params: Promise<{ id?: string | string[] }>;
  searchParams?: Promise<{ id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const postId = parsePostId((await params).id);

  const { post } = await apiFetch<PublicPostDetailResponse>(`admin/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  return {
    title: post.title ?? `Post #${postId}`,
  };
}

export default async function AdminPostViewPage({ params }: Props) {
  const postId = parsePostId((await params).id);

  // 관리자 확인
  const isAdminUser = await isAdmin();

  // ✅ apiFetch 사용
  const { post } = await apiFetch<PublicPostDetailResponse>(`/admin/blog/posts/${postId}`, {
    cache: "no-store",
  });

  // ✅ 댓글도 apiFetch 사용
  const commentsData = await apiFetch<{
    ok: boolean;
    comments: any[];
    canViewSecret: boolean;
  }>(`/blog/posts/${postId}/comments`, {
    cache: "no-store", // 댓글은 항상 최신 데이터
  });

  const comments = commentsData.comments || [];

  // Markdown to HTML
  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;

  return (
    <>
      <PostViewClient post={post} finalHtml={finalHtml} toc={toc} isAdmin={isAdminUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <CommentSection postId={postId} comments={comments} canViewSecret={isAdminUser} />
      </div>
    </>
  );
}
