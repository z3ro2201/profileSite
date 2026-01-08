import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PostUpsertProp } from "@/types/Posts";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const postId = Number(params.id);
  if (!Number.isFinite(postId)) return bad("Invalid post id");

  let body: Partial<PostUpsertProp>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  // 존재 확인
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, state: true, publishedAt: true },
  });
  if (!existing) return bad("Post not found", 404);

  // 업데이트 데이터 구성
  const data: any = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.contentMd === "string") data.contentMd = body.contentMd;
  if (body.contentHtml !== undefined) data.contentHtml = body.contentHtml ?? null;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  // state 변경 처리 (PUBLISHED로 바뀌는 순간 publishedAt 찍기)
  if (body.state) {
    data.state = body.state;
    if (body.state === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
    if (body.state !== "PUBLISHED") data.publishedAt = null; // 원하면 유지하도록 바꿔도 됨
  }

  // tags 교체(전체 replace): set -> connect
  // body.tags가 없으면 tags는 건드리지 않음
  if (Array.isArray(body.tags)) {
    const tagSlugs = body.tags.map((t) => t.trim()).filter(Boolean);

    data.tags = {
      set: [], // 기존 연결 전체 제거
      ...(tagSlugs.length ? { connect: tagSlugs.map((slug) => ({ slug })) } : {}),
    };
  }

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
