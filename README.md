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
- **ソーシャルログイン**: Google、Facebook、X（Twitter）でワンクリックログイン
- **パスワードリセット**: メールでのパスワード再設定機能
- **プロフィール管理**: ニックネーム編集、パスワード変更
- **データ削除手順**: Facebook審査対応のデータ削除ガイドページ

### 📊 履歴管理
- **相談履歴の保存**: 過去の占い結果をデータベースに保存
- **カテゴリー表示**: 各履歴にカテゴリーバッジを表示
- **詳細モーダル**: カード配置とリーディング内容を再確認可能

### 💬 チャット機能
- **チャットルーム**: カテゴリー別にチャットルームを作成・参加
- **リアルタイムメッセージング**: Supabase Realtimeによる即時メッセージ配信
- **ルーム管理**: ルーム作成、参加、退室機能
- **メンバー数表示**: 各ルームの参加人数をリアルタイム表示
- **プライベート空間**: 似た悩みを持つ人同士で安心して相談

### 🎨 UI/UX
- **モダンなデザイン**: Zen Kaku Gothic Newフォント採用
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ完全対応
- **アニメーション**: Framer Motionによる滑らかなカードめくり演出
- **ガラスモーフィズム**: 神秘的な雰囲気を演出
- **アプリアイコン**: ファビコン、Apple用アイコン、OGP画像、Facebook用アイコン完備

### 🌍 多言語対応（Multilingual Support）
- **3言語完全対応**: 日本語（🇯🇵）・英語（🇺🇸）・中国語（🇨🇳）
- **UIテキスト翻訳**: すべてのインターフェース要素を各言語で提供
- **タロットカード名**: カード名を各言語に自動翻訳（78枚すべて対応）
- **AIリーディング**: 選択した言語でAIが占い結果を生成
- **言語切り替え**: ヘッダーのドロップダウンから瞬時に切り替え可能
- **SEO最適化**: 各言語ごとにメタデータとサイトマップを自動生成
- **自動言語検出**: ブラウザの言語設定に基づいて自動リダイレクト
- **URLベースルーティング**: `/ja`, `/en`, `/zh` で言語別アクセス可能
- **hreflang実装**: 検索エンジンが各言語版を正しく認識

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

# OAuth設定（オプション）
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id
```

### 4. Supabaseテーブルの作成

Supabase SQL Editorで以下のマイグレーションファイルを順番に実行してください：

1. **チャット機能のテーブル作成**
   ```bash
   # supabase/migrations/20250101000000_create_chat_tables.sql
   ```
   - chat_rooms（チャットルーム）
   - chat_room_members（メンバー管理）
   - chat_messages（メッセージ）
   - Row Level Security (RLS) ポリシー

2. **既存のテーブル**（過去に作成済みの場合はスキップ）
   - `tarot_history` テーブル（履歴管理）
   - categoryカラム追加

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
│   │   │   ├── data-deletion/ # データ削除手順ページ
│   │   │   ├── layout.tsx     # 言語別レイアウト
│   │   │   └── page.tsx       # 言語別メインページ
│   │   ├── api/
│   │   │   ├── chat/          # AIリーディングAPI
│   │   │   ├── fortune/       # カード配布API
│   │   │   └── matching/      # ユーザーマッチングAPI
│   │   ├── auth/
│   │   │   └── callback/      # 認証コールバック
│   │   ├── icon.tsx           # ファビコン (32x32)
│   │   ├── apple-icon.tsx     # Apple用アイコン (180x180)
│   │   ├── opengraph-image.tsx # OGP画像 (1200x630)
│   │   ├── connect/           # チャット機能
│   │   │   ├── page.tsx       # ルーム一覧
│   │   │   └── [roomId]/      # チャットルーム
│   │   │       └── page.tsx   # リアルタイムメッセージング
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
│   ├── images/                # カード画像
│   └── facebook-icon.png      # Facebook用アイコン (1024x1024)
├── supabase-schema.sql        # DBスキーマ
├── add-category-column.sql    # カラム追加SQL
└── README.md
```

## 🌐 多言語化の実装詳細

### URL構造
各言語は独自のURLパスを持ちます。
```
https://www.tarotai.jp/ja       # 日本語版
https://www.tarotai.jp/en       # 英語版
https://www.tarotai.jp/zh       # 中国語版
```

### 言語ごとの対応内容

#### UIテキスト
- [ja.json](src/i18n/locales/ja.json)、[en.json](src/i18n/locales/en.json)、[zh.json](src/i18n/locales/zh.json)で管理
- タイトル、ボタン、エラーメッセージ、カテゴリー名など全要素を翻訳

#### タロットカード名
- **日本語**: tarot_data.jsonの`name`フィールドを使用
- **英語**: tarot_data.jsonの`english_name`フィールドを使用
- **中国語**: [fortune/route.ts](src/app/api/fortune/route.ts:19-98)の`chineseNames`辞書で78枚すべてをマッピング

#### AIリーディング
- [chat/route.ts](src/app/api/chat/route.ts:42-72)で言語別システムプロンプトを実装
- ポジション名（現状、障害など）を各言語で表示
- 正位置/逆位置のラベルも言語対応

### ミドルウェア
[middleware.ts](src/middleware.ts)がルートパス`/`へのアクセスを検出し、デフォルト言語（日本語）にリダイレクトします。

### SEO対応
- `<html lang="...">`属性を動的設定
- `hreflang`タグで各言語版を相互参照
- 言語別のOpen Graph / Twitter Cardメタデータ
- サイトマップに全言語版を含める

## 🔐 認証フロー

本アプリは**Supabase Auth**を使用した独自認証システムです。

### 認証の仕組み

1. ユーザーがログインボタンをクリック
2. `/login` ページでメール/パスワードまたはソーシャルログイン（Google / Facebook / X）を選択
3. Supabaseがセッションを管理（PKCE flow）
4. ログイン成功後、ホームページにリダイレクト

### 新規登録の流れ

1. `/login` ページで「新規アカウント作成」を選択
2. メールアドレスとパスワードを入力、またはソーシャルログインを選択
3. 確認メールが送信される（メール/パスワード認証の場合）
4. メール内のリンクをクリックして登録完了

### OAuth設定

Facebook、X（Twitter）ログインを有効にするには、Supabase Dashboardで各プロバイダーの設定が必要です：

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. 各プロバイダー（Facebook, Twitter）を有効化
3. App ID / Client IDとApp Secret / Client Secretを設定
4. Callback URLを設定: `https://your-project.supabase.co/auth/v1/callback`

### データ削除手順ページ

Facebook Developer Console審査対応のため、データ削除手順ページを提供：
- **URL**: `/ja/data-deletion`, `/en/data-deletion`, `/zh/data-deletion`
- ユーザーデータの削除方法を3ヶ国語で説明
- Facebook App設定の「User Data Deletion Callback URL」に設定可能

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
- [x] Facebook・X OAuth ログイン ✅ **完了**
- [x] アプリアイコン一式（ファビコン、OGP画像など）✅ **完了**
- [x] データ削除手順ページ（Facebook審査対応）✅ **完了**
- [ ] ダークモード/ライトモード切り替え
- [ ] 追加言語対応（韓国語、スペイン語など）

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

**Made with ❤️ by TarotAI Team**

Copyright (c) 2025 AIタロット占い
