"use client";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faRss } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Link from 'next/link'


export default function Home() {

  const openBlog = (e:any) => {
    e.preventDefault();
    alert('곧 조만간 오픈할게요');
  }

  

  return (
    <div className="flex flex-col">
      <div className="mb-4 p-2 text-center">
        <h1 className="m-1 text-2xl font-bold">환영메시지에요.</h1>
        <p className="text-base">홈페이지에 오신것을 환영해요.</p>
        <p className="text-base">브금이 흘러나오니 소리를 켜주세요.</p>
      </div>
      <div className="flex justify-center">
        <Link className="mr-5 flex justify-center items-center w-[60px] h-[60px] rounded-full bg-slate-800 text-[1.5em]" href="/profile">
          <FontAwesomeIcon icon={faInfo} />
        </Link>
        <Link className="mr-5 flex justify-center items-center w-[60px] h-[60px] rounded-full bg-slate-800 text-[1.5em]" href="/blog">
          <FontAwesomeIcon icon={faRss} />
        </Link>
        <Link className="flex justify-center items-center w-[60px] h-[60px] rounded-full bg-slate-800 text-[1.5em]" href="//github.com/z3ro2201" target={'_blank'}>
          <FontAwesomeIcon icon={faGithub} />
        </Link>
      </div>
    </div>
  )
}
