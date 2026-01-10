// app/api/blog/posts/route.ts
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
    const scope = parseScope(url.searchParams.get("scope")); // ✅ all|post|tag|category

    // ✅ optional filters (slug)
    const category = (url.searchParams.get("category") ?? "").trim();
    const tag = (url.searchParams.get("tag") ?? "").trim();

    const take = clampInt(url.searchParams.get("take"), 10, 1, 50);
    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? Number(cursorRaw) : null;
    if (cursorRaw && !Number.isFinite(cursor!)) return jsonBad("Invalid cursor");

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
        // tag "slug"로 검색 (원하면 name 검색도 OR로 추가 가능)
        where.tags = { some: { slug: q } };
      } else if (scope === "category") {
        where.category = { slug: q };
      } else {
        // scope === "all": OR 검색
        // - 제목 contains q
        // - 카테고리 slug가 q
        // - 태그 slug가 q
        where.OR = [{ title: { contains: q } }, { category: { slug: q } }, { tags: { some: { slug: q } } }];
      }
    }

    // ✅ additional filters (AND)
    // category/tag 파라미터가 들어오면 위 검색 조건과 함께 AND로 묶임
    if (category) {
      // where.category가 이미 있더라도 AND로 강제할 거면 아래 방식이 안전
      // (scope=category + category=... 같이 썼을 때도 일관됨)
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
      },
    });
  } catch (e) {
    // 내부 에러는 메시지 노출 최소화
    return jsonBad("Server error", 500);
  }
}
