import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/s4",
        permanent: true, // 308 — 구글에 "/s4가 진짜 목적지"라는 신호를 명확히 줌
      },
    ];
  },
};

export default nextConfig;
