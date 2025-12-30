# 🔮 AIタロット占い - 内面を整理する神託

AIを活用した本格的なタロット占いアプリです。「当てる」こと以上に、**「カードの象徴を通して自分の内面を整理する」**という対話的な体験を重視して開発されています。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## ✨ 主な機能

### 🎴 タロット占い
- **本格ケルティッククロス・スプレッド**: 10枚のカードを展開し、多角的な視点から現状を分析
- **カテゴリー選択**: 恋愛・仕事・人間関係・健康・お金・将来など7つのカテゴリーから選択
- **AIリーディング**: 最新のAIが展開されたカードを読み解き、深い洞察を提供
- **自動リーディング**: カードを全てめくると自動的にAI分析が開始

### 🔐 認証システム
- **メール/パスワード認証**: Supabase Authによる安全な認証
- **Googleソーシャルログイン**: ワンクリックでログイン可能
- **パスワードリセット**: メールでのパスワード再設定機能
- **プロフィール管理**: ニックネーム編集、パスワード変更

### 📊 履歴管理
- **相談履歴の保存**: 過去の占い結果をデータベースに保存
- **カテゴリー表示**: 各履歴にカテゴリーバッジを表示
- **詳細モーダル**: カード配置とリーディング内容を再確認可能

### 👥 ユーザー交流機能（開発中）
- **マッチング**: 似た悩みを持つユーザーとの出会い
- **タグベース類似度判定**: 相談内容から自動でマッチング候補を提案
- **メッセージ機能**: 承認後にユーザー同士でメッセージ交換（実装予定）

### 🎨 UI/UX
- **モダンなデザイン**: Zen Kaku Gothic Newフォント採用
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ完全対応
- **アニメーション**: Framer Motionによる滑らかなカードめくり演出
- **ガラスモーフィズム**: 神秘的な雰囲気を演出

### 🌍 多言語対応
- **3言語対応**: 日本語・英語・中国語に完全対応
- **言語切り替え**: ヘッダーから簡単に言語を切り替え可能
- **SEO最適化**: 各言語ごとにメタデータとサイトマップを自動生成
- **自動言語検出**: ブラウザの言語設定に基づいて自動リダイレクト

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **Framework** | [Next.js 16.1.1](https://nextjs.org/) (App Router, Turbopack) |
| **言語** | [TypeScript 5.0](https://www.typescriptlang.org/) |
| **Backend/Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS) |
| **Styling** | [Tailwind CSS 3.4.19](https://tailwindcss.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **AI** | OpenAI API / Google Gemini API |
| **Fonts** | Zen Kaku Gothic New, Orbitron (Google Fonts) |
| **i18n** | Next.js App Router i18n (日本語・英語・中国語) |

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/takeruts/tarot-app.git
cd tarot-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の項目を設定してください。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Google OAuth (オプション)
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
```

### 4. Supabaseテーブルの作成

Supabase SQL Editorで以下のSQLファイルを実行してください：

1. `supabase-schema.sql` - connectionsとmessagesテーブル作成
2. `add-category-column.sql` - tarot_historyテーブルにcategoryカラム追加

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📂 プロジェクト構造

```
tarot-app/
├── src/
│   ├── app/
│   │   ├── [lang]/            # 言語別ルーティング
│   │   │   ├── layout.tsx     # 言語別レイアウト
│   │   │   └── page.tsx       # 言語別メインページ
│   │   ├── api/
│   │   │   ├── chat/          # AIリーディングAPI
│   │   │   ├── fortune/       # カード配布API
│   │   │   └── matching/      # ユーザーマッチングAPI
│   │   ├── auth/
│   │   │   └── callback/      # 認証コールバック
│   │   ├── connect/           # ユーザー交流ページ
│   │   ├── login/             # ログインページ
│   │   ├── profile/           # プロフィール編集
│   │   ├── reset-password/    # パスワードリセット
│   │   ├── update-password/   # パスワード更新
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # リダイレクトページ
│   │   ├── sitemap.ts         # サイトマップ生成
│   │   └── robots.ts          # robots.txt生成
│   ├── components/
│   │   └── LanguageSwitcher.tsx # 言語切り替えコンポーネント
│   ├── i18n/
│   │   ├── config.ts          # i18n設定
│   │   ├── utils.ts           # i18n ユーティリティ
│   │   └── locales/           # 翻訳ファイル
│   │       ├── ja.json        # 日本語
│   │       ├── en.json        # 英語
│   │       └── zh.json        # 中国語
│   ├── lib/
│   │   ├── supabase.ts        # Supabaseクライアント
│   │   └── matchingService.ts # マッチングロジック
│   ├── types/
│   │   └── index.ts           # TypeScript型定義
│   └── middleware.ts          # 言語リダイレクトミドルウェア
├── public/
│   └── images/                # カード画像
├── supabase-schema.sql        # DBスキーマ
├── add-category-column.sql    # カラム追加SQL
└── README.md
```

## 🔐 認証フロー

本アプリは**Supabase Auth**を使用した独自認証システムです。

### 認証の仕組み

1. ユーザーがログインボタンをクリック
2. `/login` ページでメール/パスワードまたはGoogleログイン
3. Supabaseがセッションを管理（PKCE flow）
4. ログイン成功後、ホームページにリダイレクト

### 新規登録の流れ

1. `/login` ページで「新規アカウント作成」を選択
2. メールアドレスとパスワードを入力
3. 確認メールが送信される
4. メール内のリンクをクリックして登録完了

## 📊 データベース構成

### tarot_history
- 占いの履歴（相談内容、カード配置、AIアドバイス、カテゴリー）

### connections
- ユーザー間の繋がり（マッチング情報、類似度スコア）

### messages
- ユーザー間のメッセージ

## 🎨 デザインコンセプト

**「未来的な神秘性（Futuristic Mysticism）」**

- **カラースキーム**: インディゴを基調としたダークモード
- **UI要素**: ガラスモーフィズム、グラデーション、シャドウ
- **フォント**: Zen Kaku Gothic New（力強く現代的な日本語フォント）
- **アニメーション**: 滑らかなカードめくり、フェードイン/アウト

## 🔍 SEO対策

- ✅ 構造化データ（JSON-LD）実装
- ✅ Open Graph / Twitter Card対応
- ✅ sitemap.xml自動生成（全言語対応）
- ✅ robots.txt自動生成
- ✅ メタタグ最適化（言語別）
- ✅ セマンティックHTML
- ✅ hreflang属性による多言語SEO
- ✅ 言語別URLによる検索エンジン最適化

## 📝 開発コンセプト

> タロットは、自分の内面を整理するのにとても有効な手段です。
> 各々のカードが象徴する観点を通して、自分の悩みや考えを見直すことで、
> 今までとは違う視点で自分の内面を整理することができます。

このアプリは「当たる占い」ではなく、「自己対話のツール」として設計されています。

## 🚧 今後の予定

- [ ] メッセージ機能の完全実装
- [ ] リアルタイム通知
- [ ] プッシュ通知対応
- [ ] PWA対応
- [x] マルチ言語対応（英語、中国語）✅ **完了**
- [ ] ダークモード/ライトモード切り替え
- [ ] 追加言語対応（韓国語、スペイン語など）

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

**Made with ❤️ by TarotAI Team**

Copyright (c) 2025 AIタロット占い
