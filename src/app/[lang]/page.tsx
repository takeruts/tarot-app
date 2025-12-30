"use client";
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabaseClient } from '@/src/lib/supabase';
import Head from 'next/head';
import Link from 'next/link';
import type { TarotCard as TarotCardType, TarotCardProps, TarotHistory, AppUser, JsonLdSchema } from '@/src/types';
import { getDictionary } from '@/src/i18n/utils';
import type { Locale } from '@/src/i18n/config';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';

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
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-50 rounded-lg overflow-hidden rotate-y-180 shadow-2xl p-1.5">
          <div className="relative w-full h-full rounded-md overflow-hidden border-2 border-amber-600/70 shadow-[inset_0_0_15px_rgba(180,83,9,0.2)]">
            <div className="absolute inset-0 border border-amber-400/50 m-0.5 rounded-sm pointer-events-none"></div>
            <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-amber-700/40"></div>
            <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-amber-700/40"></div>
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-amber-700/40"></div>
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-amber-700/40"></div>
            <img src={card.image_url?.replace('/public', '')} alt={card.name} className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function CelticCrossPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const [deck, setDeck] = useState<TarotCardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [user, setUser] = useState<AppUser | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [newNickname, setNewNickname] = useState<string>("");
  const [history, setHistory] = useState<TarotHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<TarotHistory | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [dict, setDict] = useState<any>(null);

  // Supabase clientを取得（singleton）
  const supabase = getSupabaseClient();

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  const categories = dict ? [
    { value: dict.category.love, label: dict.category.love, color: 'from-pink-500 to-rose-500' },
    { value: dict.category.work, label: dict.category.work, color: 'from-blue-500 to-indigo-500' },
    { value: dict.category.relationships, label: dict.category.relationships, color: 'from-green-500 to-emerald-500' },
    { value: dict.category.health, label: dict.category.health, color: 'from-teal-500 to-cyan-500' },
    { value: dict.category.money, label: dict.category.money, color: 'from-yellow-500 to-amber-500' },
    { value: dict.category.future, label: dict.category.future, color: 'from-purple-500 to-violet-500' },
    { value: dict.category.other, label: dict.category.other, color: 'from-gray-500 to-slate-500' },
  ] : [];

  const jsonLd: JsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": dict?.title || "AI Tarot Reading",
    "alternateName": "TarotAI",
    "description": dict?.description || "AI Tarot Reading for Inner Clarity",
    "url": "https://www.tarotai.jp",
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": lang === 'zh' ? 'CNY' : lang === 'en' ? 'USD' : 'JPY'
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1247"
    },
    "author": {
      "@type": "Organization",
      "name": "TarotAI"
    }
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

  const updateNickname = async (): Promise<void> => {
    alert(dict?.profileUpdateMessage || "Please update your profile from the profile page.");
    setIsEditingNickname(false);
  };

  useEffect(() => {
    setMounted(true);

    if (!supabase) {
      console.warn('Supabase未初期化: 認証機能は無効です');
      return;
    }

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (currentUser) {
        setUser(currentUser);
        const metadataNickname = currentUser.user_metadata?.nickname ||
                                 currentUser.user_metadata?.ai_name ||
                                 currentUser.user_metadata?.name ||
                                 currentUser.email?.split('@')[0];

        if (metadataNickname) {
          setNickname(metadataNickname);
          setNewNickname(metadataNickname);
        }

        fetchHistory(currentUser.id);
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
        const metadataNickname = session.user.user_metadata?.nickname ||
                                 session.user.user_metadata?.ai_name ||
                                 session.user.user_metadata?.name ||
                                 session.user.email?.split('@')[0];

        if (metadataNickname) {
          setNickname(metadataNickname);
          setNewNickname(metadataNickname);
        }

        fetchHistory(session.user.id);
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
    window.location.href = `/${lang}/login`;
  };

  const startFortune = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fortune?lang=${lang}`);
      const data: TarotCardType[] = await res.json();
      setDeck(data);
      setFlippedIndices([]);
      setAiAdvice("");
    } catch (err) {
      console.error('カード取得エラー:', err);
      const errorMessages = {
        ja: "運命の接続に失敗しました。",
        en: "Failed to connect to destiny.",
        zh: "连接命运失败。"
      };
      alert(errorMessages[lang] || errorMessages.ja);
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
        body: JSON.stringify({
          cards: deck,
          userMessage: userQuestion,
          language: lang
        }),
      });
      const data: { advice: string } = await response.json();
      setAiAdvice(data.advice);
      if (user && supabase) {
        const { error } = await supabase.from('tarot_history').insert([{
          user_id: user.id,
          question: userQuestion,
          advice: data.advice,
          cards: deck,
          category: category
        }]);
        if (error) {
          console.error('履歴保存エラー:', error);
        }
        fetchHistory(user.id);
      }
    } catch (error) {
      console.error('AI鑑定エラー:', error);
      const errorMessages = {
        ja: "星々の声が聞き取れませんでした。",
        en: "Could not hear the voices of the stars.",
        zh: "无法听到星星的声音。"
      };
      setAiAdvice(errorMessages[lang] || errorMessages.ja);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flippedIndices.length === 10 && deck.length === 10 && !aiAdvice && !loading) {
      askAI();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flippedIndices]);

  if (!mounted || !dict) return <div className="min-h-screen bg-[#0a0a20]" />;

  return (
    <>
      <Head>
        <title>{dict.title} | {dict.subtitle}</title>
        <meta name="description" content={dict.description} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Head>

      <div className="min-h-screen p-4 text-white flex flex-col items-center font-sans tracking-tight bg-[#0a0a20]">
        {/* ヘッダー */}
        <div className="w-full max-w-5xl flex justify-between items-center gap-4 py-4">
          <div className="flex items-center gap-3">
            {user && (
              <Link
                href={`/${lang}/connect`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-400/30 text-xs hover:bg-indigo-500/40 transition-all font-bold text-indigo-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {dict.connect}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {!user ? (
              <div className="flex items-center gap-3">
                <button onClick={handleLogin} className="px-5 py-2 rounded-full bg-indigo-600/40 border border-indigo-400/30 text-xs hover:bg-indigo-500/60 transition-all font-bold">{dict.login}</button>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-indigo-950/30 px-4 py-2 rounded-2xl border border-indigo-500/10">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs text-indigo-200 opacity-70 cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-2"
                    onClick={() => window.location.href = `/${lang}/profile`}
                  >
                    {nickname || user.email?.split('@')[0]}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div className="w-[1px] h-3 bg-indigo-500/20" />
                  <button onClick={() => supabase?.auth.signOut().then(() => window.location.reload())} className="text-[10px] text-indigo-400/50 hover:text-indigo-300 uppercase font-bold">{dict.logout}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 text-center font-[family-name:var(--font-zen-kaku)] tracking-tight">{dict.title}</h1>

        <div className="max-w-2xl w-full text-center mb-12 space-y-4 px-6">
          <p className="text-sm md:text-base text-indigo-200/80 leading-relaxed font-medium">
            {dict.description}
          </p>
        </div>

        {/* フォーム */}
        <div className="glass flex flex-col gap-6 mb-16 w-full max-w-2xl p-6 rounded-2xl glow-blue">
          {/* カテゴリー選択 */}
          <div>
            <label className="text-xs font-bold text-indigo-300/80 uppercase block mb-3 tracking-widest">{dict.category.title}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg font-bold text-sm transition-all ${
                    category === cat.value
                      ? `bg-gradient-to-r ${cat.color} text-white scale-105 shadow-lg`
                      : 'bg-indigo-900/20 text-indigo-300/60 hover:bg-indigo-800/30 border border-indigo-500/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 質問入力 */}
          <div>
            <label className="text-xs font-bold text-indigo-300/80 uppercase block mb-3 tracking-widest">{dict.question.placeholder}</label>
            <input
              type="text"
              placeholder={dict.question.placeholder}
              className="w-full bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 focus:outline-none focus:border-indigo-400 transition-all"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
            />
          </div>

          <button
            onClick={startFortune}
            disabled={loading || !category}
            className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-black tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? dict.ai.analyzing : category ? dict.cards.draw : dict.question.required}
          </button>
        </div>

        {/* スプレッド */}
        <div className="relative">
          <AnimatePresence>
            {deck.length === 10 && flippedIndices.length < 10 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-16 left-0 right-0 text-center z-20">
                {category ? (
                  <p className="text-indigo-300 font-bold tracking-widest text-sm animate-pulse">{dict.cards.click}</p>
                ) : (
                  <p className="text-red-400 font-bold tracking-widest text-sm animate-pulse">⚠ {dict.question.required}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 w-fit mx-auto relative z-10">
            {deck.length === 10 && deck.map((card, i) => (
              <TarotCard
                key={card.id + i}
                card={card}
                index={i}
                isFlipped={flippedIndices.includes(i)}
                onFlip={category ? (idx: number) => { if (!flippedIndices.includes(idx)) setFlippedIndices([...flippedIndices, idx]); } : undefined}
              />
            ))}
          </div>
        </div>

        {/* 結果表示 */}
        <AnimatePresence>
          {flippedIndices.length === 10 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden mb-10">
              <h2 className="text-2xl mb-8 text-indigo-200 font-black text-center uppercase tracking-widest">{dict.ai.advice}</h2>
              {!aiAdvice ? (
                <div className="text-center py-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    <p className="text-indigo-300 font-bold tracking-widest">{dict.ai.analyzing}</p>
                  </div>
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
            <h3 className="text-xs font-black text-indigo-400/60 uppercase tracking-[0.3em] mb-8 text-center">{dict.history}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => {
                const itemCategory = categories.find(c => c.value === (item as any).category);
                return (
                  <motion.div key={item.id} whileHover={{ scale: 1.05 }} onClick={() => setSelectedHistory(item)} className="cursor-pointer p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/10 hover:border-indigo-500/40 transition-all flex flex-col aspect-[3/4] justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-[9px] text-indigo-400/60 font-bold">{new Date(item.created_at).toLocaleDateString()}</p>
                        {itemCategory && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${itemCategory.color} text-white font-bold`}>
                            {(item as any).category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] font-bold text-indigo-100 line-clamp-2 leading-tight uppercase">{item.question || dict.noHistory}</h4>
                    </div>
                    <div className="text-[9px] text-indigo-300/40 self-end font-black italic">{dict.viewDetails}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 詳細モーダル */}
        <AnimatePresence>
          {selectedHistory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedHistory(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0f0f2d] border border-indigo-500/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(79,70,229,0.2)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{new Date(selectedHistory.created_at).toLocaleString()}</p>
                      {(() => {
                        const selectedCategory = categories.find(c => c.value === (selectedHistory as any).category);
                        return selectedCategory && (
                          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${selectedCategory.color} text-white font-bold`}>
                            {selectedCategory.label}
                          </span>
                        );
                      })()}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-indigo-100">Q: {selectedHistory.question || dict.noHistory}</h2>
                  </div>
                  <button onClick={() => setSelectedHistory(null)} className="text-indigo-400 hover:text-white p-2 text-2xl flex-shrink-0">✕</button>
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
                    <h3 className="text-xs font-black text-indigo-400 mb-4 uppercase tracking-widest underline decoration-indigo-500/30 underline-offset-8">{dict.ai.advice}</h3>
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
