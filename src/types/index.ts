import { User } from '@supabase/supabase-js';

/**
 * タロットカードの型定義
 */
export interface TarotCard {
  id: string;
  name: string;
  image_url: string;
  isReversed: boolean;
  meaning?: string;
  reversed_meaning?: string;
}

/**
 * TarotCardコンポーネントのProps型
 */
export interface TarotCardProps {
  card: TarotCard;
  index: number;
  isFlipped: boolean;
  onFlip?: (index: number) => void;
}

/**
 * タロット履歴のデータベース型
 */
export interface TarotHistory {
  id: string;
  user_id: string;
  question: string;
  advice: string;
  cards: TarotCard[];
  created_at: string;
  updated_at?: string;
}

/**
 * ユーザープロフィールの型定義
 */
export interface UserProfile {
  id: string;
  nickname?: string;
  ai_name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Supabase Userの拡張型
 */
export type AppUser = User;

/**
 * AI APIレスポンスの型
 */
export interface AIAdviceResponse {
  advice: string;
  error?: string;
}

/**
 * AI APIリクエストの型
 */
export interface AIAdviceRequest {
  cards: TarotCard[];
  userMessage: string;
}

/**
 * JSON-LD構造化データの型
 */
export interface JsonLdSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
}
