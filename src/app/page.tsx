import Link from 'next/link';

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a20] via-[#1a1a3e] to-[#0a0a20] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* タイトル */}
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-6 tracking-tight animate-gradient">
          AI TAROT
        </h1>

        <p className="text-xl md:text-2xl text-indigo-300/80 mb-12 font-light">
          Select Your Language / 言語を選択 / 选择语言
        </p>

        {/* 言語選択ボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/ja"
            className="group relative w-full sm:w-48 px-8 py-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 font-black text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative">
              🇯🇵 日本語
            </div>
          </Link>

          <Link
            href="/en"
            className="group relative w-full sm:w-48 px-8 py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 font-black text-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative">
              🇬🇧 English
            </div>
          </Link>

          <Link
            href="/zh"
            className="group relative w-full sm:w-48 px-8 py-6 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 font-black text-xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative">
              🇨🇳 中文
            </div>
          </Link>
        </div>

        {/* フッター */}
        <p className="mt-12 text-sm text-indigo-300/40">
          AI-powered tarot card reading for your life guidance
        </p>
      </div>
    </div>
  );
}
