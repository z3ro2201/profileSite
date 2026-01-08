import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PostUpsertProp } from "@/types/Posts";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ Next 16이 요구하는 타입
) {
  const { id } = await ctx.params; // ✅ 반드시 await
  const postId = Number(id);
  if (!Number.isFinite(postId)) return bad("Invalid post id");

  let body: Partial<PostUpsertProp>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, publishedAt: true },
  });
  if (!existing) return bad("Post not found", 404);

  const data: any = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.contentMd === "string") data.contentMd = body.contentMd;
  if (body.contentHtml !== undefined) data.contentHtml = body.contentHtml ?? null;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  if (body.state) {
    data.state = body.state;
    if (body.state === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
    if (body.state !== "PUBLISHED") data.publishedAt = null; // 원하면 유지로 변경 가능
  }

  if (Array.isArray(body.tags)) {
    const tagSlugs = body.tags.map((t) => t.trim()).filter(Boolean);
    data.tags = {
      set: [],
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
