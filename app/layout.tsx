import "./globals.css";
import Player from "@/components/player";

export const metadata = {
  title: "start all over again",
  description: "처음부터 다시 시작하다.",
  colorScheme: "dark",
  authors: {
    name: "2ER0",
  },
  openGraph: {
    title: "start all over agin",
    description: "처음부터 다시 시작하다.",
    url: "https://2er0.io",
    siteName: "2er0.io",
    images: [
      {
        url: "/s2/elgasia.jpg",
        width: 3408,
        height: 1432,
      },
    ],
    locale: "ko-KR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Player />
      </body>
    </html>
  );
}
