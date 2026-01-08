"use client";

import { useState } from "react";
import Player from "@/components/player";
import { usePathname } from "next/navigation";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bgImage, setBgImage] = useState<string>("");

  // blog 혹은 admin 페이지가 아닌경우에는 배경이미지를 보여줌
  if (!pathname.startsWith("/blog") && !pathname.startsWith("/admin")) {
    return (
      <>
        <div
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
          }}
        >
          {children}
        </div>

        <Player onBgImageChange={setBgImage} />
      </>
    );
  }

  // 블로그가 아닌경우 배경이미지를 보여주지 않음
  return (
    <>
      {children}
      {/* <Player onBgImageChange={setBgImage} /> */}
    </>
  );
}
