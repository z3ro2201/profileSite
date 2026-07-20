import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

type MaybePromise<T> = T | Promise<T>;

export async function GET(_req: Request, ctx: { params: MaybePromise<{ id: string }> }) {
  const { id } = await ctx.params; // ✅ 핵심: await
  const postId = Number(id);

  if (!Number.isFinite(postId)) return bad("Invalid post id");

  const post = await prisma.post.findFirst({
    where: { id: postId, state: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      contentMd: true,
      contentHtml: true,
      aiSummary: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      lat: true,
      lng: true,
      placeName: true,
      address: true,
      mapOnly: true,
      icon: true,
      color: true,
      category: { select: { slug: true, name: true, icon: true, color: true } },
      tags: { select: { slug: true, name: true } },
      author: { select: { name: true } },
      files: {
        where: { role: "thumbnail" },
        select: {
          file: { select: { objectKey: true, mimeType: true, width: true, height: true } },
        },
        take: 1,
      },
    },
  });

  if (!post) return bad("해당 포스트를 찾을 수 없습니다.", 404);

  const { files, ...rest } = post;
  const thumbnail = files[0]?.file ?? null;

  return NextResponse.json({ ok: true, post: { ...rest, thumbnail } });
}
