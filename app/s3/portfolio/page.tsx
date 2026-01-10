import NoImage from "@/components/noimage";
import Image from "next/image";
import { GalleryContainer, GalleryPicture, GalleryInfo } from "@/components/gallery";

import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "포트폴리오";
  const description = "웹 개발자 2ER0의 포트폴리오입니다. 과거 수상이력과, 취미로 만든 PHP·Next.js·Node.js·Asterisk 기반 사이드 프로젝트를 정리했습니다.";

  return {
    title,
    description,

    openGraph: {
      title: `2ER0 ${title}`,
      description,
      url: "https://2er0.io/s3/profile", // 실제 경로로 맞춰줘
      siteName: "2er0.io",
      type: "website",
      images: [
        {
          url: "/preview.png", // 전역 OG 이미지 재사용 or 포트폴리오 전용 이미지
          width: 1200,
          height: 630,
          alt: "2ER0 Portfolio OpenGraph Image",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `2ER0 ${title}`,
      description,
      images: ["/preview.png"],
    },
  };
};

const PortfolioPage = () => {
  return (
    <div className="pt-[calc(64px+1rem)] px-2 flex w-full justify-center">
      <div className="px-2 w-11/12 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="'08 동서울대 홈페이지 경진대회 [장려]" date="2008-11-18" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="'09 동서울대 홈페이지 경진대회 [우수]" date="2009-11-13" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="nuribom.kr (PHP, 그누보드)" date="2015" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="아이폰프렌즈 (PHP, 그누보드)" date="2016" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="전자문서 시스템 (PHP)" date="2018-05-10" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="영재교육원 자가진단 v1 (PHP)" date="2020-12-30" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="영재교육원 자가진단 v2 (PHP)" date="2022-02-01" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="로스트아크 카카오봇 (node.js)" date="2023-10-16" />
        </GalleryContainer>

        <GalleryContainer>
          <GalleryPicture>
            <NoImage />
          </GalleryPicture>
          <GalleryInfo title="RPBX (Asterisk, 인터넷전화 연동)" date="2025-01-20" />
        </GalleryContainer>

        <GalleryContainer link="//omni.2er0.io/mgnt/main" target="_blank" title="옴니 컨트롤러 (에어컨)">
          <GalleryPicture>
            <Image src={"/portfolio/omniController.png"} width={295} height={195} alt="옴니컨트롤러" />
          </GalleryPicture>
          <GalleryInfo title="옴니 컨트롤러 (node.js, 로그인 필요)" date="2025-12-30" />
        </GalleryContainer>
      </div>
    </div>
  );
};

export default PortfolioPage;
