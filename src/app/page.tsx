"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TarotCard = ({ card, index, isFlipped, onFlip }: any) => {
  if (!card) return <div className="w-24 h-40 md:w-32 md:h-52 bg-indigo-900/20 rounded-lg animate-pulse border border-indigo-500/30" />;

  const positionClasses = [
    "col-start-2 row-start-2", "col-start-2 row-start-2 z-10 rotate-90 scale-90 translate-y-2",
    "col-start-2 row-start-1", "col-start-2 row-start-3", "col-start-1 row-start-2",
    "col-start-3 row-start-2", "col-start-4 row-start-4", "col-start-4 row-start-3",
    "col-start-4 row-start-2", "col-start-4 row-start-1",
  ];

  return (
    <div className={`${positionClasses[index]} relative w-24 h-40 md:w-32 md:h-52 perspective-1000`}>
      <motion.div
        className="w-full h-full cursor-pointer relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={() => onFlip(index)}
      >
        {/* 【修正】裏面：自作の魔法陣画像を表示 */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0a0a20] border-2 border-indigo-400 rounded-lg flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.3)]">
           {/* 背景の質感 */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
           
           {/* 魔法陣画像を表示 */}
           <img 
             src="/images/card-back.png" 
             alt="Card Back" 
             className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] z-10"
             onError={(e) => {
               // 画像がない時のためのデバッグ用：失敗したら「？」を出す
               e.currentTarget.style.display = 'none';
               const target = e.currentTarget.parentElement;
               if(target) target.innerHTML += '<span class="text-2xl font-serif opacity-50">?</span>';
             }}
           />
        </div>

        {/* 表面：タロット画像 */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg overflow-hidden rotate-y-180 shadow-2xl">
          <img 
            src={card.image_url.replace('/public', '')} 
            alt={card.name}
            className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150x250?text=Card")}
          />
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

  const startFortune = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fortune');
      if (!res.ok) throw new Error("APIリクエストに失敗しました");
      const data = await res.json();
      setDeck(data);
      setFlippedIndices([]);
      setAiAdvice("");
    } catch (err) {
      console.error(err);
      alert("運命の接続に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = (index: number) => {
    if (deck.length > 0 && !flippedIndices.includes(index)) {
      setFlippedIndices([...flippedIndices, index]);
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
    } catch (error) {
      setAiAdvice("星々の声が聞き取れませんでした。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* bg-[#050510]を削除。globals.cssの背景画像が見えるようになります */
    <div className="min-h-screen p-4 text-white flex flex-col items-center">
      
      <h1 className="text-5xl md:text-5xl font-[family-name:var(--font-shippori)] my-12 text-transparent bg-clip-text bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-500 glow-text tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        タロット占い
      </h1>
      
      {/* 入力フォーム：ガラス質感を追加 */}
      <div className="glass flex flex-col gap-4 mb-16 w-full max-w-md p-6 rounded-2xl glow-blue">
        <input 
          type="text"
          placeholder="相談したい悩みをここへ..."
          className="bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-400/30 focus:outline-none focus:border-indigo-400 transition-all"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
        />
        <button 
          onClick={startFortune}
          disabled={loading}
          className="bg-indigo-700/80 hover:bg-indigo-600 p-4 rounded-xl font-bold tracking-[0.2em] transition-all active:scale-95 disabled:bg-gray-800"
        >
          {loading ? "精神を集中しています..." : "運命のカードを引く"}
        </button>
      </div>

      <div className="relative">
        {/* カード配置エリア：背後に魔法陣の演出 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150 opacity-20">
            <div className="w-[400px] h-[400px] border border-blue-500 rounded-full animate-magic"></div>
        </div>

        <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-8 w-fit mx-auto relative z-10">
          {deck.length === 10 && deck.map((card, i) => (
            <TarotCard 
              key={card.id + i} 
              card={card} 
              index={i} 
              isFlipped={flippedIndices.includes(i)}
              onFlip={handleFlip}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {flippedIndices.length === 10 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 p-8 glass border border-indigo-500/30 rounded-3xl max-w-3xl w-full shadow-2xl relative z-20 overflow-hidden mb-20"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <h2 className="text-2xl mb-8 text-indigo-200 font-serif text-center">リーディング</h2>
            
            {!aiAdvice ? (
              <div className="text-center">
                <p className="text-indigo-300/70 mb-8">すべてのカードが並びました。あなたの物語をAIが読み解きます。</p>
                <button 
                  onClick={askAI} 
                  disabled={loading} 
                  className="bg-gradient-to-r from-indigo-800 to-purple-900 px-10 py-4 rounded-xl font-bold border border-indigo-400/30 hover:border-indigo-300 transition-all"
                >
                  {loading ? "星々を読み解いています..." : "AIに詳しく相談する"}
                </button>
              </div>
            ) : (
              <div className="bg-black/30 p-8 rounded-xl border border-white/5 shadow-inner">
                {/* 鑑定テキスト部分 */}
                <p className="whitespace-pre-wrap text-left text-indigo-50 font-sans leading-loose tracking-wide md:text-lg">
                  {aiAdvice}
                </p>
                
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={startFortune}
                    className="group relative px-6 py-2 text-xs text-indigo-400 hover:text-indigo-200 transition-colors uppercase tracking-[0.3em]"
                  >
                    <span className="relative z-10">新しい運命を占う</span>
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