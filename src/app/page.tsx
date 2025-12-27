"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Supabase初期化（環境変数ガード）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// カチピのURL（実際のログインURLに書き換えてください）
const KACHIPEA_LOGIN_URL = "https://kachipea.com/login"; 

const TarotCard = ({ card, index, isFlipped, onFlip }: any) => {
  if (!card) return <div className="w-24 h-40 md:w-32 md:h-52 bg-indigo-900/20 rounded-lg animate-pulse border border-indigo-500/30" />;
  const positionClasses = ["col-start-2 row-start-2", "col-start-2 row-start-2 z-10 rotate-90 scale-90 translate-y-2", "col-start-2 row-start-1", "col-start-2 row-start-3", "col-start-1 row-start-2", "col-start-3 row-start-2", "col-start-4 row-start-4", "col-start-4 row-start-3", "col-start-4 row-start-2", "col-start-4 row-start-1"];
  return (
    <div className={`${positionClasses[index]} relative w-24 h-40 md:w-32 md:h-52 perspective-1000`}>
      <motion.div className="w-full h-full cursor-pointer relative preserve-3d" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} onClick={() => onFlip(index)}>
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0a0a20] border-2 border-indigo-400 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3)]">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
           <img src="/images/card-back.png" alt="Card Back" className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] z-10" />
        </div>
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg overflow-hidden rotate-y-180 shadow-2xl">
          <img src={card.image_url.replace('/public', '')} alt={card.name} className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} />
        </div>
      </motion.div>
    </div>
  );
};

export default function CelticCrossPage() {
  const [deck, setDeck] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    // セッションの監視：戻ってきた時に自動的にログイン状態になる
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // ログインボタンの処理（方法1：戻り先URLをパラメータで渡す）
  const handleLogin = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    // redirect_to という名前で現在のURL（タロット）をカチピに伝える
    window.location.href = `${KACHIPEA_LOGIN_URL}?redirect_to=${encodeURIComponent(currentUrl)}`;
  };

  const startFortune = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune');
      const data = await res.json();
      setDeck(data);
      setFlippedIndices([]);
      setAiAdvice("");
    } catch (err) {
      alert("運命の接続に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: deck, userMessage: userQuestion }),
      });
      const data = await response.json();
      setAiAdvice(data.advice);
      
      // ログイン中なら保存
      if (user && supabase) {
        await supabase.from('tarot_history').insert([{ 
          user_id: user.id, 
          question: userQuestion, 
          advice: data.advice, 
          cards: deck 
        }]);
      }
    } catch (error) {
      setAiAdvice("星々の声が聞き取れませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 text-white flex flex-col items-center">
      
      {/* ログイン・ナビゲーションエリア */}
      <div className="w-full max-w-5xl flex justify-end items-center gap-4 py-4">
        {!user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs text-indigo-300/60 font-shippori tracking-widest bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
              ログインすると、占い結果を記録し履歴が見れます
            </span>
            <button 
              onClick={handleLogin}
              className="px-5 py-2 rounded-full bg-indigo-600/40 border border-indigo-400/30 text-xs hover:bg-indigo-500/60 transition-all tracking-widest font-shippori shadow-lg shadow-indigo-500/10"
            >
              ログイン
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-xs text-indigo-200 opacity-70 font-shippori">
              ようこそ {user.email?.split('@')[0]} さん
            </span>
            <button 
              onClick={() => supabase?.auth.signOut()} 
              className="text-[10px] text-indigo-400/50 hover:text-indigo-300 uppercase tracking-tighter"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <h1 className="text-5xl md:text-5xl font-shippori my-12 text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 glow-text tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        タロット占い
      </h1>
      
      <div className="glass flex flex-col gap-4 mb-16 w-full max-w-md p-6 rounded-2xl glow-blue">
        <input 
          type="text"
          placeholder="相談したい悩みをここへ..."
          className="bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-400/30 focus:outline-none focus:border-indigo-400 transition-all font-shippori"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
        />
        <button 
          onClick={startFortune}
          disabled={loading}
          className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-bold tracking-[0.2em] transition-all active:scale-95 disabled:bg-gray-800 disabled:opacity-50 font-shippori"
        >
          {loading ? "精神を集中しています..." : "運命のカードを引く"}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150 opacity-20">
            <div className="w-[400px] h-[400px] border border-blue-500 rounded-full animate-magic"></div>
        </div>
        <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 w-fit mx-auto relative z-10">
          {deck.length === 10 && deck.map((card, i) => (
            <TarotCard key={card.id + i} card={card} index={i} isFlipped={flippedIndices.includes(i)} onFlip={(idx: number) => { if (deck.length > 0 && !flippedIndices.includes(idx)) setFlippedIndices([...flippedIndices, idx]); }} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {flippedIndices.length === 10 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden mb-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <h2 className="text-2xl mb-8 text-indigo-200 font-shippori text-center uppercase tracking-widest">聖なる託宣</h2>
            {!aiAdvice ? (
              <div className="text-center">
                <p className="text-indigo-300/70 mb-8 font-shippori italic">すべてのカードが並びました。あなたの物語をAIが読み解きます。</p>
                <button onClick={askAI} disabled={loading} className="bg-gradient-to-r from-indigo-800 to-purple-900 px-10 py-4 rounded-xl font-bold border border-indigo-400/30 hover:border-indigo-300 transition-all font-shippori tracking-widest">
                  {loading ? "星々を読み解いています..." : "AIに詳しく相談する"}
                </button>
              </div>
            ) : (
              <div className="bg-black/30 p-8 rounded-xl border border-white/5 shadow-inner relative">
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-indigo-500/30"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-indigo-500/30"></div>
                <p className="whitespace-pre-wrap text-left text-indigo-50 font-shippori leading-[2.2] tracking-[0.1em] md:text-lg">{aiAdvice}</p>
                <div className="mt-12 flex flex-col items-center gap-4">
                  {user ? (
                    <p className="text-[10px] text-indigo-400/40 tracking-widest uppercase italic">鑑定結果は履歴に保存されました</p>
                  ) : (
                    <p className="text-[10px] text-amber-400/60 tracking-widest uppercase italic bg-amber-900/10 px-3 py-1 rounded">※ 未ログインのため履歴は保存されません</p>
                  )}
                  <button onClick={startFortune} className="group relative px-6 py-2 text-xs text-indigo-400 hover:text-indigo-200 transition-colors uppercase tracking-[0.3em]">
                    <span className="relative z-10 font-shippori">新しい運命を占う</span>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}