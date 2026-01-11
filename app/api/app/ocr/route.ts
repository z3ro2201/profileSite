import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

function safeLang(lang: string | null) {
  const allow = new Set(["eng", "kor", "jpn", "kor+eng", "jpn+eng", "kor+eng+jpn"]);
  if (!lang) return "kor+eng+jpn";
  return allow.has(lang) ? lang : "kor+eng+jpn";
}

function safePsm(psm: string | null) {
  // 3=auto, 4=single column, 6=block, 7=single line, 11=sparse text
  const allow = new Set(["3", "4", "6", "7", "11"]);
  if (!psm) return "6";
  return allow.has(psm) ? psm : "6";
}

async function preprocessWithMagick(inputPath: string, outputPath: string) {
  // ImageMagick 7 기준: magick
  // -auto-orient : EXIF 회전 보정
  // -colorspace Gray : 그레이
  // -resize 200% : 작은 글자 개선
  // -unsharp : 선명도
  // -contrast-stretch : 대비
  await execFileAsync("magick", [inputPath, "-auto-orient", "-colorspace", "Gray", "-resize", "200%", "-unsharp", "0x1", "-contrast-stretch", "0", outputPath]);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "file 필드가 필요합니다. (multipart/form-data)" }, { status: 400 });
    }

    const lang = safeLang(form.get("lang")?.toString() ?? null);
    const psm = safePsm(form.get("psm")?.toString() ?? null);

    const buf = Buffer.from(await file.arrayBuffer());

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ocr-"));
    const ext = path.extname(file.name || "") || ".png";
    const inPath = path.join(tmpDir, `${randomUUID()}${ext}`);
    const prePath = path.join(tmpDir, `${randomUUID()}-pre.png`);

    await fs.writeFile(inPath, buf);

    // ✅ 전처리 (실패해도 원본으로 진행)
    let ocrInputPath = inPath;
    try {
      await preprocessWithMagick(inPath, prePath);
      ocrInputPath = prePath;
    } catch {
      // magick 미설치/에러면 그냥 원본으로
      ocrInputPath = inPath;
    }

    const args = [
      ocrInputPath,
      "stdout",
      "-l",
      lang,
      "--oem",
      "1", // LSTM 엔진 고정(대부분 더 안정적)
      "--psm",
      psm,

      // ✅ 자잘하지만 체감 있는 옵션들
      "-c",
      "preserve_interword_spaces=1",
      "-c",
      "tessedit_do_invert=0", // 흰 배경 검은 글자 기준 (반전 필요하면 1)
      // 필요시:
      // "-c", "user_defined_dpi=300",
    ];

    const { stdout } = await execFileAsync("tesseract", args, { maxBuffer: 30 * 1024 * 1024 });

    await fs.rm(tmpDir, { recursive: true, force: true });

    return NextResponse.json({
      ok: true,
      lang,
      psm,
      text: stdout?.trim() ?? "",
      preprocessed: ocrInputPath === prePath,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message ?? "OCR 실패" }, { status: 500 });
  }
}
