import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PostUpsertProp } from "@/types/Posts";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  let body: PostUpsertProp;

  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const title = (body.title ?? "").trim();
  const contentMd = body.contentMd ?? "";
  const authorId = body.authorId;

  if (!title) return bad("title is required");
  if (!contentMd) return bad("contentMd is required");
  if (!authorId || typeof authorId !== "number") return bad("authorId is required");

  const state = body.state ?? "DRAFT";
  const publishedAt = state === "PUBLISHED" ? new Date() : null;

  // tags는 slug 배열이라고 가정
  const tagSlugs = Array.isArray(body.tags) ? body.tags.map((t) => t.trim()).filter(Boolean) : [];

  // categoryId optional
  const categoryId = body.categoryId === undefined ? null : body.categoryId; // undefined면 null로 처리

  const created = await prisma.post.create({
    data: {
      title,
      contentMd,
      contentHtml: body.contentHtml ?? null,
      state,
      publishedAt,

      authorId,
      categoryId,

      ...(tagSlugs.length
        ? {
            tags: {
              connect: tagSlugs.map((slug) => ({ slug })),
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      state: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, post: created }, { status: 201 });
}
