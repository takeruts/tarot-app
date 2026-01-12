'use client'

import { useEffect, use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Locale } from '@/src/i18n/config'

export default function AuthCallbackPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError('認証システムが利用できません')
        return
      }

      // implicitフロー用のクライアントを作成
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'implicit',
          detectSessionInUrl: true,
        },
      })

      try {
        // implicitフローでは、ハッシュフラグメントからセッションを自動検出
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (session) {
          // セッションが確立されたらホームページにリダイレクト
          router.push(`/${lang}`)
          router.refresh()
        } else {
          // セッションがない場合は少し待ってから再試行
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              router.push(`/${lang}`)
              router.refresh()
            } else {
              setError('セッションの取得に失敗しました')
            }
          }, 1000)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('認証処理中にエラーが発生しました')
      }
    }

    handleCallback()
  }, [router, lang])

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
