'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Match {
  userId: string
  score: number
  commonTags: string[]
  sampleQuestion: string
  nickname: string
  email?: string
}

export default function ConnectPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState<string | null>(null)

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const loadMatches = async () => {
      if (!supabase) {
        router.push('/login')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // マッチング候補を取得
      try {
        const response = await fetch(`/api/matching?userId=${session.user.id}`)
        const data = await response.json()

        if (data.error) {
          setMessage(`エラー: ${data.error}`)
        } else {
          setMatches(data.matches || [])
        }
      } catch (error) {
        console.error('マッチング取得エラー:', error)
        setMessage('マッチング候補の取得に失敗しました')
      }

      setLoading(false)
    }

    loadMatches()
  }, [router, supabase])

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <p className="text-red-400">認証機能が無効です</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-indigo-400">マッチング候補を探しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Link href="/">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 mb-4 tracking-tighter cursor-pointer uppercase">
              タロット占い
            </h1>
          </Link>
          <p className="text-indigo-400/80 text-sm md:text-base font-bold uppercase tracking-wider mb-2">
            似た悩みを持つ仲間を見つける
          </p>
          <p className="text-indigo-300/60 text-xs max-w-2xl mx-auto">
            あなたの相談内容と似た悩みを持つユーザーとつながることができます
          </p>
        </div>

        {/* エラーメッセージ */}
        {message && (
          <div className="mb-8 p-4 rounded-xl bg-red-950/30 text-red-400 border border-red-900/50 text-center text-sm">
            {message}
          </div>
        )}

        {/* マッチング結果がない場合 */}
        {matches.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-xl font-bold text-indigo-300 mb-2">まだマッチング候補がありません</h2>
            <p className="text-indigo-400/60 text-sm mb-8">
              タロット占いで相談をすると、似た悩みを持つユーザーとマッチングできます
            </p>
            <Link
              href="/"
              className="inline-block bg-indigo-600/80 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition uppercase tracking-wider"
            >
              タロット占いをする
            </Link>
          </div>
        )}

        {/* マッチング候補リスト */}
        {matches.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-400/40 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
              >
                {/* マッチ度 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-100">{match.nickname}</h3>
                      <p className="text-xs text-indigo-400/60">マッチ度</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-300">
                      {Math.round(match.score * 100)}%
                    </div>
                  </div>
                </div>

                {/* 共通タグ */}
                {match.commonTags && match.commonTags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-indigo-400/60 mb-2 uppercase tracking-wider">共通の悩み</p>
                    <div className="flex flex-wrap gap-2">
                      {match.commonTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* サンプル相談 */}
                {match.sampleQuestion && (
                  <div className="mb-4">
                    <p className="text-xs text-indigo-400/60 mb-2 uppercase tracking-wider">相談例</p>
                    <p className="text-sm text-indigo-200/80 line-clamp-2 italic">
                      「{match.sampleQuestion}」
                    </p>
                  </div>
                )}

                {/* アクションボタン */}
                <button
                  onClick={() => {
                    setMessage('メッセージ機能は開発中です')
                  }}
                  className="w-full bg-indigo-600/60 hover:bg-indigo-500/80 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition active:scale-95"
                >
                  つながりを申請
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* 戻るリンク */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-indigo-500/40 hover:text-indigo-400 transition uppercase tracking-widest"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
