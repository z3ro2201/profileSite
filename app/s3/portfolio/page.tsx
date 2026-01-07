import NoImage from "@/components/noimage";
import Image from "next/image";
import { GalleryContainer, GalleryPicture, GalleryInfo } from "@/components/gallery";
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
