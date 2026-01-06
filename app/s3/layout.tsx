"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";

const Season3Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isMain = pathname === "/s3";
  return (
    <div className="w-full h-full flex flex-col bg-[var(--primary-bg)] text-[var(--primary-text)]">
      <nav className={cn(isMain ? "hidden" : "s3-menu")}>
        <Link href={"/s3"}>첫화면</Link>
        <Link href={"/s3/profile"}>프로필</Link>
        <Link href={"//github.com/z3r02201"} target="_blank">
          GitHub
        </Link>
        <Link href={"//instagram.com/doit.2er0"} target="_blank">
          인스타그램
        </Link>
      </nav>
      {children}
    </div>
  );
};

export default Season3Layout;
