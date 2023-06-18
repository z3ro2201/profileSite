"use client";

import React, { useRef} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRss,faInfo } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Player from "../component/player";

import Link from 'next/link'

export default function Home() {
  const pageMain = useRef<HTMLDivElement>(null);
  const pageProfile = useRef<HTMLDivElement>(null);

  const openProfile = (e:any) => {
    e.preventDefault();
    if(pageProfile.current && pageMain.current) {
      pageProfile.current.classList.toggle('hidden');
      pageMain.current.classList.toggle('hidden');
    }
  }

  const openBlog = (e:any) => {
    alert('곧 조만간 오픈할게요');
    e.preventEvent();
  }

  

  return (
    <div className="theme-elgasia">
      <div id="pageMain" className="flex" ref={pageMain}>
        <div className="mb-4 p-2 text-center">
          <h1 className="m-1 text-2xl font-bold">환영메시지에요.</h1>
          <p className="text-base">홈페이지에 오신것을 환영해요.</p>
          <p className="text-base">(Next.js로 제작된 페이지 입니다.)</p>
          <p className="text-base">홈페이지에 오신것을 환영해요.</p>
        </div>
        <div className="quickLink">
          <Link className="linkProfile" href="#" onClick={e => openProfile}>
            <FontAwesomeIcon icon={faInfo} />
          </Link>
          <Link className="linkBlog" href="#" onClick={(e) => e.preventDefault}>
            <FontAwesomeIcon icon={faRss} />
          </Link>
          <Link className="linkGithub" href="//github.com/z3ro2201" target={'_blank'}>
            <FontAwesomeIcon icon={faGithub} />
          </Link>
        </div>
      </div>
      <div id="pageProfile" className="hidden" ref={pageProfile}>
        <div className="flex p-2 flex-row justify-between">
          <a href="" onClick={(e)=>e.preventDefault}>
            2er0.io
          </a>
          <nav className="flex">
            <Link href="#" className="py-2 px-4" onClick={e => openProfile(e)}>
              <span>처음화면</span>
            </Link>
            <Link href="#" className="py-2 px-4 font-bold underline" onClick={e => e.preventDefault}>
              <span>프로필</span>
            </Link>
            <Link href="#" className="py-2 px-4" onClick={(e) => openBlog}>
              <span>블로그</span>
            </Link>
            <Link href="//github.com/z3ro2201" target={'_blank'} className="py-2 px-4">
              <span>깃허브</span>
            </Link>
          </nav>
        </div>
      </div>
      <Player/>
    </div>
  )
}
