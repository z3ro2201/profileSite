import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Scope = "all" | "post" | "tag" | "category";

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

    // ✅ "필터 없음" 판정 (q/scope/category/tag/cursor/take 모두 없을 때)
    const hasQuery = !!q;
    const hasCategory = !!category;
    const hasTag = !!tag;
    const hasScope = (url.searchParams.get("scope") ?? "").trim().length > 0; // 명시된 경우만 true

    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? Number(cursorRaw) : null;
    if (cursorRaw && !Number.isFinite(cursor!)) return jsonBad("Invalid cursor");

    const takeRaw = url.searchParams.get("take");
    const isFeed = !hasQuery && !hasCategory && !hasTag && !hasScope && !cursorRaw && !takeRaw;

    // ✅ take: 기본 10이지만, feed(필터 없음)면 4로
    const take = clampInt(takeRaw, isFeed ? 4 : 10, 1, 50);

    // ---------------------------
    // where
    // ---------------------------
    const where: Prisma.PostWhereInput = {
      state: "PUBLISHED",
    };

    // ✅ scope-driven query
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

    // ✅ additional filters (AND)
    if (category) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { category: { slug: category } }];
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

        // ✅ feed 모드에서만 단건처럼 렌더할 본문을 내려줌
        contentHtml: isFeed,

        category: { select: { slug: true, name: true } },
        tags: { select: { slug: true, name: true } },
        author: { select: { name: true } },
      },
    });

    const nextCursor = posts.length === take ? posts[posts.length - 1]?.id ?? null : null;

    return NextResponse.json({
      ok: true,
      posts,
      nextCursor,
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
