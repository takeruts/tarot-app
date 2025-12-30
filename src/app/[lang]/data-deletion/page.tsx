'use client'

import { use, useState, useEffect } from 'react'
import { getDictionary } from '@/src/i18n/utils'
import { Locale } from '@/src/i18n/config'
import Link from 'next/link'

export default function DataDeletionPage({
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {dict.dataDeletion.title}
          </h1>
          <p className="text-indigo-300 text-lg">
            {dict.dataDeletion.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 space-y-8">
          {/* What Data We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.dataDeletion.whatWeCollect.title}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-indigo-100">
              {dict.dataDeletion.whatWeCollect.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* How to Delete Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.dataDeletion.howToDelete.title}
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-indigo-100">
              {dict.dataDeletion.howToDelete.steps.map((step: string, index: number) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </section>

          {/* Deletion Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.dataDeletion.timeline.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.dataDeletion.timeline.description}
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-300 mb-4">
              {dict.dataDeletion.contact.title}
            </h2>
            <p className="text-indigo-100 leading-relaxed">
              {dict.dataDeletion.contact.description}
            </p>
            <a
              href={`mailto:support@tarotai.jp?subject=${encodeURIComponent(dict.dataDeletion.contact.emailSubject)}`}
              className="inline-block mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition-colors"
            >
              {dict.dataDeletion.contact.emailButton}
            </a>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href={`/${lang}`}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {dict.dataDeletion.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
