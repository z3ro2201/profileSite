import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 파일 버퍼 생성
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 체크섬 생성
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 파일명 생성
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${hash.substring(0, 12)}.${ext}`;

    // 저장 경로 (년/월)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    // ⚠️ public/uploads에 저장하면 Next.js(next start)가 새로 추가된 정적 파일을
    // 프로세스 재시작 전까지 404로 응답하는 캐싱 이슈가 있어서(실서버에서 확인됨),
    // public 밖(storage/uploads)에 저장하고 별도 라우트(app/uploads/[...path]/route.ts)로
    // 직접 서빙한다. URL 경로(/uploads/...)는 그대로라 기존 DB의 objectKey는 안 바뀜.
    const uploadDir = join(process.cwd(), "storage", "uploads", String(year), month);
    await mkdir(uploadDir, { recursive: true });

    // 파일 저장
    const filepath = join(uploadDir, fileName);
    await writeFile(filepath, buffer);

    // 이미지 메타데이터 추출
    let width: number | null = null;
    let height: number | null = null;

    if (file.type.startsWith("image/")) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      } catch (error) {
        console.error("Failed to extract image metadata:", error);
      }
    }

    // DB에 파일 정보 저장
    const savedFile = await prisma.file.create({
      data: {
        storage: "local",
        objectKey: `/uploads/${year}/${month}/${fileName}`,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: BigInt(buffer.length),
        checksumSha256: hash,
        width,
        height,
      },
    });

    // Toast UI Editor 형식으로 응답
    return NextResponse.json({
      url: `/uploads/${year}/${month}/${fileName}`,
      fileId: savedFile.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
