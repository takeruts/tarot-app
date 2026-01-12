'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/src/i18n/config'

export default function AuthCallbackPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const router = useRouter()

  useEffect(() => {
    // 認証後、言語別ホームページにリダイレクト
    router.push(`/${lang}`)
  }, [router, lang])

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-indigo-400 font-black text-xl uppercase tracking-widest mb-4">
          認証中...
        </div>
        <p className="text-indigo-300/60 text-sm">
          ホームページにリダイレクトしています...
        </p>
      </div>
    </div>
  )
}
