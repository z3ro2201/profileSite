import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import type { PublicPostDetailResponse } from "@/types/Posts";
import { markdownToHtmlWithToc } from "@/lib/markdown";
import PostViewClient from "@/layout/blog/PostViewClient";
import CommentSection, { type CommentType } from "@/layout/blog/CommentClient";
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

  try {
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
  } catch {
    // 실제 본문 렌더링(BlogPostViewPage)에서 notFound()/에러를 정확히 처리하니,
    // 메타데이터 단계에서는 그냥 무난한 기본값만 반환 (여기서 또 예외 던지면 이중으로 시끄러워짐)
    return { title: "Post" };
  }
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
  // 진짜 존재하지 않는 글(404)이면 Next.js의 정식 404 페이지로 보냄 — 구글 입장에서
  // "이 URL은 없다"는 명확한 신호가 되고, 원인 불명의 500(서버 에러)이랑은 완전히 다르게 취급됨.
  // 그 외(5xx 등 진짜 서버 문제)는 은폐하지 않고 그대로 던져서 실제 장애가 보이게 둠.
  let post: PublicPostDetailResponse["post"];
  try {
    ({ post } = await apiFetch<PublicPostDetailResponse>(`/blog/posts/${postId}`, {
      next: { revalidate: 3600 }, // 온디맨드 재검증(admin API에서 revalidatePath) + 1시간 백스톱
    }));
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
      notFound();
    }
    throw err;
  }

  // 댓글은 부가 콘텐츠 — 이게 실패한다고 글 본문까지 통째로 죽으면 안 됨.
  // (DB 순간 지연/네트워크 hiccup 등으로 여기서 예외가 나면 이전엔 페이지 전체가 500이었음 —
  //  구글 크롤러가 하필 그 순간 방문하면 해당 URL을 "에러 페이지"로 학습해서 색인에 불리했을 수 있음)
  let comments: CommentType[] = [];
  try {
    const commentsData = await apiFetch<{
      ok: boolean;
      comments: CommentType[];
      canViewSecret: boolean;
    }>(`/blog/posts/${postId}/comments`, {
      cache: "no-store", // 댓글은 항상 최신 데이터
    });
    comments = commentsData.comments || [];
  } catch (err) {
    console.error(`[post ${postId}] 댓글 로드 실패, 본문은 계속 렌더링:`, err);
  }

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
