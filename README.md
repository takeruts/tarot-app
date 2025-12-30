# AI Tarot - Inner Clarity (ケルティッククロス)

AIを活用した本格的なタロット占いアプリです。「当てる」こと以上に、**「カードの象徴を通して自分の内面を整理する」**という対話的な体験を重視して開発されています。

## 🔮 特徴

* **本格ケルティッククロス・スプレッド**: 10枚のカードを展開し、多角的な視点から現状を分析。
* **AIリーディング**: 最新のAIが展開されたカードの象徴を読み解き、ユーザーの悩みに寄り添った神託を提供。
* **一元管理（SSO）基盤**: 認証基盤「Kachipi」と連携し、複数アプリ間でプロフィール（ニックネーム等）やセッションをシームレスに同期。
* **履歴管理**: 過去の神託結果をデータベースに保存。いつでも自分の心の変化を振り返ることが可能。
* **SEO & OGP最適化**: 構造化データ（JSON-LD）の実装により、検索エンジンにも最適化。

## 🛠 技術スタック

| カテゴリ | 技術 |
| --- | --- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [Framer Motion](https://www.framer.com/motion/) |
| **Backend / Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **AI Integration** | OpenAI API / Google Gemini API (via Edge Runtime) |

## 🚀 導入方法

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/tarot-ai-app.git
cd tarot-ai-app

```

### 2. 依存関係のインストール

```bash
npm install

```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の項目を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# AI用APIキーなどはAPIルート側で設定

```

### 4. 開発サーバーの起動

```bash
npm run dev

```

## 🔐 認証フロー

本アプリは**独自の認証システム**を使用しています（Supabase Auth）。

### 認証の仕組み

1. ユーザーがログインボタンをクリック
2. タロットアプリ内のログインページ (`/login`) に移動
3. メールアドレスとパスワードでログインまたは新規登録
4. Supabaseがセッションを管理
5. ログイン成功後、ホームページにリダイレクト

### 新規登録の流れ

1. `/login` ページで「新規アカウント作成」をクリック
2. メールアドレスとパスワードを入力
3. 確認メールが送信される
4. メール内のリンクをクリックして登録完了
5. 自動的にログイン状態になる

## 📂 データベース構成

本アプリは以下のテーブル構成（Supabase）を前提としています。

* **`profiles`**: ユーザープロフィール（ニックネーム、AI名など）
* **`tarot_history`**: 占いの履歴（相談内容、展開カード、AIのアドバイス）

## 🎨 デザインコンセプト

「未来的な神秘性（Futuristic Mysticism）」をテーマに、ダークモードを基調としたインディゴカラーとガラスモーフィズム（Glassmorphism）を採用。ユーザーが深い思考に沈めるような静かなUIを目指しています。

## 📝 開発コンセプト

> タロットは、自分の内面を整理するのにとても有効な手段です。
> 各々のカードが象徴する観点を通して、自分の悩みや考えを見直すことで、今までとは違う視点で自分の内面を整理することができます。

---

Copyright (c) 2025 **AI Tarot**

