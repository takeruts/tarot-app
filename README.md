# Celtic Cross Tarot & Kachipi Auth System

このプロジェクトは、Supabaseをバックエンドとして共有し、認証 IdP（カチピ）と占いアプリ（タロット占い）を連携させたマルチドメイン・エコシステムです。

## 🛠️ 技術スタック

* **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion
* **Backend/Auth**: Supabase (Auth, PostgreSQL, RLS)
* **AI**: OpenAI API (占いアドバイス生成)
* **Infrastructure**: Vercel (Hosting)

## 🔐 認証アーキテクチャ (トークン受け流し方式)

通常の共有クッキー（SameSite=Lax/Domain属性）に依存せず、ブラウザのセキュリティ制限を回避する**トークン受け渡し方式**を採用しています。

1. **認証のリクエスト**: アプリ側 (`tarotai.jp`) からログインボタン押下時、`redirect_to` パラメータを付与してカチピ (`kachi.tarotai.jp`) へ遷移。
2. **プロバイダー認証**: カチピ側でメール/パスワードまたは Google OAuth を使用して認証。
3. **セッション交換とリダイレクト**: カチピの `auth/callback` サーバー側で認証コードをセッションに変換。
4. **トークンの付与**: リダイレクト先が `tarotai.jp` の場合、URL パラメータに `access_token` と `refresh_token` を付与してリダイレクト。
5. **アプリ側での復元**: アプリ側の `useEffect` が URL からトークンを検知し、`supabase.auth.setSession()` でログイン状態を確立。

## 🃏 タロット占いアプリの機能

* **ケルト十字スプレッド**: 10枚のカードを配置し、過去・現在・未来・潜在意識などを多角的に鑑定。
* **インタラクティブUI**:
* 「カードを１枚ずつクリックして、めくってください」という動的ガイド表示。
* ガラス質感（Glassmorphism）を採用したサイバーパンクなデザイン。


* **AIアドバイス**: OpenAIを活用し、引いたカードの組み合わせから具体的な助言を生成。
* **過去の神託 (履歴管理)**:
* ログインユーザーの過去の鑑定結果をデータベースに保存。
* **コンパクト表示**: 履歴リストはカード型で省スペースに表示。
* **詳細モーダル**: クリックで鑑定内容、質問、引いたカードの画像を拡大表示。



## 👤 認証・データ連携 (カチピ側)

* **匿名データのマージ**: ログイン前に作成された匿名投稿（`anonymous_id` ベース）を、ログイン成功時に自動でユーザーIDへ紐付け。
* **プロフィール共有**: `value_profiles` テーブルから取得したニックネームをヘッダーに優先表示。
* **Googleログイン**: Google OAuth 2.0 プロバイダーに対応。

## ⚙️ 環境変数 (Environment Variables)

両方のプロジェクトの Vercel 設定で以下の変数を設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (カチピ側のみ必須)

```

## 📂 主要ディレクトリ

* `/app/page.tsx`: 占いメインロジック & トークン受け取り
* `/app/auth/callback/route.ts`: サーバーサイド認証 & トークン付与リダイレクト

---
