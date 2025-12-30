'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const router = useRouter()
  const supabase = getSupabaseClient()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">認証機能が無効です。環境変数を確認してください。</p>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`エラー: ${error.message}`)
      setLoading(false)
    } else if (data.session) {
      router.push('/')
      router.refresh()
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`エラー: ${error.message}`)
    } else {
      setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`エラー: ${error.message}`)
      setLoading(false)
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
            {isSignUp ? '新規アカウント作成' : 'ログイン'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
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

          <div>
            <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
              パスワード
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
                {showPassword ? (
                  <span className="text-xs font-bold uppercase">Hide</span>
                ) : (
                  <span className="text-xs font-bold uppercase">Show</span>
                )}
              </button>
            </div>
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
              {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-500/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-indigo-950/30 px-2 text-indigo-400/60 font-bold">または</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="w-full bg-white text-gray-800 font-bold h-12 rounded-xl shadow-lg hover:bg-gray-100 transition active:scale-95 disabled:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </button>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage(null)
              }}
              type="button"
              className="w-full bg-transparent text-indigo-400/60 font-bold h-12 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 transition active:scale-95 text-xs uppercase tracking-wider"
            >
              {isSignUp ? 'ログインに戻る' : '新規アカウント作成'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-3">
          {!isSignUp && (
            <Link href="/reset-password" className="block text-xs font-bold text-indigo-400/60 hover:text-indigo-300 transition">
              パスワードを忘れた場合
            </Link>
          )}
          <Link href="/" className="block text-xs font-bold text-indigo-500/40 hover:text-indigo-400 transition uppercase tracking-widest">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
