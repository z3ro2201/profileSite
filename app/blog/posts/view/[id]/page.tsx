import type { Metadata } from "next";

import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";
import CommentSection from "@/layout/blog/CommentClient";
import { isAdmin } from "@/lib/auth/server"; // ✅ 추가
import { prisma } from "@/lib/prisma"; // ✅ 추가

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

  // ✅ 관리자 확인
  const isAdminUser = await isAdmin();

  // 포스트 조회
  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    cache: "force-cache",
  });

  // ✅ 댓글 조회
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      isDeleted: false,
      ...(isAdminUser ? {} : { isApproved: true }), // 관리자는 미승인 댓글도 볼 수 있음
    },
    include: {
      replies: {
        where: {
          isDeleted: false,
          ...(isAdminUser ? {} : { isApproved: true }),
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Markdown to HTML
  const { html, toc } = await markdownToHtmlWithToc(post.contentMd);
  const finalHtml = post.contentHtml ?? html;

  return (
    <>
      <PostViewClient
        post={post}
        finalHtml={finalHtml}
        toc={toc}
        isAdmin={isAdminUser} // ✅ 관리자 여부 전달
      />

      {/* ✅ 댓글 섹션 추가 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <CommentSection postId={postId} comments={comments} canViewSecret={isAdminUser} />
      </div>
    </>
  );
};

export default BlogPostViewPage;
