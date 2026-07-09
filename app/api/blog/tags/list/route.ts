import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공개(PUBLISHED) 글에 실제로 달린 태그만, 글 개수와 함께 반환.
// _count로 전체 연결 수를 세면 비공개 글도 포함되므로, PUBLISHED 필터가 걸린
// posts 관계를 직접 세야 해서 raw query로 처리.
export async function GET() {
  const rows = await prisma.$queryRaw<Array<{ id: number; slug: string; name: string; count: bigint }>>`
    SELECT t.id, t.slug, t.name, COUNT(pt.A) as count
    FROM Tag t
    JOIN _PostToTag pt ON pt.B = t.id
    JOIN Post p ON p.id = pt.A
    WHERE p.state = 'PUBLISHED'
    GROUP BY t.id, t.slug, t.name
    ORDER BY count DESC
  `;

  const tags = rows.map((r: { id: number; slug: string; name: string; count: bigint }) => ({ id: r.id, slug: r.slug, name: r.name, count: Number(r.count) }));

  return NextResponse.json({ ok: true, tags });
}
