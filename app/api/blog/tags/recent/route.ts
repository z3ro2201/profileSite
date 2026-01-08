import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

/**
 * "최신 태그" 정의:
 * - PUBLISHED 글에 연결된 태그들 중
 * - 해당 태그가 달린 글들의 MAX(publishedAt/createdAt)이 최근인 순
 * - take 만큼 반환
 *
 * 전제:
 * - Prisma implicit M:N 이면 조인 테이블 이름이 `_PostToTag` (기본값)일 가능성이 큼
 * - 만약 다르면 아래 SQL의 테이블명/컬럼명을 너 DB에 맞게 바꿔야 함
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const takeRaw = Number(url.searchParams.get("take") ?? "10");
  const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 30) : 10;

  // ✅ Prisma implicit M:N 기본 조인 테이블은 `_PostToTag`
  // 컬럼은 보통 `A`(Post.id), `B`(Tag.id)
  // (만약 조인 테이블명이 다르면 여기서만 수정하면 됨)
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        slug: string;
        name: string;
        usedCount: bigint; // MySQL count는 bigint로 올 수 있음
        lastUsedAt: Date | null;
      }>
    >`
      SELECT
        t.id,
        t.slug,
        t.name,
        COUNT(*) AS usedCount,
        MAX(COALESCE(p.publishedAt, p.createdAt)) AS lastUsedAt
      FROM Tag t
      INNER JOIN _PostToTag pt ON pt.B = t.id
      INNER JOIN Post p ON p.id = pt.A
      WHERE p.state = 'PUBLISHED'
      GROUP BY t.id, t.slug, t.name
      ORDER BY lastUsedAt DESC
      LIMIT ${take};
    `;

    const tags = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      usedCount: Number(r.usedCount),
      lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
    }));

    return NextResponse.json({ ok: true, tags });
  } catch (e: any) {
    // 조인 테이블명이 다를 때 여기로 떨어질 가능성 큼
    return bad("Failed to load recent tags. Check M:N join table name (e.g. _PostToTag).", 500);
  }
}
