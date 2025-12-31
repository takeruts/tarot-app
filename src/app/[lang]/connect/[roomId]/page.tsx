'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/src/lib/supabase'
import Link from 'next/link'
import type { Locale } from '@/src/i18n/config'
import { getDictionary } from '@/src/i18n/utils'
import type { ChatRoom, ChatMessage, AppUser } from '@/src/types'
import { motion } from 'framer-motion'

export default function ChatRoomPage({ params }: { params: Promise<{ lang: Locale; roomId: string }> }) {
  const { lang, roomId } = use(params)
  const [dict, setDict] = useState<any>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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
        fetchRoomData(session.user.id)
      }
    }

    checkAuth()
  }, [router, supabase, lang, roomId])

  const fetchRoomData = async (userId: string) => {
    if (!supabase) return

    setLoading(true)
    try {
      // ルーム情報を取得
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError
      setRoom(roomData)

      // メンバーシップを確認
      const { data: memberData } = await supabase
        .from('chat_room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single()

      setIsMember(!!memberData)

      // メンバーの場合、メッセージを取得
      if (memberData) {
        fetchMessages()
      }
    } catch (error) {
      console.error('Error fetching room:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error details:', error)
        throw error
      }

      if (!data || data.length === 0) {
        setMessages([])
        return
      }

      // メッセージにニックネームを追加（自分のメッセージのみニックネーム表示）
      const messagesWithNickname = data.map((msg: any) => ({
        ...msg,
        user_nickname: msg.user_id === user?.id
          ? (user?.user_metadata?.nickname || user?.user_metadata?.ai_name || user?.user_metadata?.name || 'You')
          : `User ${msg.user_id.slice(0, 8)}`
      }))

      setMessages(messagesWithNickname)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // リアルタイムメッセージの購読
  useEffect(() => {
    if (!supabase || !isMember || !roomId) return

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = {
            ...payload.new,
            user_nickname: payload.new.user_id === user?.id
              ? (user?.user_metadata?.nickname || user?.user_metadata?.ai_name || user?.user_metadata?.name || 'You')
              : `User ${payload.new.user_id.slice(0, 8)}`
          } as ChatMessage

          setMessages((prev) => {
            // 重複チェック
            if (prev.some(msg => msg.id === newMsg.id)) {
              return prev
            }
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, isMember, roomId])

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const joinRoom = async () => {
    if (!supabase || !user) return

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert([{ room_id: roomId, user_id: user.id }])

      if (error) throw error

      setIsMember(true)
      fetchMessages()
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to join room')
    }
  }

  const leaveRoom = async () => {
    if (!supabase || !user) return

    if (!confirm(dict?.chat?.leaveConfirm || 'Are you sure you want to leave this room?')) return

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id)

      if (error) throw error

      router.push(`/${lang}/connect`)
    } catch (error) {
      console.error('Error leaving room:', error)
      alert('Failed to leave room')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !user || !newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            room_id: roomId,
            user_id: user.id,
            message: messageText,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // 送信後すぐにメッセージを追加（リアルタイム購読の遅延対策）
      if (data) {
        const newMsg: ChatMessage = {
          ...data,
          user_nickname: user?.user_metadata?.nickname || user?.user_metadata?.ai_name || user?.user_metadata?.name || 'You'
        }
        setMessages((prev) => {
          // 重複チェック
          if (prev.some(msg => msg.id === newMsg.id)) {
            return prev
          }
          return [...prev, newMsg]
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
      setNewMessage(messageText) // エラー時は入力を復元
    }
  }

  const formatTime = (timestamp: string) => {
    if (!dict) return ''

    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000)

    if (diffInSeconds < 60) return dict.chat.justNow
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${dict.chat.minutesAgo}`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${dict.chat.hoursAgo}`
    return `${Math.floor(diffInSeconds / 86400)}${dict.chat.daysAgo}`
  }

  if (!dict || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0a20] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-indigo-300/60 mb-4">Room not found</p>
          <Link href={`/${lang}/connect`} className="text-purple-400 hover:text-purple-300">
            {dict.auth.backToHome}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a20] text-white flex flex-col">
      {/* ヘッダー */}
      <div className="glass-strong border-b-2 border-white/10 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/connect`} className="text-purple-300 hover:text-purple-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                {room.name}
              </h1>
              <p className="text-xs text-indigo-300/60">{room.category}</p>
            </div>
          </div>

          {isMember && (
            <button
              onClick={leaveRoom}
              className="px-4 py-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 text-sm font-bold transition-all duration-300"
            >
              {dict.chat.leave}
            </button>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      {!isMember ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center glass-strong p-12 rounded-3xl border-2 border-white/10 max-w-md">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4">
              {room.name}
            </h2>
            <p className="text-indigo-300/60 mb-8">
              このルームに参加して、同じ悩みを持つ人と話しましょう
            </p>
            <button
              onClick={joinRoom}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              {dict.chat.join}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-indigo-300/60 mb-2">{dict.chat.noMessages}</p>
                  <p className="text-sm text-purple-300/50">{dict.chat.noMessagesDesc}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = user?.id === msg.user_id
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1 px-2">
                          <span className="text-xs font-bold text-purple-300/70">
                            {msg.user_nickname}
                          </span>
                          <span className="text-[10px] text-indigo-300/40">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white rounded-br-sm'
                              : 'glass-strong border border-white/10 text-indigo-50 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 入力エリア */}
          <div className="glass-strong border-t-2 border-white/10 p-4 sticky bottom-0">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={dict.chat.messagePlaceholder}
                className="flex-1 px-5 py-4 rounded-xl bg-black/30 text-indigo-50 border-2 border-white/20 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 outline-none transition-all duration-300 placeholder:text-indigo-300/40"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 font-black shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {dict.chat.send}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
