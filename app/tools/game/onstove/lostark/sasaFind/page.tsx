import type { Metadata } from "next";
import SasaSearchForm from "@/layout/app/lostark/SasaSearchForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "로아 사사게 검색기 - 로스트아크 인벤 서버 사건/사고 게시판 검색 | 2ER0",
  description:
    "로스트아크 사사게(인벤 서버 사건/사고 게시판)에서 비매너 유저를 검색하세요. 캐릭터명으로 과거 사건 이력을 확인하고 반복 피해를 방지할 수 있습니다.",
  keywords:
    "사사게, 사사게검색기, 로아 사사게, 로아사사게, 로스트아크, 로스트아크 사사게, 인벤, 서버 사건사고, 비매너, 유저 검색, 캐릭터, Lost Ark",
  alternates: {
    canonical: "https://2er0.io/tools/game/onstove/lostark/sasaFind",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "로아 사사게 검색기",
    description: "로스트아크 사사게(인벤 서버 사건/사고 게시판) 비매너 유저 검색 도구",
    url: "https://2er0.io/tools/game/onstove/lostark/sasaFind",
    siteName: "2ER0",
  },
  twitter: {
    card: "summary",
    title: "로아 사사게 검색기",
    description: "로스트아크 사사게(인벤 서버 사건/사고 게시판) 비매너 유저 검색 도구",
  },
};

const SasaFindPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "로아 사사게 검색기",
    alternateName: ["사사게검색기", "로스트아크 사사게 검색기", "로아 사사게"],
    applicationCategory: "GameApplication",
    description: "로스트아크 사사게(인벤 서버 사건/사고 게시판) 검색 도구 - 비매너 유저 이력 확인",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    featureList: ["캐릭터명 검색", "제목/내용 검색", "닉네임 검색", "실시간 검색"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* 헤더 공간 */}
        <div className="pt-4 lg:pt-32 pb-4 lg:pb-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* 로고/타이틀 영역 */}
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                로아 사사게
                <span className="block mt-2 text-blue-600">서버 사건/사고 검색기</span>
              </h1>
              <p className="text-lg text-gray-600 mt-4">
                로스트아크 사사게(인벤 서버 사건/사고 게시판)에서 비매너 유저를 검색하고 반복 피해를 방지하세요
              </p>
            </div>

            {/* 검색 폼 */}
            <SasaSearchForm />

            {/* 설명 섹션 */}
            <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">빠른 검색</h3>
                <p className="text-sm text-gray-600">
                  캐릭터명만 입력하면 인벤 서버 사건/사고 게시판의 모든 관련 글을 찾아드립니다
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">피해 방지</h3>
                <p className="text-sm text-gray-600">
                  파티 매칭 전 캐릭터명을 검색하여 비매너 이력을 미리 확인할 수 있습니다
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">커뮤니티 검증</h3>
                <p className="text-sm text-gray-600">
                  로아 유저들이 공유한 비매너 행위 이력을 확인하고 안전한 플레이 환경을 만듭니다
                </p>
              </div>
            </div>

            {/* 사용 가이드 */}
            <div className="mt-16 max-w-2xl mx-auto bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">사용 방법</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">캐릭터명 입력</h3>
                    <p className="text-sm text-gray-600">검색하고 싶은 로스트아크 캐릭터명을 입력하세요</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">검색 범위 선택</h3>
                    <p className="text-sm text-gray-600">
                      <strong>제목+내용</strong> (추천): 게시글 전체에서 검색하여 누락 없이 확인
                      <br />
                      <strong>제목</strong>: 제목에 캐릭터명이 명시된 경우만 검색
                      <br />
                      <strong>내용</strong>: 본문에 언급된 경우 검색
                      <br />
                      <strong>닉네임</strong>: 작성자 닉네임으로 검색 (해당 유저가 작성한 모든 글)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">결과 확인 및 판단</h3>
                    <p className="text-sm text-gray-600">
                      검색 결과에서 해당 캐릭터의 비매너 행위 이력을 확인하고, 파티 참여 여부를 판단하세요. 글을
                      클릭하면 인벤 게시판에서 자세한 내용을 볼 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">자주 묻는 질문</h2>

              <div className="space-y-4">
                <details className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 cursor-pointer">
                  <summary className="font-semibold text-gray-900 select-none">사사게가 무엇인가요?</summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    사사게는 &apos;서버 사건/사고 게시판&apos;의 줄임말로, 로스트아크 인벤에 있는 게시판입니다. 게임
                    내에서 비매너 행위를 저지른 유저들을 게시하고, 다른 유저들이 반복적인 피해를 받지 않도록 정보를
                    공유하는 취지의 커뮤니티입니다. 대부분의 로아 유저들이 파티 매칭 전 확인하는 곳입니다.
                  </p>
                </details>

                <details className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 cursor-pointer">
                  <summary className="font-semibold text-gray-900 select-none">어떤 경우에 유용한가요?</summary>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    레이드나 던전 파티를 구할 때 캐릭터명을 검색하여 과거 비매너 행위 이력이 있는지 확인할 수 있습니다.
                    먹튀, 트롤링, 욕설, 강퇴 등의 이력을 미리 확인하여 피해를 방지할 수 있습니다. 또한 본인의 캐릭터명이
                    언급된 글이 있는지 확인할 때도 활용할 수 있습니다.
                  </p>
                </details>
              </div>
            </div>

            {/* 관련 도구 */}
            <div className="mt-16 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">다른 로스트아크 도구</h2>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link
                  href="/tools/game/onstove/lostark/auction-chart/gemstone/작열/10?updatetime=5m"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  보석 시세 차트
                </Link>{" "}
                <Link
                  href="/tools/game/onstove/lostark/market-chart/material/정제된%20파괴강석?updatetime=10m"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  재련재료 시세 차트
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SasaFindPage;
