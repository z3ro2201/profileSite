"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import useIsMobile from "@/lib/isMobile";

import { MenuIcon } from "lucide-react";

type Social = {
  home: string;
  simpleProfile: string;
  blog: string;
  github: string;
  rss: string;
  player: string;
  oldsite: string;
  portfolio: string;
  app: string;
};

export default function Season3LayoutClient({ children, social }: { children: ReactNode; social: Social }) {
  const pathname = usePathname();
  const isMain = pathname === "/s3";
  const isMobile = useIsMobile();

  const [mobileMenuActive, setMobileMenuActive] = useState<boolean>(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuActive(false);
  }, [isMobile]);

  return (
    <div className="min-w-[300px] w-full min-h-[600px] h-full flex flex-col bg-[#caf289]/50 text-[var(--primary-text)] overflow-auto" role="main">
      <button
        type="button"
        className={cn(isMain ? "hidden" : "fixed top-2 right-2 w-[35px] h-[35px] flex lg:hidden items-center justify-center bg-gray-200 rounded-full text-black z-100")}
        onClick={() => {
          if (!isMobile) return;
          setMobileMenuActive((prev) => !prev);
        }}
      >
        <MenuIcon size={14} />
      </button>
      <nav className={cn(isMain ? "hidden" : "s3-menu", isMobile && mobileMenuActive && "active")} role="menu">
        <Link href="/s3" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.home}>
          {social.home}
        </Link>
        <Link href="/s3/profile" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.simpleProfile}>
          {social.simpleProfile}
        </Link>
        <Link href="/blog/prologue" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.blog}>
          {social.blog}
        </Link>
        <Link href="//github.com/z3ro2201" target="_blank" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.github}>
          {social.github}
        </Link>
        <Link href="/s3/portfolio" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.portfolio}>
          {social.portfolio}
        </Link>
        <Link href="/tools" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.app}>
          {social.app}
        </Link>
        <Link href="/rss.xml" target="_blank" onClick={() => setMobileMenuActive((prev) => !prev)} title={social.rss}>
          {social.rss}
        </Link>
      </nav>

      {children}
    </div>
  );
}
