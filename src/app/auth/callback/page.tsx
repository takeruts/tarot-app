'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // メール確認後、ホームページにリダイレクト
    router.push('/')
  }, [router])

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
