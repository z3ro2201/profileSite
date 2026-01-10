import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
  ],
  sitemap: "https://2er0.io/sitemap.xml",
});

export default robots;
