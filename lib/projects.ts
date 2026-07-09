import "server-only";
import { prisma } from "@/lib/prisma";
import type { DetailItem } from "@/app/s4/_lib/theme";

export async function getProjects(): Promise<DetailItem[]> {
  const rows = await prisma.project.findMany({
    where: { isPublic: true },
    orderBy: { order: "asc" },
  });

  return rows.map((r: (typeof rows)[number]) => ({
    id: r.slug,
    emoji: r.emoji,
    title: r.title,
    subtitle: r.subtitle,
    category: r.category,
    color: r.color,
    period: r.period,
    contribution: r.contribution,
    url: r.url ?? undefined,
    github: r.github ?? undefined,
    body: r.body,
    stack: r.stack as { label: string; items: string[] }[],
    year: r.year ?? undefined,
    tags: (r.tags as string[] | null) ?? undefined,
  }));
}
