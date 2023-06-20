import './globals.css'
import { Inter } from 'next/font/google'
import Player from '../component/player'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'start all over again',
  description: '처음부터 다시 시작하다.',
  colorScheme: 'dark',
  authors: {
    name: '2ER0'
  },
  openGraph: {
    title: 'start all over agin',
    description: '처음부터 다시 시작하다.',
    url: 'https://2er0.io',
    siteName: '2er0.io',
    images: [
      {
        url: '/elgasia.jpg',
        width: 3408,
        height: 1432
      }
    ],
    locale: 'ko-KR',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Player/>
      </body>
    </html>
  )
}
