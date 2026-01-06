import Image from "next/image";

const Season3Profile = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="p-4 m-2 w-full md:w-[24rem] bg-[var(--secondary-color)] border-1 border-[var(--navTabLink)] rounded-sm">
        <div className="pb-2 mb-2 flex justify-between items-center border-b-2 border-[var(--primary-text)]">
          <div className="flex flex-col gap-1">
            <h3 className="text-[26px] font-bold">2ER0</h3>
            <span className="block text-[15px]">현생에서 고통받는 인간</span>
          </div>
          <Image src="/s3/profile-bg.webp" width={75} height={75} alt="쓰다듬어줘!!" />
        </div>

        <div className="s3-row">
          <h3>별명</h3>
          <span>컴맹</span>
        </div>
        <div className="s3-row">
          <h3>로스트아크 별명</h3>
          <span>자유를향한외침</span>
        </div>
        <div className="s3-row">
          <h3>전자우편</h3>
          <span>hello@2er0.io</span>
        </div>
        <div className="s3-row">
          <h3>GitHub</h3>
          <span>z3r02201</span>
        </div>
        <div className="s3-row">
          <h3>기술</h3>
          <span>JavaScript, CSS, PHP, Java Springboot</span>
        </div>
      </div>
    </div>
  );
};
export default Season3Profile;
