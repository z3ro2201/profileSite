// app/api/blog/category/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const tree = url.searchParams.get("tree") === "1";

  if (tree) {
    // ✅ 트리 구조로 반환
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // 최상위만
        isPublic: true, // 공개만
        ...(q && {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }],
        }),
      },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        depth: true,
        children: {
          where: { isPublic: true },
          orderBy: [{ order: "asc" }, { id: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            order: true,
            depth: true,
            children: {
              where: { isPublic: true },
              orderBy: [{ order: "asc" }, { id: "asc" }],
              select: {
                id: true,
                name: true,
                slug: true,
                order: true,
                depth: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, categories });
  }

  // ✅ 플랫 리스트로 반환
  const categories = await prisma.category.findMany({
    where: {
      isPublic: true,
      ...(q && {
        OR: [{ name: { contains: q } }, { slug: { contains: q } }],
      }),
    },
    orderBy: [{ depth: "asc" }, { order: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      depth: true,
      order: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, categories });
}
