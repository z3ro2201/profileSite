import type { Metadata } from "next";
import Script from "next/script";
import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";
import CommentSection from "@/layout/blog/CommentClient";
import { isAdmin } from "@/lib/auth/server";

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
    next: { revalidate: 3600 }, // 온디맨드 재검증(admin API에서 revalidatePath) + 1시간 백스톱
  });

  const source = post.contentHtml ?? post.contentMd ?? "";
  const description = stripAndTrim(source);

  // 글에 썸네일이 있으면 그걸, 없으면 metadataBase의 기본 OG 이미지로 자동 폴백
  // (openGraph.images를 아예 안 넣으면 루트 layout의 /preview.png가 상속됨)
  const ogImages = post.thumbnail
    ? [
        {
          url: post.thumbnail.objectKey,
          width: post.thumbnail.width ?? undefined,
          height: post.thumbnail.height ?? undefined,
          alt: post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `https://2er0.io/blog/posts/view/${postId}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author.name ? [post.author.name] : undefined,
      images: ogImages,
    },
    twitter: {
      title: post.title,
      description,
      images: ogImages?.map((i) => i.url),
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

  // 관리자 확인
  const isAdminUser = await isAdmin();

  // ✅ apiFetch 사용 (자동으로 /api 붙음)
  const { post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
    next: { revalidate: 3600 }, // 온디맨드 재검증(admin API에서 revalidatePath) + 1시간 백스톱
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author.name ?? "2ER0" },
    ...(post.thumbnail ? { image: [`https://2er0.io${post.thumbnail.objectKey}`] } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://2er0.io/blog/posts/view/${postId}` },
  };

  return (
    <>
      <Script
        id={`jsonld-post-${postId}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PostViewClient post={post} finalHtml={finalHtml} toc={toc} isAdmin={isAdminUser} />

      <CommentSection postId={postId} comments={comments} canViewSecret={isAdminUser} />
    </>
  );
};

export default BlogPostViewPage;
