"use client";

import { useState } from "react";
import Player from "@/components/player";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [bgImage, setBgImage] = useState<string>("");

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

      <Player bgFolder="lostark" onBgImageChange={setBgImage} />
    </>
  );
}
