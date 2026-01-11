import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faQuestion, faEnvelope, faReply, faBlog, faRss } from "@fortawesome/free-solid-svg-icons";
import { GalleryVerticalEndIcon, AppWindowIcon } from "lucide-react";

import { DEFAULT_LOCALE } from "@/lib/i18n/i18n";
import { getDict } from "@/lib/i18n/dict";

import Link from "next/link";

import type { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "2ER0",
    description: "개발과 기록을 쌓아가는 공간. 블로그, 프로젝트, 그리고 개인적인 메모를 정리합니다.",
    openGraph: {
      title: "2ER0",
      description: "개발과 기록을 쌓아가는 공간. 블로그와 프로젝트를 한 곳에.",
      url: "https://2er0.io/s3",
      type: "website",
    },
    twitter: {
      title: "2ER0",
      description: "개발과 기록을 쌓아가는 공간. 블로그와 프로젝트를 한 곳에.",
    },
  };
};

export const dynamic = "force-static";

const Season3Main = async () => {
  const { social } = getDict(DEFAULT_LOCALE);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-2">
      <Image src="/s3/profile.webp" width={250} height={250} alt="메인페이지 프로필 사진, 뭐해야 해요 모코콩?" className="mb-4" />
      <h1 className="font-bold text-lg" role="banner">
        2ERO HOME SEASON 3
      </h1>
      <div className="my-2 p-2 whitespace-pre-line text-center font-bold bg-[rgba(255,255,255,.5)] rounded-lg underline">{social.player}</div>
      <ul className="s3-main mb-2">
        <li>
          <Link href="/s3/profile" title={social.simpleProfile}>
            <FontAwesomeIcon icon={faQuestion} />
          </Link>
          <span className="textSubtitles">{social.simpleProfile}</span>
        </li>

        <li>
          <Link href="https://github.com/z3ro2201" target="_blank" title={social.github}>
            <FontAwesomeIcon icon={faGithub} />
          </Link>
          <span className="textSubtitles">{social.github}</span>
        </li>

        <li>
          <Link href="/blog/prologue" title={social.blog}>
            <FontAwesomeIcon icon={faBlog} />
          </Link>
          <span className="textSubtitles">{social.blog}</span>
        </li>

        <li>
          <Link href="/s3/portfolio" title={social.portfolio}>
            <GalleryVerticalEndIcon />
          </Link>
          <span className="textSubtitles">{social.portfolio}</span>
        </li>

        <li>
          <Link href="/tools" title={social.app}>
            <AppWindowIcon />
          </Link>
          <span className="textSubtitles">{social.app}</span>
        </li>

        <li>
          <Link href="/rss.xml" target="_blank" title={social.rss}>
            <FontAwesomeIcon icon={faRss} />
          </Link>
          <span className="textSubtitles">{social.rss}</span>
        </li>
      </ul>

      <div className="mt-4">
        <Link href="/s2/" className="flex items-center gap-2 underline" title={social.oldsite}>
          <FontAwesomeIcon icon={faReply} className="w-4" />
          {social.oldsite}
        </Link>
      </div>

      <div className="mt-4">
        <Link href="mailto:hello@2er0.io" className="flex gap-1 items-center underline" title="전자우편으로 연락하기">
          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
          hello@2er0.io
        </Link>
      </div>
    </div>
  );
};

export default Season3Main;
