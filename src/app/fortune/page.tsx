"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * カード1枚のコンポーネント
 */
const TarotCard = ({ card, index, isFlipped, onFlip }: any) => {
  const positionClasses = [
    "col-start-2 row-start-2", // 1. 現状
    "col-start-2 row-start-2 z-20 rotate-90 scale-90 translate-y-2", // 2. 障害
    "col-start-2 row-start-1", // 3. 顕在意識
    "col-start-2 row-start-3", // 4. 潜在意識
    "col-start-1 row-start-2", // 5. 過去
    "col-start-3 row-start-2", // 6. 未来
    "col-start-4 row-start-4", // 7. 相談者の立場
    "col-start-4 row-start-3", // 8. 周囲の状況
    "col-start-4 row-start-2", // 9. 願望・恐れ
    "col-start-4 row-start-1", // 10. 最終結果
  ];

  return (
    <div className={`${positionClasses[index]} relative w-20 h-32 md:w-32 md:h-52 perspective-1000 group`}>
      <motion.div
        className="w-full h-full cursor-pointer relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        onClick={() => onFlip(index)}
      >
        {/* カードの裏面 (Back) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0a0a20] border-2 border-indigo-400/50 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center justify-center overflow-hidden">
          {/* 背景の幾何学模様 */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sacred-geometry.png')] opacity-20"></div>
          
          {/* 魔法陣画像（パスを確実に指定） */}
          <img 
            src="/images/card-back.png" 
            alt="Card Back"
            className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_10px_rgba(165,180,252,0.7)] group-hover:scale-110 transition-transform duration-500 z-10"
            onError={(e) => {
              // 画像が読み込めない場合のバックアップ表示
              console.error("Card back image failed to load");
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML += '<span class="text-indigo-200/50 text-2xl font-serif">?</span>';
            }} 
          />
          
          {/* 微かな光の演出 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5"></div>
        </div>

        {/* カードの表面 (Front) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg overflow-hidden rotate-y-180 shadow-2xl">
          <img 
            src={card.image_url.replace('/public', '')} 
            alt={card.name}
            className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
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

  const handleFlip = (index: number) => {
    if (deck.length > 0 && !flippedIndices.includes(index)) {
      setFlippedIndices([...flippedIndices, index]);
    }
  };

  const askAI = async () => {
    if (deck.length === 0) return;
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
      setAiAdvice("星々の声が届きませんでした。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center">
      
      {/* タイトルセクション */}
      <header className="text-center mb-16 relative">
        <h1 className="text-5xl md:text-7xl font-shippori my-12 text-transparent bg-clip-text bg-gradient-to-b from-indigo-50 via-indigo-200 to-indigo-500 glow-text tracking-[0.3em]">
          タロット占い
        </h1>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-indigo-500/50"></div>
          <p className="text-indigo-300/60 text-[10px] md:text-xs uppercase tracking-[0.6em] font-sans">
            Celtic Cross Spread
          </p>
          <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-indigo-500/50"></div>
        </div>
      </header>

      {/* 相談入力エリア */}
      <div className="glass p-6 rounded-2xl w-full max-w-lg mb-16 glow-blue z-50">
        <div className="flex flex-col gap-4">
          <input 
            type="text"
            placeholder="心にある問いを入力してください..."
            className="w-full bg-black/40 border border-indigo-500/30 rounded-lg px-4 py-3 text-indigo-100 placeholder:text-indigo-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
          />
          <button 
            onClick={startFortune}
            disabled={loading}
            className="w-full py-4 bg-indigo-600/60 hover:bg-indigo-500 text-white rounded-lg transition-all font-bold tracking-[0.2em] shadow-lg disabled:opacity-50 active:scale-95"
          >
            {loading ? "精神を集中しています..." : "運命のカードを引く"}
          </button>
        </div>
      </div>

      {/* スプレッド配置エリア */}
      <main className="relative py-20 px-4 scale-[0.75] sm:scale-90 md:scale-100">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] border border-indigo-500/20 rounded-full animate-magic"></div>
          <div className="absolute w-[550px] h-[550px] border border-blue-400/10 rounded-full rotate-45"></div>
          <div className="absolute w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="grid grid-cols-4 grid-rows-4 gap-4 md:gap-10 relative z-10">
          {deck.map((card, i) => (
            <TarotCard 
              key={i} 
              card={card} 
              index={i} 
              isFlipped={flippedIndices.includes(i)}
              onFlip={handleFlip}
            />
          ))}
        </div>
      </main>

      {/* AI鑑定エリア */}
      <AnimatePresence>
        {flippedIndices.length === 10 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-24 p-8 glass rounded-3xl max-w-3xl w-full shadow-2xl relative z-50 overflow-hidden mb-24"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            
            <h2 className="text-2xl mb-8 text-indigo-200 font-shippori text-center tracking-widest">
              AI鑑定師の託宣
            </h2>
            
            {!aiAdvice ? (
              <div className="flex flex-col items-center py-4">
                <p className="text-indigo-200/70 mb-8 text-center leading-loose font-shippori">
                  すべてのカードが並びました。<br/>あなたの魂が映し出されています。
                </p>
                <button 
                  onClick={askAI}
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-indigo-800/80 to-purple-900/80 border border-indigo-400/30 rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all font-bold tracking-widest shadow-xl shadow-indigo-500/20"
                >
                  {loading ? "星々を読み解いています..." : "鑑定結果を聞く"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-indigo-50 leading-loose tracking-wide font-sans md:text-lg whitespace-pre-wrap p-8 rounded-xl bg-black/50 border border-white/10 shadow-inner italic shadow-indigo-500/5">
                  {aiAdvice}
                </div>
                <button 
                  onClick={startFortune}
                  className="text-xs text-indigo-400 hover:text-indigo-200 block mx-auto pt-6 tracking-[0.3em] uppercase transition-colors"
                >
                  新しい運命を占う
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <footer className="mt-auto mb-10 text-indigo-300/20 text-[10px] tracking-[1em] uppercase">
        Tarot Web Application v1.0
      </footer>
    </div>
  );
}