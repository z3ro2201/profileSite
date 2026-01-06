import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faQuestion, faEnvelope, faReply, faBlog } from "@fortawesome/free-solid-svg-icons";
import { GalleryVerticalEndIcon } from "lucide-react";

import { resolveLocale } from "@/lib/i18n/resolveLocale";
import { getDict } from "@/lib/i18n/dict";

import Link from "next/link";

const Season3Main = async () => {
  const locale = await resolveLocale();
  const { social } = getDict(locale);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <Image src="/s3/profile.webp" width={250} height={250} alt="메인페이지 프로필 사진, 뭐해야 해요 모코콩?" className="mb-4" />
      <h3 className="font-bold text-lg">SEASON 3</h3>
      <div className="my-2 p-2 whitespace-pre-line text-center font-bold bg-[rgba(255,255,255,.5)] rounded-lg underline">{social.player}</div>
      <ul className="s3-main mb-2">
        <li>
          <Link href="/s3/profile">
            <FontAwesomeIcon icon={faQuestion} />
          </Link>
          <span className="textSubtitles">{social.simpleProfile}</span>
        </li>

        <li>
          <Link href="https://instagram.com/doit.2er0" target="_blank">
            <FontAwesomeIcon icon={faInstagram} />
          </Link>
          <span className="textSubtitles">{social.instagram}</span>
        </li>

        <li>
          <Link href="https://github.com/z3ro2201" target="_blank">
            <FontAwesomeIcon icon={faGithub} />
          </Link>
          <span className="textSubtitles">{social.github}</span>
        </li>

        <li>
          <Link href="/blog">
            <FontAwesomeIcon icon={faBlog} />
          </Link>
          <span className="textSubtitles">{social.blog}</span>
        </li>

        <li>
          <Link href="/s3/portfolio">
            <GalleryVerticalEndIcon />
          </Link>
          <span className="textSubtitles">{social.portfolio}</span>
        </li>
      </ul>

      <div className="mt-4">
        <Link href="/s2/" className="flex items-center gap-2 underline">
          <FontAwesomeIcon icon={faReply} className="w-4" />
          {social.oldsite}
        </Link>
      </div>

      <div className="mt-4">
        <Link href="mailto:hello@2er0.io" className="flex gap-1 items-center underline">
          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
          hello@2er0.io
        </Link>
      </div>
    </div>
  );
};

export default Season3Main;
