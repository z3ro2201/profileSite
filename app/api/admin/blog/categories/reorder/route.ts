import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  items: Array<{
    id: number;
    order: number;
    parentId?: number | null; // ✅ 추가
  }>;
};

export async function PUT(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const items = body?.items ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, message: "items is required" }, { status: 400 });
  }

  const ids = items.map((x) => Number(x.id));
  if (ids.some((n) => !Number.isFinite(n) || n <= 0)) {
    return NextResponse.json({ ok: false, message: "invalid id" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      items.map((x) => {
        const data: any = { order: Math.trunc(Number(x.order)) };

        // ✅ parentId 변경도 지원
        if ("parentId" in x) {
          data.parentId = x.parentId || null;
        }

        return prisma.category.update({
          where: { id: x.id },
          data,
        });
      }),
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Reorder error:", e);
    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}
