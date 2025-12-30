'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'

export default function ProfilePage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const loadUserData = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const user = session.user
      setEmail(user.email || '')
      setNickname(user.user_metadata?.nickname || '')
      setUserLoading(false)
    }

    loadUserData()
  }, [router, supabase])

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">認証機能が無効です。環境変数を確認してください。</p>
      </div>
    )
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-indigo-400">読み込み中...</p>
      </div>
    )
  }

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (nickname.trim().length === 0) {
      setMessage('エラー: ニックネームを入力してください')
      setLoading(false)
      return
    }

    if (nickname.length > 50) {
      setMessage('エラー: ニックネームは50文字以内で入力してください')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      data: { nickname: nickname.trim() }
    })

    if (error) {
      setMessage(`エラー: ${error.message}`)
      setLoading(false)
    } else {
      setMessage('ニックネームを更新しました')
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
            プロフィール編集
          </p>
        </div>

        <div className="space-y-6">
          {/* メールアドレス表示（編集不可） */}
          <div>
            <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
              メールアドレス
            </label>
            <div className="w-full p-4 rounded-xl bg-black/20 text-indigo-100/50 border border-indigo-500/20">
              {email}
            </div>
            <p className="text-xs text-indigo-400/40 mt-2 ml-1">メールアドレスは変更できません</p>
          </div>

          {/* ニックネーム編集フォーム */}
          <form onSubmit={handleUpdateNickname} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-indigo-300/60 uppercase block mb-2 ml-1 tracking-widest">
                ニックネーム
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-xl bg-black/40 text-indigo-100 border border-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ニックネームを入力"
                maxLength={50}
              />
              <p className="text-xs text-indigo-400/40 mt-2 ml-1">{nickname.length}/50文字</p>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600/80 text-white font-black h-14 rounded-xl shadow-lg hover:bg-indigo-500 transition active:scale-95 disabled:bg-gray-700 disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? '更新中...' : 'ニックネームを更新'}
            </button>
          </form>

          {/* パスワード変更リンク */}
          <div className="pt-4 border-t border-indigo-500/20">
            <Link
              href="/reset-password"
              className="block text-center text-xs font-bold text-indigo-400/60 hover:text-indigo-300 transition py-3"
            >
              パスワードを変更する
            </Link>
          </div>

          {/* ログアウトボタン */}
          <button
            onClick={handleSignOut}
            className="w-full bg-transparent text-red-400/60 font-bold h-12 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition active:scale-95 text-xs uppercase tracking-wider"
          >
            ログアウト
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-bold text-indigo-500/40 hover:text-indigo-400 transition uppercase tracking-widest">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
