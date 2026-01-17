import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma, PostState } from "@prisma/client";

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

function parseState(input: string | null): PostState | null {
  const v = (input ?? "").trim().toUpperCase();
  if (v === "DRAFT" || v === "PUBLISHED" || v === "ARCHIVED") return v;
  return null;
}

function pushAnd(where: Prisma.PostWhereInput, cond: Prisma.PostWhereInput) {
  const cur = where.AND;
  const arr = Array.isArray(cur) ? cur : cur ? [cur] : [];
  where.AND = [...arr, cond];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const scope = parseScope(url.searchParams.get("scope"));

    const category = (url.searchParams.get("category") ?? "").trim();
    const tag = (url.searchParams.get("tag") ?? "").trim();

    // ✅ admin 전용: state 파라미터 있으면 그 state만, 없으면 전체 3종
    const stateParam = parseState(url.searchParams.get("state"));

    // ✅ "필터 없음" 판정 (q/scope/category/tag/cursor/take 모두 없을 때)
    const hasQuery = !!q;
    const hasCategory = !!category;
    const hasTag = !!tag;
    const hasScope = (url.searchParams.get("scope") ?? "").trim().length > 0;

    const cursorRaw = url.searchParams.get("cursor");
    const cursor = cursorRaw ? Number(cursorRaw) : null;
    if (cursorRaw && !Number.isFinite(cursor!)) return jsonBad("Invalid cursor");

    const takeRaw = url.searchParams.get("take");
    const hasTake = (takeRaw ?? "").trim().length > 0;

    // ✅ admin에서도 기본 호출이면 feed처럼 4개만(원하면 10으로 바꿔도 됨)
    const isFeed = !hasQuery && !hasCategory && !hasTag && !hasScope && !cursorRaw && !hasTake;

    const takeDefault = isFeed ? 4 : 10;
    const take = clampInt(hasTake ? takeRaw : null, takeDefault, 1, 50);

    // ---------------------------
    // where
    // ---------------------------
    const where: Prisma.PostWhereInput = {};

    // ✅ state 필터는 요청에 있을 때만
    if (stateParam) where.state = stateParam;

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
    if (category) pushAnd(where, { category: { slug: category } });
    if (tag) pushAnd(where, { tags: { some: { slug: tag } } });

    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        state: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,

        // ✅ feed 모드에서만 본문 내려줌
        contentHtml: isFeed,

        category: {
          select: { id: true, slug: true, name: true },
        },

        tags: {
          select: { id: true, slug: true, name: true },
        },

        author: {
          select: { id: true, name: true },
        },
      },
    });

    const nextCursor = posts.length === take ? (posts[posts.length - 1]?.id ?? null) : null;

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
        state: stateParam,
      },
    });
  } catch (err) {
    console.error("❌ Admin post list error:", err);
    return jsonBad("Server error", 500);
  }
}
