import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "2ER0 - 유용한 도구 모음";
  const description = "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음입니다.";

  return {
    title,
    description,
    metadataBase: new URL("https://2er0.io"),
    openGraph: {
      title: "2ER0",
      description: "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음",
      url: "https://2er0.io/tools",
      type: "website",
      images: [
        {
          url: "/LostArkGemChart.webp",
          width: 1200,
          height: 630,
          alt: "로스트아크 보석 시세 차트",
        },
        {
          url: "/LostArkGemChart.png",
          width: 1200,
          height: 630,
          alt: "로스트아크 보석 시세 차트",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "2ER0",
      description: "2ER0가 만든 개인 애플리케이션과 실험용 프로그램 모음",
      images: ["/LostArkGemChart.webp", "/LostArkGemChart.png"],
    },
  };
};

type AppItem = {
  key: string;
  title: string;
  desc: string;
  href: string;
  image: string;
  badge: string;
  openApi?: boolean;
};

const APPS: AppItem[] = [
  {
    key: "lostark-gem-chart",
    title: "로스트아크 보석 시세 차트",
    desc: "로스트아크 보석 시세를 차트로 확인하고, 변동 내역과 OpenAPI를 제공합니다. (모코코봇에 제공된 기능입니다.)",
    href: "/tools/game/onstove/lostark/auction-chart/gemstone/작열/10",
    image: "/app/LostArkGemChart.webp",
    badge: "GAME",
    openApi: true,
  },
  {
    key: "lostark-sasa-finder",
    title: "로스트아크 사사게 검색기",
    desc: "로스트아크 인벤 사사게 게시판을 캐릭터명 기준으로 검색합니다. 제목·내용·닉네임 조건별 조회와 결과 링크를 제공합니다.",
    href: "/tools/game/onstove/lostark/sasaFind",
    image: "/app/LostArkSasaFind.webp",
    badge: "GAME",
    openApi: true,
  },
  {
    key: "ocr-vibe-coding",
    title: "이미지 OCR (Vibe Coding)",
    desc: "필요해서 바이브 코딩으로 만든 개인용 OCR 도구입니다. 업로드된 이미지는 서버에 저장되지 않으며 즉시 삭제됩니다.",
    href: "/tools/ocr",
    image: "/app/ocr.webp",
    badge: "UTILITY",
    openApi: false,
  },
  {
    key: "damoa-radio",
    title: "라디오",
    desc: "파편화된 라디오 앱을 한곳에 모아 청취할 수 있도록 했습니다.",
    href: "https://radio.2er0.io",
    image: "/app/damoaRadio.png",
    badge: "UTILITY",
    openApi: false,
  },
];

const ToolsPage = () => {
  return (
    <div className="pt-[calc(64px+1rem)] px-2 flex w-full h-[calc(100%-1rem)] justify-center">
      <div className="w-full max-w-5xl">
        <div className="mb-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm p-4">
          <h1 className="text-lg font-semibold text-gray-900">도구</h1>
          <p className="text-sm text-gray-700 mt-1">개인 앱 / 실험용 기능 모음</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {APPS.map((app) => (
            <Link
              key={app.key}
              href={app.href}
              className="group rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden hover:bg-white transition"
            >
              <div className="relative w-full aspect-[1200/630] bg-black/5">
                <Image
                  src={app.image}
                  alt={app.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] px-2 py-1 rounded-full border border-black/10 bg-white/70 text-gray-700">
                    {app.badge}
                  </span>

                  {app.openApi && (
                    <span className="text-[11px] px-2 py-1 rounded-full border border-black/10 bg-white/70 text-gray-700">
                      OpenAPI
                    </span>
                  )}
                </div>

                <div className="text-base font-semibold text-gray-900 group-hover:underline">{app.title}</div>
                <div className="text-sm text-gray-700 mt-1 line-clamp-2">{app.desc}</div>

                <div className="mt-3 text-xs text-gray-500 font-mono">{`https://2er0.io${app.href}`}</div>
              </div>
            </Link>
          ))}
        </div>

        {APPS.length === 0 && (
          <div className="w-full h-[240px] flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm text-gray-700">
            준비 중입니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;
