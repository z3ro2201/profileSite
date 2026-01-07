import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/s3",
        permanent: false, // true = 308
      },
    ];
  },
};

export default nextConfig;
