import OcrClient from "@/layout/app/ocr/ocrClient";

export const dynamic = "force-static";

import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "이미지 텍스트 추출 OCR - 무료 온라인 도구 | 2ER0",
    description: "이미지 속 텍스트를 무료로 추출하세요. 업로드한 이미지는 서버에 저장하지 않고 처리 후 즉시 삭제됩니다. (개인이 필요해서 만든 도구입니다)",
    keywords: "OCR, 이미지 텍스트 추출, 사진 글자 추출, 온라인 OCR, 무료 OCR, 이미지에서 텍스트 추출",
    alternates: { canonical: "https://2er0.io/tools/ocr" },
    robots: { index: true, follow: true },
    openGraph: {
      title: "이미지 텍스트 추출 OCR - 무료 온라인 도구",
      description: "이미지 속 텍스트를 무료로 추출하세요. 이미지 파일은 저장되지 않고, 처리 후 즉시 삭제됩니다.",
      url: "https://2er0.io/tools/ocr",
      type: "website",
    },
    twitter: {
      title: "이미지 텍스트 추출 OCR - 무료 온라인 도구",
      description: "이미지 속 텍스트를 무료로 추출하세요. 이미지 저장 없이 즉시 텍스트만 추출합니다.",
    },
  };
};

const OcrPage = () => {
  return (
    <div className="relative pt-[calc(64px+2rem)] min-h-dvh px-2 flex flex-col w-full items-center justify-center text-[0.9rem] overflow-x-hidden">
      <div className="p-4 w-full lg:w-[600px] bg-white/80 rounded-lg">
        <h1 className="mb-2 text-3xl font-bold">이미지 OCR</h1>
        <p className="mb-2 text-sm text-neutral-600">이미지 업로드 후 텍스트를 추출합니다.</p>

        {/* 🔐 개인정보/보안 안내 */}
        <p className="mb-8 text-xs text-red-500 max-w-xl leading-relaxed font-extrabold">업로드된 이미지는 OCR 처리를 위해서만 일시적으로 사용되며, 서버에 저장되지 않고 처리 완료 후 즉시 삭제됩니다.</p>

        <OcrClient />
      </div>
    </div>
  );
};

export default OcrPage;
