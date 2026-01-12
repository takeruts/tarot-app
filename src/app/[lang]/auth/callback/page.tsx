'use client'

import { useEffect, use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import type { Locale } from '@/src/i18n/config'

export default function AuthCallbackPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setError('認証システムが利用できません')
        return
      }

      try {
        // URLからコードを取得してセッションを交換
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          return
        }

        // セッション確立後、ホームページにリダイレクト
        router.push(`/${lang}`)
        router.refresh()
      } catch (err) {
        console.error('Callback error:', err)
        setError('認証処理中にエラーが発生しました')
      }
    }

    handleCallback()
  }, [supabase, router, lang])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 font-black text-xl mb-4">
            認証エラー
          </div>
          <p className="text-indigo-300/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push(`/${lang}/login`)}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    )
  }

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
