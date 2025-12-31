'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'
import type { Locale } from '@/src/i18n/config'
import { getDictionary } from '@/src/i18n/utils'
import type { ChatRoom, AppUser } from '@/src/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConnectPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params)
  const [dict, setDict] = useState<any>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push(`/${lang}/login`)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/${lang}/login`)
      } else {
        setUser(session.user)
        fetchRooms()
      }
    }

    checkAuth()
  }, [router, supabase, lang])

  const fetchRooms = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      // チャットルームを取得
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      // 各ルームのメンバー数を取得
      const roomsWithMemberCount = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { count } = await supabase
            .from('chat_room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)

          return { ...room, member_count: count || 0 }
        })
      )

      setRooms(roomsWithMemberCount)
      setFilteredRooms(roomsWithMemberCount)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングと検索
  useEffect(() => {
    let result = rooms

    // カテゴリーでフィルター
    if (filterCategory !== 'all') {
      result = result.filter(room => room.category === filterCategory)
    }

    // 検索クエリでフィルター
    if (searchQuery.trim()) {
      result = result.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredRooms(result)
  }, [rooms, filterCategory, searchQuery])

  const createRoom = async () => {
    if (!supabase || !user || !newRoomName.trim() || !selectedCategory) return

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert([
          {
            name: newRoomName.trim(),
            category: selectedCategory,
            created_by: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // 作成者を自動的にメンバーに追加
      await supabase.from('chat_room_members').insert([
        {
          room_id: data.id,
          user_id: user.id,
        },
      ])

      setShowCreateModal(false)
      setNewRoomName('')
      setSelectedCategory('')
      fetchRooms()
      router.push(`/${lang}/connect/${data.id}`)
    } catch (error) {
      console.error('Error creating room:', error)
      alert(dict?.chat?.error || 'Error creating room')
    }
  }

  if (!dict) return null

  const categories = [
    { value: dict.category.love, label: dict.category.love, color: 'from-pink-500 to-rose-500' },
    { value: dict.category.work, label: dict.category.work, color: 'from-blue-500 to-indigo-500' },
    { value: dict.category.relationships, label: dict.category.relationships, color: 'from-green-500 to-emerald-500' },
    { value: dict.category.health, label: dict.category.health, color: 'from-teal-500 to-cyan-500' },
    { value: dict.category.money, label: dict.category.money, color: 'from-yellow-500 to-amber-500' },
    { value: dict.category.future, label: dict.category.future, color: 'from-purple-500 to-violet-500' },
    { value: dict.category.other, label: dict.category.other, color: 'from-gray-500 to-slate-500' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <Link href={`/${lang}`}>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-4 tracking-tight cursor-pointer uppercase animate-gradient glow-text-purple">
              {dict.title}
            </h1>
          </Link>
          <p className="text-purple-300/80 text-base md:text-lg font-bold uppercase tracking-wider mb-2">
            {dict.chat.title}
          </p>
          <p className="text-indigo-300/60 text-sm">
            {dict.connectPage.subtitle}
          </p>
        </div>

        {/* 検索とフィルター */}
        <div className="glass-strong p-6 rounded-3xl border-2 border-white/10 mb-8">
          {/* 検索バー */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.chat?.searchPlaceholder || "ルーム名で検索..."}
                className="w-full p-4 pl-12 rounded-xl bg-black/30 text-indigo-50 border-2 border-white/20 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 outline-none transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* カテゴリーフィルター */}
          <div>
            <label className="text-sm font-bold text-purple-300/80 block mb-3">
              {dict.chat?.filterByCategory || "カテゴリーで絞り込み"}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                  filterCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white scale-105 shadow-lg'
                    : 'bg-white/5 text-indigo-300/70 hover:bg-white/10 hover:scale-105 border border-white/10 hover:border-white/20'
                }`}
              >
                {dict.chat?.allCategories || "すべて"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterCategory === cat.value
                      ? `bg-gradient-to-r ${cat.color} text-white scale-105 shadow-lg`
                      : 'bg-white/5 text-indigo-300/70 hover:bg-white/10 hover:scale-105 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 検索結果数 */}
          {!loading && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-purple-300/60">
                {filteredRooms.length} {dict.chat?.roomsFound || "件のルームが見つかりました"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                + {dict.chat.createRoom}
              </button>
            </div>
          )}
        </div>

        {/* ルーム一覧 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-indigo-300/60">{dict.connectPage.loading}</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 glass-strong rounded-3xl p-12 border-2 border-white/10">
            <p className="text-2xl font-bold text-purple-300/80 mb-4">
              {rooms.length === 0 ? dict.chat.noRooms : (dict.chat?.noFilteredRooms || "条件に合うルームが見つかりませんでした")}
            </p>
            <p className="text-indigo-300/60 mb-8">
              {rooms.length === 0 ? dict.chat.noRoomsDesc : (dict.chat?.tryDifferentFilter || "別のカテゴリーや検索キーワードをお試しください")}
            </p>
            {rooms.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                + {dict.chat.createRoom}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const categoryData = categories.find(c => c.value === room.category)
              return (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => router.push(`/${lang}/connect/${room.id}`)}
                  className="cursor-pointer glass-strong p-6 rounded-2xl border-2 border-white/10 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    {categoryData && (
                      <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${categoryData.color} text-white text-xs font-bold mb-3`}>
                        {room.category}
                      </span>
                    )}

                    <h3 className="text-xl font-black text-indigo-50 mb-3 line-clamp-2">
                      {room.name}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-purple-300/70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                      </svg>
                      <span>{room.member_count} {dict.chat.members}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-pink-300/50">
                        {new Date(room.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* 作成モーダル */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-strong p-8 rounded-3xl border-2 border-white/20 max-w-md w-full shadow-2xl glow-purple"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6">
                  {dict.chat.createRoom}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-purple-300/80 block mb-2">
                      {dict.chat.roomName}
                    </label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder={dict.chat.roomNamePlaceholder}
                      className="w-full p-4 rounded-xl bg-black/30 text-indigo-50 border-2 border-white/20 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 outline-none transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-purple-300/80 block mb-3">
                      {dict.chat.selectCategory}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`p-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            selectedCategory === cat.value
                              ? `bg-gradient-to-r ${cat.color} text-white scale-105 shadow-lg`
                              : 'bg-white/5 text-indigo-300/70 hover:bg-white/10 hover:scale-105 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewRoomName('')
                      setSelectedCategory('')
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-purple-300 hover:bg-white/10 font-bold transition-all duration-300 border-2 border-white/10"
                  >
                    {dict.chat.cancel}
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={!newRoomName.trim() || !selectedCategory}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {dict.chat.create}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 戻るボタン */}
        <div className="text-center mt-12">
          <Link
            href={`/${lang}`}
            className="text-pink-300/60 hover:text-pink-200 transition-colors font-bold uppercase tracking-wider text-sm"
          >
            {dict.auth.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
