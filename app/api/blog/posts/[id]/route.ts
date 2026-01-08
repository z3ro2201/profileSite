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
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { slug: true, name: true } },
      tags: { select: { slug: true, name: true } },
      author: { select: { name: true } },
    },
  });

  if (!post) return bad("Post not found", 404);

  return NextResponse.json({ ok: true, post });
}
