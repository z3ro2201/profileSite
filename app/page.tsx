"use client";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRss,faInfo } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import Link from 'next/link'

export default function Home() {

  const openBlog = (e:any) => {
    e.preventDefault();
    alert('곧 조만간 오픈할게요');
  }

  

  return (
    <div className="theme-elgasia">
      <div id="pageMain" className="flex">
        <div className="mb-4 p-2 text-center">
          <h1 className="m-1 text-2xl font-bold">환영메시지에요.</h1>
          <p className="text-base">홈페이지에 오신것을 환영해요.</p>
          <p className="text-base">브금이 흘러나오니 소리를 켜주세요.</p>
        </div>
        <div className="quickLink">
          <Link className="linkProfile" href="/profile">
            <FontAwesomeIcon icon={faInfo} />
          </Link>
          <Link className="linkGithub" href="//github.com/z3ro2201" target={'_blank'}>
            <FontAwesomeIcon icon={faGithub} />
          </Link>
        </div>
      </div>
    </div>
  )
}
