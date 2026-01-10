import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import { faReply } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2ERO.io - 환영메시지에요.",
  description: "환영메시지에요. 홈페이지에 오신것을 환영해요. 브금이 흘러나오니 소리를 켜주세요.",
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="mb-4 p-2 text-center">
        <h1 className="m-1 text-2xl font-bold">환영메시지에요.</h1>
        <p className="text-base">홈페이지에 오신것을 환영해요.</p>
        <p className="text-base">브금이 흘러나오니 소리를 켜주세요.</p>
      </div>
      <div className="flex justify-center">
        <Link className="mr-5 flex justify-center items-center w-[60px] h-[60px] rounded-full bg-slate-800 text-[1.5em]" href="/s2/profile">
          <FontAwesomeIcon icon={faInfo} />
        </Link>
        <Link className="flex justify-center items-center w-[60px] h-[60px] rounded-full bg-slate-800 text-[1.5em]" href="//github.com/z3ro2201" target={"_blank"}>
          <FontAwesomeIcon icon={faGithub} />
        </Link>
      </div>
      <div className="mt-4">
        <Link href="/s3" className="flex justify-center items-center gap-1 underline">
          <FontAwesomeIcon icon={faReply} className="w-4" />
          리뉴얼 된 사이트로 이동
        </Link>
      </div>
    </div>
  );
}
