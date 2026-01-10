import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const categories = await prisma.category.findMany({
    where: q
      ? {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }],
        }
      : undefined,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return NextResponse.json({ ok: true, categories });
}
