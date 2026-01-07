import Image from "next/image";
import Link from "next/link";

import { DEFAULT_LOCALE } from "@/lib/i18n/i18n";
import { getDict } from "@/lib/i18n/dict";

export const dynamic = "force-static";

const Season3Profile = async () => {
  const { profile } = getDict(DEFAULT_LOCALE);

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
          <span className="underline">
            <Link href="https://lostark.game.onstove.com/Profile/Character/자유를찾아서외쳐라" target="_blank">
              {profile.gameName}
            </Link>
          </span>
        </div>
        <div className="s3-row">
          <h3>{profile.emailTitle}</h3>
          <span className="underline">
            <Link href="mailto:hello@2er0.io">hello@2er0.io</Link>
          </span>
        </div>
        <div className="s3-row">
          <h3>{profile.githubTitle}</h3>
          <span className="underline">
            <Link href="//github.com/z3ro2201">z3ro2201</Link>
          </span>
        </div>
        <div className="s3-row">
          <h3>{profile.programLanguageTitle}</h3>
          <ul>
            <li>
              <strong>Frontend:</strong> HTML · CSS · JavaScript · React · Next.js
            </li>
            <li>
              <strong>Backend:</strong> Node.js · PHP · Spring Boot
            </li>
            <li>
              <strong>Database:</strong> MySQL (MariaDB) · NoSQL
            </li>
            <li>
              <strong>Linux / Server:</strong> Ubuntu · Rocky Linux · Debian
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Season3Profile;
