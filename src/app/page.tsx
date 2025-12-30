"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabaseClient } from '@/src/lib/supabase';
import Head from 'next/head';
import type { TarotCard as TarotCardType, TarotCardProps, TarotHistory, AppUser, JsonLdSchema } from '@/src/types';

const KACHIPEA_LOGIN_URL = "https://www.kachi.tarotai.jp/login";

const TarotCard = ({ card, index, isFlipped, onFlip }: TarotCardProps) => {
  if (!card) return <div className="w-24 h-40 md:w-32 md:h-52 bg-indigo-900/20 rounded-lg animate-pulse border border-indigo-500/30" />;
  const positionClasses = ["col-start-2 row-start-2", "col-start-2 row-start-2 z-10 rotate-90 scale-90 translate-y-2", "col-start-2 row-start-1", "col-start-2 row-start-3", "col-start-1 row-start-2", "col-start-3 row-start-2", "col-start-4 row-start-4", "col-start-4 row-start-3", "col-start-4 row-start-2", "col-start-4 row-start-1"];
  return (
    <div className={`${positionClasses[index]} relative w-24 h-40 md:w-32 md:h-52 perspective-1000`}>
      <motion.div className="w-full h-full cursor-pointer relative preserve-3d" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} onClick={() => onFlip ? onFlip(index) : null}>
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
  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [user, setUser] = useState<AppUser | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>("");
  const [history, setHistory] = useState<TarotHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<TarotHistory | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Supabase clientを取得（singleton）
  const supabase = getSupabaseClient();

  const jsonLd: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AIタロット占い - 内面を整理する神託",
    "description": "タロットを通して自分の内面を整理しましょう。AIがケルティッククロス・スプレッドで悩みや考えを深く読み解きます。",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "All"
  };

  const fetchHistory = async (userId: string): Promise<void> => {
    if (!supabase) return;
    const { data } = await supabase
      .from('tarot_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setHistory(data as TarotHistory[]);
  };

  const fetchNickname = async (userId: string): Promise<void> => {
    if (!supabase) return;
    const { data } = await supabase
      .from('value_profiles')
      .select('nickname')
      .eq('id', userId)
      .single();
    if (data) {
      setNickname(data.nickname);
      setNewNickname(data.nickname);
    }
  };

  const updateNickname = async (): Promise<void> => {
    if (!supabase || !user || !newNickname.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('value_profiles')
      .upsert({ id: user.id, nickname: newNickname.trim(), updated_at: new Date().toISOString() });

    if (error) {
      alert("ニックネームの更新に失敗しました。");
    } else {
      setNickname(newNickname.trim());
      setIsEditingNickname(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);

    // Supabaseが初期化されていない場合は認証機能をスキップ
    if (!supabase) {
      console.warn('Supabase未初期化: 認証機能は無効です');
      return;
    }

    const initAuth = async () => {
      // Cookieベースの認証に統一
      // カチピからのリダイレクト時は、Cookieに既にセッションが設定されている
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        fetchHistory(currentUser.id);
        fetchNickname(currentUser.id);
      } else {
        setUser(null);
        setNickname(null);
        setHistory([]);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
        fetchNickname(session.user.id);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setNickname(null);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (): void => {
    window.location.href = `${KACHIPEA_LOGIN_URL}?redirect_to=${encodeURIComponent(window.location.origin)}`;
  };

  const startFortune = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune');
      const data: TarotCardType[] = await res.json();
      setDeck(data);
      setFlippedIndices([]);
      setAiAdvice("");
    } catch (err) {
      console.error('カード取得エラー:', err);
      alert("運命の接続に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const askAI = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: deck, userMessage: userQuestion }),
      });
      const data: { advice: string } = await response.json();
      setAiAdvice(data.advice);
      if (user && supabase) {
        const { error } = await supabase.from('tarot_history').insert([{
          user_id: user.id,
          question: userQuestion,
          advice: data.advice,
          cards: deck
        }]);
        if (error) {
          console.error('履歴保存エラー:', error);
        }
        fetchHistory(user.id);
      }
    } catch (error) {
      console.error('AI鑑定エラー:', error);
      setAiAdvice("星々の声が聞き取れませんでした。");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0a20]" />;

  return (
    <>
      <Head>
        <title>AIタロット占い | 自分の内面を整理する対話の場</title>
        <meta name="description" content="タロットは内面を整理する有効な手段です。AIがケルティッククロスであなたの悩みを見直し、新しい視点を提供します。" />
        <meta name="keywords" content="タロット占い, AI占い, 内面整理, 自己対話, 悩み相談, ケルティッククロス" />
        <link rel="canonical" href="https://www.tarotai.jp" />
        <meta property="og:title" content="AIタロット占い | 内面を整理する神託" />
        <meta property="og:description" content="自分の悩みや考えをカードを通して見直し、新しい視点で自分を整理しましょう。" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Head>

      <div className="min-h-screen p-4 text-white flex flex-col items-center font-sans tracking-tight bg-[#0a0a20]">
        {/* ヘッダー */}
        <div className="w-full max-w-5xl flex justify-end items-center gap-4 py-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-xs text-indigo-300/60 font-medium tracking-wider bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">結果を保存できます</span>
              <button onClick={handleLogin} className="px-5 py-2 rounded-full bg-indigo-600/40 border border-indigo-400/30 text-xs hover:bg-indigo-500/60 transition-all font-bold">ログイン</button>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-indigo-950/30 px-4 py-2 rounded-2xl border border-indigo-500/10">
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    className="bg-black/50 border border-indigo-500/50 rounded px-2 py-1 text-xs outline-none w-32"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    autoFocus
                  />
                  <button onClick={updateNickname} disabled={loading} className="text-[10px] text-emerald-400 font-bold uppercase">Save</button>
                  <button onClick={() => setIsEditingNickname(false)} className="text-[10px] text-gray-500 font-bold uppercase">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span 
                    className="text-xs text-indigo-200 opacity-70 cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-2"
                    onClick={() => setIsEditingNickname(true)}
                  >
                    ようこそ {nickname || user.email?.split('@')[0]} さん
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </span>
                  <div className="w-[1px] h-3 bg-indigo-500/20" />
                  <button onClick={() => supabase?.auth.signOut().then(() => window.location.reload())} className="text-[10px] text-indigo-400/50 hover:text-indigo-300 uppercase font-bold">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 text-center uppercase">タロット占い</h1>
        
        {/* 追加した説明文 */}
        <div className="max-w-2xl w-full text-center mb-12 space-y-4 px-6">
          <p className="text-sm md:text-base text-indigo-200/80 leading-relaxed font-medium">
            タロットは、各々のカードが象徴する観点を通し、自分の悩みや考えを見直し、<br className="hidden md:block" />
            今までとは違う視点で自分の内面を整理することができます。
          </p>
          <p className="text-sm md:text-base text-indigo-300 font-bold tracking-wide">
            こちらに悩みを記入して、内面を整理しましょう。
          </p>
        </div>

        {/* フォーム */}
        <div className="glass flex flex-col gap-4 mb-16 w-full max-w-md p-6 rounded-2xl glow-blue">
          <input type="text" placeholder="相談したい悩みをここへ..." className="bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 focus:outline-none focus:border-indigo-400 transition-all" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} />
          <button onClick={startFortune} disabled={loading} className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-black tracking-widest transition-all active:scale-95 disabled:opacity-50">{loading ? "精神集中..." : "運命のカードを引く"}</button>
        </div>

        {/* スプレッド */}
        <div className="relative">
          <AnimatePresence>
            {deck.length === 10 && flippedIndices.length < 10 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-16 left-0 right-0 text-center z-20">
                <p className="text-indigo-300 font-bold tracking-widest text-sm animate-pulse">カードを１枚ずつクリックして、めくってください</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 w-fit mx-auto relative z-10">
            {deck.length === 10 && deck.map((card, i) => (
              <TarotCard key={card.id + i} card={card} index={i} isFlipped={flippedIndices.includes(i)} onFlip={(idx: number) => { if (!flippedIndices.includes(idx)) setFlippedIndices([...flippedIndices, idx]); }} />
            ))}
          </div>
        </div>

        {/* 結果表示 */}
        <AnimatePresence>
          {flippedIndices.length === 10 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden mb-10">
              <h2 className="text-2xl mb-8 text-indigo-200 font-black text-center uppercase tracking-widest">リーディング</h2>
              {!aiAdvice ? (
                <div className="text-center py-10">
                  <button onClick={askAI} disabled={loading} className="bg-gradient-to-r from-indigo-800 to-purple-900 px-10 py-4 rounded-xl font-black tracking-widest">{loading ? "星々を読み解いています..." : "AIに詳しく相談する"}</button>
                </div>
              ) : (
                <div className="bg-black/30 p-8 rounded-xl border border-white/5 relative">
                  <p className="whitespace-pre-wrap text-left text-indigo-50 font-medium leading-relaxed md:text-lg">{aiAdvice}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 過去の履歴 */}
        {user && history.length > 0 && (
          <div className="mt-20 w-full max-w-5xl px-4 pb-32">
            <h3 className="text-xs font-black text-indigo-400/60 uppercase tracking-[0.3em] mb-8 text-center">過去の神託</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} onClick={() => setSelectedHistory(item)} className="cursor-pointer p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/10 hover:border-indigo-500/40 transition-all flex flex-col aspect-[3/4] justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <p className="text-[9px] text-indigo-400/60 font-bold mb-1">{new Date(item.created_at).toLocaleDateString()}</p>
                    <h4 className="text-[11px] font-bold text-indigo-100 line-clamp-2 leading-tight uppercase">{item.question || "無題"}</h4>
                  </div>
                  <div className="text-[9px] text-indigo-300/40 self-end font-black italic">READ MORE</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        <AnimatePresence>
          {selectedHistory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedHistory(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0f0f2d] border border-indigo-500/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(79,70,229,0.2)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-indigo-400 font-bold mb-2 uppercase tracking-widest">{new Date(selectedHistory.created_at).toLocaleString()}</p>
                    <h2 className="text-xl md:text-2xl font-black text-indigo-100">Q: {selectedHistory.question || "無題の相談"}</h2>
                  </div>
                  <button onClick={() => setSelectedHistory(null)} className="text-indigo-400 hover:text-white p-2 text-2xl">✕</button>
                </div>
                <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                  <div className="flex flex-wrap gap-2 justify-center content-start">
                    {selectedHistory.cards?.map((card: any, i: number) => (
                      <div key={i} className="w-16 h-28 md:w-20 md:h-32 relative rounded-md overflow-hidden border border-indigo-500/20 shadow-lg">
                        <img src={card.image_url?.replace('/public', '')} className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} alt={card.name} />
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                    <h3 className="text-xs font-black text-indigo-400 mb-4 uppercase tracking-widest underline decoration-indigo-500/30 underline-offset-8">神託の結果</h3>
                    <p className="text-indigo-50 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{selectedHistory.advice}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}