"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

import { MenuIcon } from "lucide-react";

type Social = {
  home: string;
  simpleProfile: string;
  blog: string;
  github: string;
  instagram: string;
  player: string;
  oldsite: string;
};

export default function Season3LayoutClient({ children, social }: { children: ReactNode; social: Social }) {
  const pathname = usePathname();
  const isMain = pathname === "/s3";

  const [mobileMenuActive, setMobileMenuActive] = useState<boolean>(false);

  return (
    <div className="w-full h-full flex flex-col bg-[var(--primary-bg)] text-[var(--primary-text)]">
      <button type="button" className={cn(isMain ? "hidden" : "fixed top-2 right-2 w-[35px] h-[35px] flex lg:hidden items-center justify-center bg-gray-200 rounded-full text-black z-100")} onClick={() => setMobileMenuActive((prev) => !prev)}>
        <MenuIcon size={14} />
      </button>
      <nav className={cn(isMain ? "hidden" : `${mobileMenuActive ? "active" : ""} s3-menu`)}>
        <Link href="/s3" onClick={() => setMobileMenuActive((prev) => !prev)}>
          {social.home}
        </Link>
        <Link href="/s3/profile" onClick={() => setMobileMenuActive((prev) => !prev)}>
          {social.simpleProfile}
        </Link>
        <Link href="//github.com/z3r02201" target="_blank" onClick={() => setMobileMenuActive((prev) => !prev)}>
          {social.github}
        </Link>
        <Link href="//instagram.com/doit.2er0" target="_blank" onClick={() => setMobileMenuActive((prev) => !prev)}>
          {social.instagram}
        </Link>
      </nav>

      {children}
    </div>
  );
}
