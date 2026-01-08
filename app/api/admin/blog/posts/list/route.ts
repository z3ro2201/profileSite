import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const state = url.searchParams.get("state"); // 없으면 전체
  const q = (url.searchParams.get("q") ?? "").trim();

  const where: any = {
    ...(state ? { state: state.toUpperCase() } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true, title: true, state: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, posts });
}
