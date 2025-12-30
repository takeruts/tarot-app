import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Zen_Kaku_Gothic_New } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from '@/src/i18n/config';
import { getDictionary } from '@/src/i18n/utils';

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

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const baseUrl = 'https://www.tarotai.jp';
  const locale = lang === 'ja' ? 'ja_JP' : lang === 'zh' ? 'zh_CN' : 'en_US';

  return {
    title: `${dict.title} | ${dict.subtitle}`,
    description: dict.description,
    keywords: lang === 'ja'
      ? ["タロット占い", "AI占い", "無料占い", "ケルティッククロス", "内面整理", "恋愛占い", "仕事占い", "悩み相談"]
      : lang === 'zh'
      ? ["塔罗占卜", "AI占卜", "免费占卜", "凯尔特十字", "内心整理", "恋爱占卜", "工作占卜", "烦恼咨询"]
      : ["Tarot Reading", "AI Tarot", "Free Tarot", "Celtic Cross", "Inner Clarity", "Love Reading", "Career Reading", "Life Guidance"],
    authors: [{ name: "TarotAI" }],
    creator: "TarotAI",
    publisher: "TarotAI",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'ja': '/ja',
        'en': '/en',
        'zh': '/zh',
      },
    },
    openGraph: {
      title: `${dict.title} | ${dict.subtitle}`,
      description: dict.description,
      url: `${baseUrl}/${lang}`,
      siteName: dict.title,
      locale: locale,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${dict.title} - ${dict.subtitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.title} | ${dict.subtitle}`,
      description: dict.description,
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
      google: 'your-google-verification-code',
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${zenKaku.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
