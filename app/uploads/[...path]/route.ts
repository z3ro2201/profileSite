import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, normalize } from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

type MaybePromise<T> = T | Promise<T>;

export async function GET(_req: Request, ctx: { params: MaybePromise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;

  // 경로 조작(../ 등) 방지 — storage/uploads 밖으로 못 나가게
  const relative = normalize(segments.join("/"));
  if (relative.startsWith("..") || relative.includes("..\\") || relative.includes("../")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = join(process.cwd(), "storage", "uploads", relative);

  try {
    const stats = await stat(filePath);
    if (!stats.isFile()) return new NextResponse("Not found", { status: 404 });

    const buffer = await readFile(filePath);
    const ext = "." + (filePath.split(".").pop() ?? "");
    const contentType = MIME_TYPES[ext.toLowerCase()] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // 파일명 자체가 타임스탬프+해시라 내용이 안 바뀌므로 강하게 캐싱해도 안전
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
