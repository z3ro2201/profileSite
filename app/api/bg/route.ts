import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const ROOT_DIR = path.join(process.cwd(), "public", "s3");

// 허용 확장자
const ALLOW_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 경로 탈출 방지: a/b 같은 정상 폴더만 허용
function safeFolder(input: string) {
  const f = (input || "").trim();
  if (!f) return "";
  // 영문/숫자/대시/언더바만 허용 (필요하면 확장 가능)
  if (!/^[a-zA-Z0-9_-]+$/.test(f)) return "";
  return f;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = safeFolder(searchParams.get("folder") ?? "");

    if (!folder) {
      return NextResponse.json({ ok: false, error: "Invalid folder" }, { status: 400 });
    }

    const dir = path.join(ROOT_DIR, folder);

    // 존재 확인 + 파일 목록
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = entries
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return ALLOW_EXT.has(ext);
      });

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "No images" }, { status: 404 });
    }

    const file = pickRandom(files);

    // public 기준 URL 반환
    const url = `/s3/${folder}/${file}`;

    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
