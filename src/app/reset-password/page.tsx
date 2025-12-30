'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">認証機能が無効です。環境変数を確認してください。</p>
      </div>
    )
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setMessage(`エラー: ${error.message}`)
    } else {
      setMessage('パスワードリセット用のメールを送信しました。メール内のリンクをクリックしてパスワードを再設定してください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-indigo-950/30 p-8 rounded-3xl shadow-2xl border border-indigo-500/20">
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 mb-2 tracking-tighter cursor-pointer uppercase">
              タロット占い
            </h1>
          </Link>
          <p className="text-indigo-400/60 text-xs font-bold uppercase tracking-wider">
            パスワードリセット
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div>
            <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
              メールアドレス
            </label>
            <input
              type="email"
              className="w-full p-4 rounded-xl bg-black/40 text-indigo-100 border border-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed ${
              message.includes('エラー')
                ? 'bg-red-950/30 text-red-400 border border-red-900/50'
                : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50'
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600/80 text-white font-black h-14 rounded-xl shadow-lg hover:bg-indigo-500 transition active:scale-95 disabled:bg-gray-700 disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? '送信中...' : 'リセットメールを送信'}
            </button>

            <Link
              href="/login"
              className="w-full bg-transparent text-indigo-400/60 font-bold h-12 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 transition active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center"
            >
              ログインに戻る
            </Link>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-bold text-indigo-500/40 hover:text-indigo-400 transition uppercase tracking-widest">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
