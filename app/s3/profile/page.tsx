import Image from "next/image";
import Link from "next/link";

import { resolveLocale } from "@/lib/i18n/resolveLocale";
import { getDict } from "@/lib/i18n/dict";

const Season3Profile = async () => {
  const locale = await resolveLocale();
  const { profile } = getDict(locale);

  return (
    <div className="w-full h-full flex justify-center items-center select-none">
      <div className="p-4 m-2 w-full md:w-[24rem] bg-[var(--secondary-color)] border-1 border-[var(--navTabLink)] rounded-sm">
        <div className="pb-2 mb-2 flex justify-between items-center border-b-2 border-[var(--primary-text)]">
          <div className="flex flex-col gap-1">
            <h3 className="text-[26px] font-bold">{profile.siteTitle}</h3>
            <span className="block text-[15px]">{profile.siteDescription}</span>
          </div>
          <Image src="/s3/profile-bg.webp" width={75} height={75} alt="쓰다듬어줘!!" />
        </div>

        <div className="s3-row">
          <h3>{profile.nameTitle}</h3>
          <span>{profile.name}</span>
        </div>
        <div className="s3-row">
          <h3>{profile.gameNameTitle}</h3>
          <span>{profile.gameName}</span>
        </div>
        <div className="s3-row">
          <h3>{profile.emailTitle}</h3>
          <span>
            <Link href="mailto:hello@2er0.io">hello@2er0.io</Link>
          </span>
        </div>
        <div className="s3-row">
          <h3>{profile.githubTitle}</h3>
          <span>
            <Link href="//github.com/z3ro2201">z3ro2201</Link>
          </span>
        </div>
        <div className="s3-row">
          <h3>{profile.programLanguageTitle}</h3>
          <span>JavaScript, CSS, PHP</span>
        </div>
      </div>
    </div>
  );
};
export default Season3Profile;
