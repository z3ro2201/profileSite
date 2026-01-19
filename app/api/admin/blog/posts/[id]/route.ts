// app/api/admin/blog/posts/[id]/route.ts
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
      state: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      category: {
        select: {
          id: true,
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
          id: true,
          name: true,
        },
      },
      files: {
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              objectKey: true, // 전체 경로가 여기 포함됨
              mimeType: true,
              sizeBytes: true,
              width: true,
              height: true,
            },
          },
        },
        orderBy: {
          sort: "asc",
        },
      },
    },
  });

  if (!post) return bad("Post not found", 404);

  const adminPost = {
    ...post,
    tagsString: post.tags.map((t) => t.slug).join(", "),
    files: post.files.map((pf) => ({
      ...pf,
      file: {
        ...pf.file,
        sizeBytes: pf.file.sizeBytes ? pf.file.sizeBytes.toString() : null, // BigInt → String
      },
    })),
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
            connect: tagSlugs.map((slug) => ({ slug })),
          }
        : {}),
    };
  }

  // 🆕 파일 업데이트
  if (Array.isArray(body.fileIds)) {
    const fileIds = body.fileIds.filter(Boolean);

    // 기존 파일 연결 모두 삭제
    await prisma.postFile.deleteMany({
      where: { postId },
    });

    // 새 파일 연결 추가
    if (fileIds.length > 0) {
      data.files = {
        create: fileIds.map((fileId: string, index: number) => ({
          fileId,
          role: index === 0 ? "thumbnail" : "content",
          sort: index,
        })),
      };
    }
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

    // 🆕 연결된 파일은 Cascade로 자동 삭제됨 (PostFile 관계)
    // File 자체는 삭제하지 않음 (다른 포스트에서 사용할 수 있음)
    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ ok: true, id: postId }, { status: 200 });
  } catch (e: any) {
    console.error("Delete error:", e);
    return NextResponse.json({ ok: false, message: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
