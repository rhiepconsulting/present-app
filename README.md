# HAPPY CARD - SPECIAL LOTTERY（サプライズ報告アプリ）

大切な人へ届けるスクラッチくじ風サプライズ発表Webアプリケーションです。  
GitHubにプッシュして即座に公開・スマホアプリ化できる完全な設定が整っています。

---

## 📱 アプリ化の対応状況（準備完了済み）

本リポジトリは **「PWA（Progressive Web App）」** および **「ネイティブアプリ化（Capacitor）」** に完全対応しています。

### 1. PWA（おすすめ・審査なし・無料）
スマホのブラウザ（Safari / Chrome）で開いて**「ホーム画面に追加」**するだけで、以下が有効になります：
- ✅ **全画面ネイティブアプリ体験**（SafariやChromeのURLバー・ナビゲーションが消え、普通のアプリ同様に起動）
- ✅ **専用アプリアイコン**（iPhone/iPad、Androidそれぞれの規格に適合した高解像度アイコン・Maskable対応）
- ✅ **オフラインキャッシュ対応**（Service Workerによる高速読み込み）
- ✅ **画面内インストール案内**（画面右上に「アプリ化・保存」ボタンを設置済み、iOS向け手順ガイド付き）

### 2. App Store / Google Play配布（Capacitor）
XcodeやAndroid Studioを使ってストア配信用のネイティブアプリ（iOS `.ipa` / Android `.apk`）に変換することも可能です（詳細は後述）。

---

## 🚀 GitHubにアップロード（プッシュ）する手順

まだGitHubにリポジトリを作成していない場合は、以下の手順で簡単にプッシュできます。

### ステップ1: GitHubで新規リポジトリを作成
1. [GitHub](https://github.com/) にログインし、右上の「＋」→「New repository」をクリック。
2. Repository name（例: `happy-card-surprise`）を入力し、「Public」または「Private」を選択。
3. 「Initialize this repository with...」のチェックはすべて**外したまま**「Create repository」をクリック。

### ステップ2: ターミナルで実行するコマンド
プロジェクトのフォルダで以下を実行します：

```bash
# 1. gitの初期化とファイル追加
git init -b main
git add .
git commit -m "feat: Initial commit for Happy Card app"

# 2. GitHubリポジトリのURLを登録（ご自身のリポジトリURLに差し替えてください）
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git

# 3. GitHubへプッシュ
git push -u origin main
```

---

## 🌐 無料でWeb公開する方法（アプリURLの発行）

GitHubにコードが入れば、以下のいずれかで1分で公開できます：

### オプションA: Vercel（最もおすすめ・簡単）
1. [Vercel](https://vercel.com/) にGitHubアカウントでログイン。
2. 「Add New...」→「Project」から上記GitHubリポジトリを選択。
3. 何も変更せず「Deploy」をクリック。
4. 数十秒で `https://xxxx.vercel.app` という公開URLが発行されます。

### オプションB: GitHub Pages（無料・追加登録不要）
リポジトリ内に自動デプロイ設定（`.github/workflows/deploy.yml`）を用意済みです。
1. GitHubリポジトリの **Settings** → **Pages** を開く。
2. **Build and deployment** の Source を **「GitHub Actions」** に変更。
3. `main` ブランチにプッシュされると自動的に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます。
※ Viteの `base: './'` 設定済みのため、サブディレクトリ環境でも画像やスクリプトが正しく動作します。

---

## 📲 スマホでアプリとしてインストールする方法

公開されたURLをスマートフォンで開きます：

- **iPhone / iPad（Safari）**:
  1. 画面下部の中央にある「共有」アイコン（四角から矢印が出ているマーク）をタップ
  2. メニューをスクロールして **「ホーム画面に追加」** を選択
  3. 右上の「追加」をタップ → ホーム画面にアプリが追加されます！

- **Android（Chrome）**:
  1. 画面右上のメニュー（︙）をタップ、または画面右上の「アプリ化・保存」ボタンをタップ
  2. **「アプリをインストール」** または **「ホーム画面に追加」** をタップ

---

## 📦 CapacitorでiOS / Androidネイティブアプリ化する場合

ネイティブビルド（App Store / Google Play用）を行いたい場合の手順：

```bash
# 1. Capacitorのインストール
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/ios @capacitor/android

# 2. 初期設定
npx cap init "HAPPY CARD" "com.example.happycard" --web-dir "dist"

# 3. アプリのビルド
npm run build

# 4. iOS / Androidプラットフォーム追加
npx cap add ios
npx cap add android

# 5. ネイティブプロジェクトの同期・起動
npx cap sync
npx cap open ios      # Xcodeが起動します（Mac環境）
npx cap open android  # Android Studioが起動します
```

---

## 🛠 ローカル開発コマンド

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# プロダクションビルド（dist/ を生成）
npm run build

# ビルド成果物のプレビュー
npm run preview

# 型チェック（TypeScript）
npm run lint
```
