import React from "react";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome,faUser,faRss } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Fnb() {
    return(
        <div className="absolute left-0 bottom-0 w-full">
            <div className="py-1 px-3 flex justify-end">
                <Link href="/" className="flex flex-col p-1 m-1">
                    <FontAwesomeIcon icon={faHome} size="lg"/>
                    <span className="block mt-1 text-xs">처음화면</span>
                </Link>
                <Link href="/profile" className="flex flex-col p-1 m-1">
                    <FontAwesomeIcon icon={faUser} size="lg"/>
                    <span className="block mt-1 text-xs">프로필</span>
                </Link>
                <Link href="/blog" className="flex flex-col p-1 m-1">
                    <FontAwesomeIcon icon={faRss} size="lg"/>
                    <span className="block mt-1 text-xs">블로그</span>
                </Link>
                <Link href="//github.com/z3ro2201" target="_blank" className="flex flex-col p-1 m-1">
                    <FontAwesomeIcon icon={faGithub} size="lg"/>
                    <span className="block mt-1 text-xs">깃허브</span>
                </Link>
            </div>
        </div>
    )
}