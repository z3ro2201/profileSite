// lib/fileHelpers.ts

type FileData = {
  storage: string;
  bucket: string | null;
  objectKey: string;
  id?: string;
};

export function getFileUrl(file: FileData | null | undefined): string | null {
  if (!file) return null;

  const { storage, bucket, objectKey } = file;

  // S3 + CloudFront
  if (storage === "s3" && process.env.CLOUDFRONT_DOMAIN) {
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${objectKey}`;
  }

  // S3 Direct
  if (storage === "s3" && bucket) {
    const region = process.env.AWS_REGION || "ap-northeast-2";
    return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
  }

  // Local
  if (storage === "local") {
    return `/uploads/${objectKey}`;
  }

  // Fallback
  return file.id ? `/api/files/${file.id}` : null;
}

// 배열용 헬퍼
export function getFileUrls(files: FileData[]): string[] {
  return files.map(getFileUrl).filter(Boolean) as string[];
}
