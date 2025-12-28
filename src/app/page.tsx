"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token', 
  }
}) : null;

const KACHIPEA_LOGIN_URL = "https://kachi.tarotai.jp/login"; 

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
          <img src={card.image_url?.replace('/public', '')} alt={card.name} className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} />
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
  const [nickname, setNickname] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // 履歴取得
  const fetchHistory = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('tarot_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data) setHistory(data);
  };

  // ニックネーム取得
  const fetchNickname = async (userId: string) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('value_profiles')
      .select('nickname')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setNickname(data.nickname);
    } else {
      setNickname(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;

    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.user) {
          setUser(data.user);
          fetchHistory(data.user.id);
          fetchNickname(data.user.id);
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
        fetchNickname(session.user.id);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
        fetchNickname(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNickname(null);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    const currentUrl = window.location.origin;
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
      if (user && supabase) {
        await supabase.from('tarot_history').insert([{ user_id: user.id, question: userQuestion, advice: data.advice, cards: deck }]);
        fetchHistory(user.id);
      }
    } catch (error) {
      setAiAdvice("星々の声が聞き取れませんでした。");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0a20]" />;

  return (
    <div className="min-h-screen p-4 text-white flex flex-col items-center font-sans tracking-tight bg-[#0a0a20]">
      {/* ログイン・ユーザー情報 */}
      <div className="w-full max-w-5xl flex justify-end items-center gap-4 py-4">
        {!user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs text-indigo-300/60 font-medium tracking-wider bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
              ログインすると占い結果を保存できます
            </span>
            <button onClick={handleLogin} className="px-5 py-2 rounded-full bg-indigo-600/40 border border-indigo-400/30 text-xs hover:bg-indigo-500/60 transition-all font-bold shadow-lg shadow-indigo-500/10">ログイン</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-xs text-indigo-200 opacity-70 font-medium">
              ようこそ {nickname || user.email?.split('@')[0]} さん
            </span>
            <button onClick={async () => {
              if (supabase) {
                await supabase.auth.signOut();
                window.location.reload();
              }
            }} className="text-[10px] text-indigo-400/50 hover:text-indigo-300 uppercase font-bold tracking-tighter">Logout</button>
          </div>
        )}
      </div>

      <h1 className="text-4xl md:text-6xl font-black my-12 text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 glow-text tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] text-center">タロット占い</h1>
      
      {/* 入力フォーム */}
      <div className="glass flex flex-col gap-4 mb-16 w-full max-w-md p-6 rounded-2xl glow-blue">
        <input type="text" placeholder="相談したい悩みをここへ..." className="bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-400/50 focus:outline-none focus:border-indigo-400 transition-all font-medium" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} />
        <button onClick={startFortune} disabled={loading} className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-black tracking-widest transition-all active:scale-95 disabled:bg-gray-800 disabled:opacity-50">{loading ? "精神を集中しています..." : "運命のカードを引く"}</button>
      </div>

      {/* カードスプレッド */}
      <div className="relative">
        <AnimatePresence>
          {deck.length === 10 && flippedIndices.length < 10 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-16 left-0 right-0 text-center z-20">
              <p className="text-indigo-300 font-bold tracking-widest text-sm animate-pulse">カードを１枚ずつゆっくり裏返してください</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 w-fit mx-auto relative z-10">
          {deck.length === 10 && deck.map((card, i) => (
            <TarotCard key={card.id + i} card={card} index={i} isFlipped={flippedIndices.includes(i)} onFlip={(idx: number) => { if (deck.length > 0 && !flippedIndices.includes(idx)) setFlippedIndices([...flippedIndices, idx]); }} />
          ))}
        </div>
      </div>

      {/* 占い結果表示 */}
      <AnimatePresence>
        {flippedIndices.length === 10 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <h2 className="text-2xl mb-8 text-indigo-200 font-black text-center uppercase tracking-[0.2em]">リーディング</h2>
            {!aiAdvice ? (
              <div className="text-center py-10">
                <button onClick={askAI} disabled={loading} className="bg-gradient-to-r from-indigo-800 to-purple-900 px-10 py-4 rounded-xl font-black border border-indigo-400/30 hover:border-indigo-300 transition-all tracking-widest">{loading ? "星々を読み解いています..." : "AIに詳しく相談する"}</button>
              </div>
            ) : (
              <div className="bg-black/30 p-8 rounded-xl border border-white/5 shadow-inner relative">
                <p className="whitespace-pre-wrap text-left text-indigo-50 font-medium leading-relaxed md:text-lg">{aiAdvice}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 過去の神託 (履歴表示) */}
      {user && history.length > 0 && (
        <div className="mt-32 w-full max-w-4xl px-4 pb-20">
          <h3 className="text-xs font-black text-indigo-400/60 uppercase tracking-[0.3em] mb-8 text-center">過去の神託</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
              <div key={item.id} className="p-6 rounded-2xl bg-indigo-900/10 border border-indigo-500/10 hover:border-indigo-500/30 transition-all group">
                <p className="text-[10px] text-indigo-400/50 font-bold mb-2">{new Date(item.created_at).toLocaleDateString()}</p>
                <h4 className="text-sm font-bold text-indigo-100 mb-3 line-clamp-1 group-hover:text-white transition-colors">Q: {item.question || "無題の相談"}</h4>
                <p className="text-xs text-indigo-200/60 line-clamp-3 leading-relaxed">{item.advice}</p>
                <div className="mt-4 flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity overflow-hidden">
                  {item.cards?.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="w-6 h-10 bg-indigo-500/20 rounded-sm border border-indigo-500/30 flex-shrink-0" />
                  ))}
                  {item.cards?.length > 5 && <span className="text-[8px] text-indigo-500/50 flex items-end ml-1">...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}