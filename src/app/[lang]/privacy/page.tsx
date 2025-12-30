'use client'

import { use, useState, useEffect } from 'react'
import { getDictionary } from '@/src/i18n/utils'
import { Locale } from '@/src/i18n/config'
import Link from 'next/link'

export default function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params) as { lang: Locale }
  const [dict, setDict] = useState<any>(null)

  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  if (!dict) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white flex items-center justify-center">
        <div className="text-indigo-300">Loading...</div>
      </div>
    )
  }

  // 日本語以外は簡易版を表示
  if (lang !== 'ja') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-indigo-300 text-lg">
              Last Updated: January 1, 2025
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 space-y-6">
            <p className="text-indigo-100 leading-relaxed text-center text-lg">
              {lang === 'en' ? 'Full English version coming soon.' : '完整中文版即将推出。'}
            </p>
            <p className="text-indigo-100 leading-relaxed text-center">
              {lang === 'en'
                ? 'Please refer to the Japanese version for detailed privacy policy.'
                : '请参阅日文版获取详细隐私政策。'}
            </p>
            <div className="text-center">
              <Link
                href="/ja/privacy"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-colors"
              >
                {lang === 'en' ? 'View Japanese Version' : '查看日文版'}
              </Link>
            </div>
            <div className="text-center pt-4">
              <p className="text-indigo-200">
                {lang === 'en' ? 'Contact:' : '联系我们：'}
              </p>
              <a
                href="mailto:support@tarotai.jp"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                support@tarotai.jp
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href={`/${lang}`}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              {lang === 'en' ? 'Back to Home' : '返回主页'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {dict.privacy.title}
          </h1>
          <p className="text-indigo-300 text-lg">
            {dict.privacy.lastUpdated}: 2025年1月1日
          </p>
        </div>

        {/* Content */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-indigo-100 leading-relaxed">
              {dict.privacy.intro}
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.infoCollect.title}
            </h2>
            <div className="space-y-4">
              {dict.privacy.infoCollect.sections.map((section: any, index: number) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold text-indigo-200 mb-2">
                    {section.subtitle}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-indigo-100 ml-4">
                    {section.items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.howWeUse.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-indigo-100">
              {dict.privacy.howWeUse.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.dataSharing.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed mb-4">
              {dict.privacy.dataSharing.description}
            </p>
            <ul className="list-disc list-inside space-y-2 text-indigo-100">
              {dict.privacy.dataSharing.cases.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.dataSecurity.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.privacy.dataSecurity.description}
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.yourRights.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-indigo-100">
              {dict.privacy.yourRights.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.cookies.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.privacy.cookies.description}
            </p>
          </section>

          {/* Third Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.thirdParty.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-indigo-100">
              {dict.privacy.thirdParty.services.map((service: string, index: number) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.children.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.privacy.children.description}
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.changes.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.privacy.changes.description}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.privacy.contact.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed mb-4">
              {dict.privacy.contact.description}
            </p>
            <a
              href="mailto:support@tarotai.jp"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-colors"
            >
              support@tarotai.jp
            </a>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href={`/${lang}`}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {dict.privacy.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
