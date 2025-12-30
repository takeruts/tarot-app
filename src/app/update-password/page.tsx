'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const supabase = getSupabaseClient()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">認証機能が無効です。環境変数を確認してください。</p>
      </div>
    )
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage('エラー: パスワードが一致しません')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('エラー: パスワードは6文字以上である必要があります')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(`エラー: ${error.message}`)
      setLoading(false)
    } else {
      setMessage('パスワードを更新しました。ログインページに移動します...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
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
            新しいパスワードを設定
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleUpdatePassword}>
          <div>
            <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-4 pr-14 rounded-xl bg-black/40 text-indigo-100 border border-indigo-500/30 focus:border-indigo-400 outline-none transition-all font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/60 hover:text-indigo-300 transition"
              >
                <span className="text-xs font-bold uppercase">
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
              パスワード確認
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-4 rounded-xl bg-black/40 text-indigo-100 border border-indigo-500/30 focus:border-indigo-400 outline-none transition-all font-mono"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600/80 text-white font-black h-14 rounded-xl shadow-lg hover:bg-indigo-500 transition active:scale-95 disabled:bg-gray-700 disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? '更新中...' : 'パスワードを更新'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs font-bold text-indigo-500/40 hover:text-indigo-400 transition uppercase tracking-widest">
            ← ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
