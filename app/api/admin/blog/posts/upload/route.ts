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
    let buffer: Buffer<ArrayBufferLike> = Buffer.from(bytes);
    let mimeType = file.type;
    let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

    // 이미지는 webp로 변환해서 저장 (용량 절감). SVG는 벡터라 그대로 두고,
    // GIF는 애니메이션 보존을 시도하되 실패하면 원본 그대로 저장.
    if (mimeType.startsWith("image/") && mimeType !== "image/svg+xml" && mimeType !== "image/webp") {
      try {
        const isGif = mimeType === "image/gif";
        buffer = await sharp(buffer, isGif ? { animated: true } : undefined)
          .webp({ quality: 82 })
          .toBuffer();
        mimeType = "image/webp";
        ext = "webp";
      } catch (error) {
        console.error("webp 변환 실패, 원본 형식으로 저장합니다:", error);
      }
    }

    // 체크섬 생성 (webp로 바뀌었으면 바뀐 버퍼 기준으로)
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 파일명 생성
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

    if (mimeType.startsWith("image/")) {
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
        mimeType,
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
