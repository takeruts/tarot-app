import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Supabase clientのsingleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabase clientのsingleton取得関数
 * クライアント側で使用する安全なSupabaseクライアントを返す
 *
 * @returns SupabaseClient | null - 環境変数が設定されている場合はクライアント、なければnull
 */
export function getSupabaseClient(): SupabaseClient | null {
  // 既にインスタンスが作成されている場合はそれを返す
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 環境変数の取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数が設定されていない場合はnullを返す
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase環境変数が設定されていません。認証機能は無効です。');
    return null;
  }

  // 新しいインスタンスを作成
  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      domain: process.env.NODE_ENV === 'production' ? '.tarotai.jp' : undefined,
      path: '/',
      sameSite: 'lax',
      secure: true,
    },
  });

  return supabaseInstance;
}

/**
 * Supabase clientを取得する（エラーハンドリング付き）
 * nullの場合はエラーをスローする
 *
 * @throws Error - Supabaseが初期化されていない場合
 * @returns SupabaseClient
 */
export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error('Supabaseが初期化されていません。環境変数を確認してください。');
  }

  return client;
}

// テスト用: インスタンスをリセットする関数（通常は使用しない）
export function resetSupabaseInstance(): void {
  supabaseInstance = null;
}
