import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Scope = "all" | "post" | "tag" | "category";

type CategoryWithChildren = {
  id: number;
  name: string;
  slug: string;
  depth: number;
  children: {
    id: number;
    name: string;
    slug: string;
    depth: number;
    children?: {
      id: number;
      name: string;
      slug: string;
      depth: number;
    }[];
  }[];
};

function jsonBad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function parseScope(input: string | null): Scope {
  const s = (input ?? "").trim().toLowerCase();
  if (s === "post" || s === "tag" || s === "category" || s === "all") return s;
  return "all";
}

function clampInt(raw: string | null, def: number, min: number, max: number) {
  const n = Number(raw ?? "");
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const scope = parseScope(url.searchParams.get("scope"));

    const category = (url.searchParams.get("category") ?? "").trim();
    const tag = (url.searchParams.get("tag") ?? "").trim();

    const hasQuery = !!q;
    const hasCategory = !!category;
    const hasTag = !!tag;
    const hasScope = (url.searchParams.get("scope") ?? "").trim().length > 0;

    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? Number(cursorRaw) : null;
    if (cursorRaw && !Number.isFinite(cursor!)) return jsonBad("Invalid cursor");

    const takeRaw = url.searchParams.get("take");
    const isFeed = !hasQuery && !hasCategory && !hasTag && !hasScope && !cursorRaw && !takeRaw;

    const take = clampInt(takeRaw, isFeed ? 10 : 10, 1, 50);

    // ✅ 카테고리 정보 + 하위 카테고리 ID 수집
    const categoryInfoPromise = category
      ? prisma.category.findUnique({
          where: { slug: category, isPublic: true },
          select: {
            id: true,
            name: true,
            slug: true,
            depth: true,
            children: {
              where: { isPublic: true },
              orderBy: [{ order: "asc" }, { id: "asc" }],
              select: {
                id: true,
                name: true,
                slug: true,
                depth: true,
                description: true,

                children: {
                  where: { isPublic: true },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    depth: true,
                  },
                },
              },
            },
          },
        })
      : null;

    const categoryInfo = await categoryInfoPromise;

    // ✅ 현재 카테고리 + 모든 하위 카테고리 ID 수집
    const categoryIds: number[] = [];
    if (categoryInfo) {
      categoryIds.push(categoryInfo.id);

      // 1단계 하위
      categoryInfo.children.forEach((child) => {
        categoryIds.push(child.id);

        // 2단계 하위
        child.children?.forEach((grandChild) => {
          categoryIds.push(grandChild.id);
        });
      });
    }

    // where 조건
    const where: Prisma.PostWhereInput = {
      state: "PUBLISHED",
    };

    if (q) {
      if (scope === "post") {
        where.title = { contains: q };
      } else if (scope === "tag") {
        where.tags = { some: { slug: q } };
      } else if (scope === "category") {
        where.category = { slug: q };
      } else {
        where.OR = [{ title: { contains: q } }, { category: { slug: q } }, { tags: { some: { slug: q } } }];
      }
    }

    // ✅ 카테고리 필터: 현재 + 하위 카테고리 모두 포함
    if (categoryIds.length > 0) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { categoryId: { in: categoryIds } }];
    }

    if (tag) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { tags: { some: { slug: tag } } }];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        contentHtml: isFeed,
        category: { select: { slug: true, name: true } },
        tags: { select: { slug: true, name: true } },
        author: { select: { name: true } },
      },
    });

    const nextCursor = posts.length === take ? (posts[posts.length - 1]?.id ?? null) : null;

    return NextResponse.json({
      ok: true,
      posts,
      nextCursor,
      ...(categoryInfo && { categoryInfo }),
      meta: {
        q,
        scope,
        category,
        tag,
        take,
        cursor,
        mode: isFeed ? "feed" : "list",
      },
    });
  } catch {
    return jsonBad("Server error", 500);
  }
}
