import React, {useState} from "react";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome,faUser,faRss } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Fnb() {
    return(
        <div className="flex w-full h-16 flex-nowrap bg-neutral-900 border-b border-netrual-800 justify-between">
            <div className="">
                <button></button>
                <Link href="/"></Link>
            </div>
            <nav className="flex justify-between items-center">
                <Link href="/">처음화면</Link>
                <Link href="/profile">프로필</Link>
                <Link href="/blog/login">로그인</Link>
            </nav>
            <div className="">
                <div className=""></div>
                <button></button>
            </div>
        </div>
    )
}