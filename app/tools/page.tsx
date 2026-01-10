import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "2ER0 - 유용한 도구 모음",
    description: "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음입니다.",
    openGraph: {
      title: "2ER0",
      description: "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음",
      url: "https://2er0.io/tools",
      type: "website",
    },
    twitter: {
      title: "2ER0",
      description: "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음",
    },
  };
};

const ToolsPage = () => {
  return (
    <div className="pt-[calc(64px+1rem)] px-2 flex w-full h-[calc(100%-1rem)] justify-center">
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl">준비 중입니다.</div>
    </div>
  );
};

export default ToolsPage;
