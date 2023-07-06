"use client";
import React from "react";
import Link from 'next/link'

export default function Home() {

  return (
      <div className="flex w-full h-full flex-col">
        <div className="flex p-2 w-full justify-end">
          <nav className="flex flex-col sm:hidden md:flex-row">
            <Link href="/" className="py-2 px-4">
              <span>처음화면</span>
            </Link>
            <Link href="/profile" className="py-2 px-4 font-bold underline" onClick={e => e.preventDefault}>
              <span>프로필</span>
            </Link>
            <Link href="//github.com/z3ro2201" target={'_blank'} className="py-2 px-4">
              <span>깃허브</span>
            </Link>
          </nav>
        </div>
        <div className="flex w-full h-[calc(100%-56px)] justify-center items-center">
          <div className="m-4 p-4 w-96 bg-neutral-500 rounded-md">
            <div className="mb-4 pb-2 border-b">
              <h1 className="text-xl font-bold">2ER0</h1>
              <p>현생에서 고통받는 HUMAN</p>
            </div>
            <div className="lg:flex flex-auto lg:flex-row lg:justify-between">
              <div className="sm:w-full sm:mb-4 lg:w-3/6">
                <h2 className="font-bold">Nickname</h2>
                <p>컴맹</p>
              </div>
              <div className="sm:w-full lg:w-3/6">
                <h2 className="font-bold">Game nickname</h2>
                <p>자유를향한외침</p>
              </div>
            </div>
            <div className="lg:flex mb-4 flex-auto lg:flex-row lg:justify-between">
              <div className="sm:w-full lg:w-3/6">
                <h2 className="font-bold">Email</h2>
                <p>
                  <Link href="mailto:sinuk1991@gmail.com">
                    sinuk1991@gmail.com
                  </Link>
                </p>
              </div>
              <div className="sm:w-full lg:w-3/6">
                <h2 className="font-bold">GitHub</h2>
                <p>
                  <Link href="//github.com/z3ro2201">
                    z3ro2201
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex mb-4 flex-row justify-between">
              <div className="w-full">
                <h2 className="font-bold">Language</h2>
                <p>JavaScript, CSS, PHP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
