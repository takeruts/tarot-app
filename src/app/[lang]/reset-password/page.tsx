'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import type { Locale } from '@/src/i18n/config'
import { getDictionary } from '@/src/i18n/utils'

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const [dict, setDict] = useState<any>(null)

  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  if (!dict) return null

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <Link href={`/${lang}`}>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 mb-4 tracking-tighter cursor-pointer uppercase">
              {dict.title}
            </h1>
          </Link>
          <p className="text-indigo-400/80 text-sm md:text-base font-bold uppercase tracking-wider">
            {dict.auth.forgotPassword}
          </p>
        </div>

        <div className="text-center py-16">
          <p className="text-indigo-300/60 text-lg mb-8">
            Coming Soon
          </p>
          <Link href={`/${lang}/login`} className="text-indigo-400 hover:text-indigo-300 transition">
            {dict.resetPassword?.backToLogin || dict.auth.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
