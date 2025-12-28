"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Supabase初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// storageKey を一致させる
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token', 
  }
}) : null;

const KACHIPEA_LOGIN_URL = "https://kachi.tarotai.jp/login"; 

// --- 中略 (TarotCardコンポーネント等はそのまま) ---

export default function CelticCrossPage() {
  const [deck, setDeck] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      // 1. まず通常のセッションチェック
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
      } else {
        // 2. 【最重要】Cookieが存在するがSDKが認識していない場合の強制リセット
        // Cookieがあるのにセッションがない場合、一度サインアウトしてCookie情報を再評価させる
        const hasCookie = document.cookie.includes('sb-auth-token');
        if (hasCookie) {
          // getUser() を呼ぶことでCookieの有効性をサーバーに確認させる
          const { data: { user: cookieUser } } = await supabase.auth.getUser();
          if (cookieUser) {
            setUser(cookieUser);
            fetchHistory(cookieUser.id);
          }
        }
      }
    };

    initAuth();

    // 3. 状態変化の監視（eventに関わらずsessionがあればセット）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, !!session); 
      if (session?.user) {
        setUser(session.user);
        fetchHistory(session.user.id);
      } else {
        // セッションが消えた場合のみクリア
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setHistory([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 中略 (fetchHistory, handleLogin, startFortune, askAIなどはそのまま) ---

  const handleLogin = () => {
    // リダイレクト先を現在のドメインに正確に指定
    const currentUrl = window.location.origin;
    window.location.href = `${KACHIPEA_LOGIN_URL}?redirect_to=${encodeURIComponent(currentUrl)}`;
  };

  return (
    // --- JSX (デザイン部分) は以前の通り ---
    // user がセットされれば自動的に「ようこそ」が表示されます
  );
}