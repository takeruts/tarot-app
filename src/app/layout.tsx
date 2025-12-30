import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "AIタロット占い | 無料で本格的な内面整理ツール",
  description: "AIがケルティッククロス・スプレッドであなたの悩みを深く読み解く無料タロット占い。恋愛・仕事・人間関係など、カードを通して新しい視点で自分の内面を整理できます。",
  keywords: ["タロット占い", "AI占い", "無料占い", "ケルティッククロス", "内面整理", "恋愛占い", "仕事占い", "悩み相談"],
  authors: [{ name: "TarotAI" }],
  creator: "TarotAI",
  publisher: "TarotAI",
  metadataBase: new URL('https://www.tarotai.jp'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AIタロット占い | 無料で本格的な内面整理ツール",
    description: "AIがケルティッククロス・スプレッドであなたの悩みを深く読み解く無料タロット占い。恋愛・仕事・人間関係など、カードを通して新しい視点で自分の内面を整理できます。",
    url: 'https://www.tarotai.jp',
    siteName: 'AIタロット占い',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AIタロット占い - 内面を整理する神託',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AIタロット占い | 無料で本格的な内面整理ツール",
    description: "AIがケルティッククロス・スプレッドであなたの悩みを深く読み解く無料タロット占い",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Google Search Consoleで取得
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${zenKaku.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
