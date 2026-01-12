'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'
import type { Locale } from '@/src/i18n/config'
import { getDictionary } from '@/src/i18n/utils'

export default function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const [dict, setDict] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  if (!dict) {
    return null
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">{dict.auth.authDisabled}</p>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`${dict.auth.errorPrefix}${error.message}`)
      setLoading(false)
    } else if (data.session) {
      router.push(`/${lang}`)
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
      setMessage(`${dict.auth.errorPrefix}${error.message}`)
    } else {
      setMessage(dict.auth.signUpSuccess)
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
      setMessage(`${dict.auth.errorPrefix}${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-magic"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-magic" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-magic" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-md w-full glass-strong p-10 rounded-3xl shadow-2xl border border-white/20 glow-purple relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <Link href={`/${lang}`}>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-3 tracking-tight cursor-pointer animate-gradient glow-text-purple leading-relaxed">
              {dict.title.split('|').map((part: string, index: number) => (
                <span key={index} className="block">
                  {part.trim()}
                </span>
              ))}
            </h1>
          </Link>
          <p className="text-purple-300/80 text-sm font-bold uppercase tracking-wider">
            {isSignUp ? dict.auth.signUpTitle : dict.auth.loginTitle}
          </p>
        </div>

        <form className="space-y-5" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div>
            <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 uppercase block mb-3 ml-1 tracking-wider">
              {dict.auth.email}
            </label>
            <input
              type="email"
              className="w-full p-4 rounded-xl bg-black/30 text-indigo-50 border-2 border-white/20 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 outline-none transition-all duration-300 placeholder:text-indigo-300/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.auth.emailPlaceholder}
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 uppercase block mb-3 ml-1 tracking-wider">
              {dict.auth.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-4 pr-16 rounded-xl bg-black/30 text-indigo-50 border-2 border-white/20 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 outline-none transition-all duration-300 font-mono placeholder:text-indigo-300/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.auth.passwordPlaceholder}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300/70 hover:text-purple-200 transition-colors"
              >
                {showPassword ? (
                  <span className="text-xs font-bold uppercase">{dict.auth.hidePassword}</span>
                ) : (
                  <span className="text-xs font-bold uppercase">{dict.auth.showPassword}</span>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed ${
              message.includes(dict.auth.errorPrefix)
                ? 'bg-red-950/30 text-red-400 border border-red-900/50'
                : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50'
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-col gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white font-black h-14 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? dict.auth.processing : (isSignUp ? dict.auth.signUpButton : dict.auth.loginButton)}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="glass px-3 py-1 text-purple-300/80 font-bold rounded-full">{dict.auth.or}</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={loading}
              className="w-full bg-white text-gray-800 font-bold h-13 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 disabled:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {dict.auth.googleLogin}
            </button>

            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage(null)
              }}
              type="button"
              className="w-full bg-white/5 text-purple-300 hover:text-purple-200 font-bold h-12 rounded-xl border-2 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider"
            >
              {isSignUp ? dict.auth.switchToLogin : dict.auth.switchToSignUp}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-3">
          {!isSignUp && (
            <Link href={`/${lang}/reset-password`} className="block text-sm font-bold text-purple-300/70 hover:text-purple-200 transition-colors">
              {dict.auth.forgotPassword}
            </Link>
          )}
          <Link href={`/${lang}`} className="block text-sm font-bold text-pink-300/60 hover:text-pink-200 transition-colors uppercase tracking-wider">
            {dict.auth.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
