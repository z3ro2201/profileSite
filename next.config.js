/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    experimental: {
        appDir: true,
        transpilePackages: ["ui"],
    },
    webpack5 : true,
    webpack: (config) => {
      config.resolve.fallback = { fs : false, net : false, tls : false, cardinal : false };
      return config;
    },
}

module.exports = nextConfig
