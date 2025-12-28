"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'sb-auth-token' }
}) : null;

const KACHIPEA_LOGIN_URL = "https://kachi.tarotai.jp/login"; 

const TarotCard = ({ card, index, isFlipped, onFlip }: any) => {
  if (!card) return <div className="w-24 h-40 md:w-32 md:h-52 bg-indigo-900/20 rounded-lg animate-pulse border border-indigo-500/30" />;
  const positionClasses = ["col-start-2 row-start-2", "col-start-2 row-start-2 z-10 rotate-90 scale-90 translate-y-2", "col-start-2 row-start-1", "col-start-2 row-start-3", "col-start-1 row-start-2", "col-start-3 row-start-2", "col-start-4 row-start-4", "col-start-4 row-start-3", "col-start-4 row-start-2", "col-start-4 row-start-1"];
  return (
    <div className={`${positionClasses[index]} relative w-24 h-40 md:w-32 md:h-52 perspective-1000`}>
      <motion.div className="w-full h-full cursor-pointer relative preserve-3d" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} onClick={() => onFlip?.(index)}>
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0a0a20] border-2 border-indigo-400 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3)]">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
           <img src="/images/card-back.png" alt="Back" className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] z-10" />
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
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const fetchHistory = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('tarot_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const fetchNickname = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('value_profiles').select('nickname').eq('user_id', userId).single();
    if (data) setNickname(data.nickname);
  };

  useEffect(() => {
    setMounted(true);
    if (!supabase) return;
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const acc = params.get('access_token');
      const ref = params.get('refresh_token');
      if (acc && ref) {
        const { data } = await supabase.auth.setSession({ access_token: acc, refresh_token: ref });
        if (data.user) {
          setUser(data.user); fetchHistory(data.user.id); fetchNickname(data.user.id);
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUser(session.user); fetchHistory(session.user.id); fetchNickname(session.user.id); }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user); fetchHistory(session.user.id); fetchNickname(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setNickname(null); setHistory([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const startFortune = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune');
      const data = await res.json();
      setDeck(data); setFlippedIndices([]); setAiAdvice("");
    } catch (err) { alert("接続に失敗しました。"); } finally { setLoading(false); }
  };

  const askAI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ cards: deck, userMessage: userQuestion }) });
      const data = await response.json();
      setAiAdvice(data.advice);
      if (user && supabase) {
        await supabase.from('tarot_history').insert([{ user_id: user.id, question: userQuestion, advice: data.advice, cards: deck }]);
        fetchHistory(user.id);
      }
    } finally { setLoading(false); }
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0a20]" />;

  return (
    <div className="min-h-screen p-4 text-white flex flex-col items-center font-sans tracking-tight bg-[#0a0a20]">
      <div className="w-full max-w-5xl flex justify-end items-center gap-4 py-4">
        {!user ? (
          <button onClick={() => window.location.href=`${KACHIPEA_LOGIN_URL}?redirect_to=${encodeURIComponent(window.location.origin)}`} className="px-5 py-2 rounded-full bg-indigo-600/40 border border-indigo-400/30 text-xs font-bold hover:bg-indigo-500/60 transition-all">ログイン</button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-xs text-indigo-200 opacity-70">ようこそ {nickname || user.email?.split('@')[0]} さん</span>
            <button onClick={() => supabase?.auth.signOut().then(() => window.location.reload())} className="text-[10px] text-indigo-400/50 hover:text-indigo-300 uppercase font-bold">Logout</button>
          </div>
        )}
      </div>

      <h1 className="text-4xl md:text-6xl font-black my-12 text-center uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-indigo-100 to-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">タロット占い</h1>
      
      <div className="glass flex flex-col gap-4 mb-16 w-full max-w-md p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
        <input type="text" placeholder="相談したい悩みをここへ..." className="bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 outline-none focus:border-indigo-400 transition-all font-medium" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} />
        <button onClick={startFortune} disabled={loading} className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-black tracking-widest transition-all active:scale-95 disabled:opacity-50">{loading ? "精神集中..." : "運命のカードを引く"}</button>
      </div>

      <div className="relative">
        <AnimatePresence>
          {deck.length === 10 && flippedIndices.length < 10 && (
            <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-16 left-0 right-0 text-center text-indigo-300 font-bold text-sm animate-pulse tracking-widest">
              カードを１枚ずつクリックして、めくってください
            </motion.p>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 mx-auto relative z-10">
          {deck.map((card, i) => (
            <TarotCard key={i} card={card} index={i} isFlipped={flippedIndices.includes(i)} onFlip={(idx:any) => !flippedIndices.includes(idx) && setFlippedIndices([...flippedIndices, idx])} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {flippedIndices.length === 10 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden mb-10">
            <h2 className="text-2xl mb-8 text-indigo-200 font-black text-center uppercase tracking-[0.2em]">リーディング</h2>
            {!aiAdvice ? (
              <div className="text-center py-10">
                <button onClick={askAI} disabled={loading} className="bg-gradient-to-r from-indigo-800 to-purple-900 px-10 py-4 rounded-xl font-black tracking-widest">{loading ? "星々を読み解いています..." : "AIに詳しく相談する"}</button>
              </div>
            ) : (
              <div className="bg-black/30 p-8 rounded-xl border border-white/5 shadow-inner">
                <p className="whitespace-pre-wrap text-left text-indigo-50 font-medium leading-relaxed md:text-lg">{aiAdvice}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 履歴セクション (カードサイズを1/2に縮小) */}
      {user && history.length > 0 && (
        <div className="mt-24 w-full max-w-5xl px-4 pb-32">
          <h3 className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.3em] mb-8 text-center">過去の神託</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {history.map((item) => (
              <motion.div 
                key={item.id} 
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedHistory(item)}
                className="cursor-pointer p-3 rounded-xl bg-indigo-900/20 border border-indigo-500/10 hover:border-indigo-500/40 transition-all w-28 h-36 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  <p className="text-[8px] text-indigo-400/60 font-bold mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  <h4 className="text-[9px] font-bold text-indigo-100 line-clamp-2 leading-tight uppercase group-hover:text-indigo-400 transition-colors">{item.question || "無題"}</h4>
                </div>
                <div className="text-[7px] text-indigo-300/40 text-right font-black italic">DETAIL</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* モーダル */}
      <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedHistory(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0f0f2d] border border-indigo-500/30 w-full max-w-2xl rounded-3xl p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6 border-b border-indigo-500/10 pb-4">
                <h2 className="text-lg font-black text-indigo-100 uppercase tracking-tighter">Q: {selectedHistory.question || "無題"}</h2>
                <button onClick={() => setSelectedHistory(null)} className="text-xl text-indigo-400 hover:text-white transition-colors">✕</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-indigo-50 leading-relaxed text-sm whitespace-pre-wrap mb-8 bg-indigo-500/5 p-4 rounded-xl">{selectedHistory.advice}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedHistory.cards?.map((c: any, i: number) => (
                    <img key={i} src={c.image_url?.replace('/public', '')} className={`w-12 h-20 object-cover rounded border border-white/10 shadow-md ${c.isReversed ? 'rotate-180' : ''}`} alt="Card" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}