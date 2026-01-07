import "./globals.css";
import type { Metadata } from "next";
import ClientShell from "@/layout/ClientShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://2er0.io"),
  title: "2ER0 - 처음부터 다시 시작하다.",
  description: "처음부터 다시 시작하다.",
  colorScheme: "light",
  themeColor: "#ffffff",
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
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
