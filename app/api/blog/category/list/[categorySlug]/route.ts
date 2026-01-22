// app/api/blog/posts/list/[categorySlug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ categorySlug: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { categorySlug } = await context.params;
    const url = new URL(req.url);

    const take = parseInt(url.searchParams.get("take") ?? "10");
    const cursor = url.searchParams.get("cursor");

    // ✅ 카테고리 정보 + 게시글 한 번에 조회
    const category = await prisma.category.findUnique({
      where: {
        slug: categorySlug,
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        depth: true,

        // ✅ 해당 카테고리의 게시글도 함께
        posts: {
          where: { state: "PUBLISHED" },
          orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
          take,
          ...(cursor
            ? {
                cursor: { id: parseInt(cursor) },
                skip: 1,
              }
            : {}),
          select: {
            id: true,
            title: true,
            publishedAt: true,
            contentHtml: true,
            tags: { select: { slug: true, name: true } },
            author: { select: { name: true } },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ ok: false, message: "Category not found" }, { status: 404 });
    }

    const nextCursor = category.posts.length === take ? (category.posts[category.posts.length - 1]?.id ?? null) : null;

    return NextResponse.json({
      ok: true,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      posts: category.posts,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
