import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const q = (url.searchParams.get("q") ?? "").trim();
  const category = (url.searchParams.get("category") ?? "").trim(); // category slug
  const tag = (url.searchParams.get("tag") ?? "").trim(); // tag slug

  const takeRaw = Number(url.searchParams.get("take") ?? "10");
  const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 50) : 10;

  const cursorRaw = url.searchParams.get("cursor");
  const cursor = cursorRaw ? Number(cursorRaw) : null;

  if (cursorRaw && !Number.isFinite(cursor!)) return bad("Invalid cursor");

  const where: any = {
    state: "PUBLISHED",
    ...(q ? { title: { contains: q } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { slug: tag } } } : {}),
  };

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

  return NextResponse.json({ ok: true, posts, nextCursor });
}
