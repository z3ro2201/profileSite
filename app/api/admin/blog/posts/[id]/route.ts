import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PostUpsertProp } from "@/types/Posts";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// ========================================
// GET - 포스트 조회 (관리자용)
// ========================================
type MaybePromise<T> = T | Promise<T>;
export async function GET(_req: Request, ctx: { params: MaybePromise<{ id: string }> }) {
  const { id } = await ctx.params;
  const postId = Number(id);

  if (!Number.isFinite(postId)) return bad("Invalid post id");

  const post = await prisma.post.findFirst({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      contentMd: true,
      contentHtml: true,
      state: true, // ✅ DRAFT | PUBLISHED | ARCHIVED
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true, // ✅ 카테고리 ID
      category: {
        select: {
          id: true, // ✅ ID 포함
          slug: true,
          name: true,
        },
      },
      tags: {
        select: {
          slug: true,
          name: true,
        },
      },
      author: {
        select: {
          id: true, // ✅ ID 포함
          name: true,
        },
      },
    },
  });

  if (!post) return bad("Post not found", 404);

  // AdminPostDetail 형식으로 변환
  const adminPost = {
    ...post,
    tagsString: post.tags.map((t) => t.slug).join(", "), // ✅ PostEditor용 문자열
  };

  return NextResponse.json({ ok: true, post: adminPost });
}

// ========================================
// PUT - 포스트 수정
// ========================================
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const postId = Number(id);

  if (!Number.isFinite(postId)) return bad("Invalid post id");

  let body: Partial<PostUpsertProp>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  // 기존 포스트 확인
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, publishedAt: true, state: true },
  });

  if (!existing) return bad("Post not found", 404);

  // 업데이트할 데이터 준비
  const data: any = {};

  if (typeof body.title === "string") {
    data.title = body.title.trim();
  }

  if (typeof body.contentMd === "string") {
    data.contentMd = body.contentMd;
  }

  if (body.contentHtml !== undefined) {
    data.contentHtml = body.contentHtml ?? null;
  }

  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId;
  }

  // 상태 변경 처리
  if (body.state) {
    data.state = body.state;

    // DRAFT → PUBLISHED: publishedAt 설정
    if (body.state === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    // PUBLISHED → DRAFT/ARCHIVED: publishedAt 제거
    if (body.state !== "PUBLISHED" && existing.publishedAt) {
      data.publishedAt = null;
    }
  }

  // 태그 업데이트
  if (Array.isArray(body.tags)) {
    const tagSlugs = body.tags.map((t) => t.trim()).filter(Boolean);
    data.tags = {
      set: [], // 기존 태그 모두 제거
      ...(tagSlugs.length
        ? {
            connect: tagSlugs.map((slug) => ({ slug })), // 새 태그 연결
          }
        : {}),
    };
  }

  // DB 업데이트
  const updated = await prisma.post.update({
    where: { id: postId },
    data,
    select: {
      id: true,
      title: true,
      state: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, post: updated });
}

// ========================================
// DELETE - 포스트 삭제
// ========================================
type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const postId = parseInt(id, 10);

    // 유효성 검증
    if (isNaN(postId)) {
      return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });
    }

    // 포스트 존재 확인
    const exists = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!exists) {
      return NextResponse.json({ ok: false, message: "Post not found" }, { status: 404 });
    }

    // 삭제
    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ ok: true, id: postId }, { status: 200 });
  } catch (e: any) {
    console.error("Delete error:", e);
    return NextResponse.json({ ok: false, message: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
