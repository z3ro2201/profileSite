import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = { items: Array<{ id: number; order: number }> };

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
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, message: "duplicate id" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((x) =>
      prisma.category.update({
        where: { id: x.id },
        data: { order: Math.trunc(Number(x.order)) },
      })
    )
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}
