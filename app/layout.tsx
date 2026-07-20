import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import ClientShell from "@/layout/ClientShell";
import VisitorTracker from "@/components/analytics/VisitorTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://2er0.io"),
  title: "2ER0 - 처음부터 다시 시작하다.",
  description: "처음부터 다시 시작하다.",
  authors: [{ name: "2ER0" }],
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png", sizes: "250x250" }],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "2ER0 - 처음부터 다시 시작하다.",
    description: "처음부터 다시 시작하다.",
    url: "https://2er0.io",
    siteName: "2er0.io",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/preview.png", width: 3408, height: 1432, alt: "2ER0 OpenGraph Image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "2ER0 - 처음부터 다시 시작하다.",
    description: "처음부터 다시 시작하다.",
    images: ["/preview.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "2er0",
    url: "https://2er0.io/s3",
    email: "hello@2er0.io",
    sameAs: ["https://github.com/z3ro2201", "https://instagram.com/doit.2er0"],
  };
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6002054718389108"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-6002054718389108" />
      </head>
      <body>
        <Script
          id="jsonld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientShell>{children}</ClientShell>
        <VisitorTracker />
      </body>
    </html>
  );
}
