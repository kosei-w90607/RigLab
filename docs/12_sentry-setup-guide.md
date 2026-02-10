# Sentryセットアップ手順書

## 1. はじめに

RigLabプロジェクトでは、フロントエンド（Next.js）とバックエンド（Rails）の両方にSentryのエラー監視を導入しています。

**コード側の設定は全て完了済みです。** DSNが未設定の場合はSentryは無効化（no-op）されるため、アプリケーションの動作に影響はありません。

本手順書では、Sentryアカウントを作成してDSNを取得し、環境変数に設定するまでの手順を説明します。

### 導入済みのSDKバージョン

| 環境 | パッケージ | バージョン |
|------|-----------|-----------|
| Frontend | `@sentry/nextjs` | ^10.38.0 |
| Backend | `sentry-ruby` | 6.3.0 |
| Backend | `sentry-rails` | 6.3.0 |

---

## 2. Sentryアカウント作成

### 2-1. サインアップ

1. https://sentry.io/signup/ にアクセス
2. フォームに以下を入力:

| フィールド | 入力内容 |
|-----------|---------|
| **Name** | 自分の名前 |
| **Organization** | 組織名（例: `riglab`、個人名でもOK。後から変更可能） |
| **Email** | メールアドレス |
| **Password** | パスワード |

3. **Data Storage Location（データ保存先）** を選択:
   - 🇺🇸 **United States（US）** — 日本からの利用ならこちらでOK
   - 🇪🇺 European Union（EU）
   - ⚠️ **作成後は変更できない**ので注意
4. 「I agree to the Terms of Service and Privacy Policy」にチェック
5. **「Create Your Account」** をクリック
6. 入力したメールアドレスに認証メールが届くのでリンクをクリック

> **別の方法**: フォーム下部の「or sign up with」から **Google / GitHub / Azure DevOps** アカウントでも作成できます。この場合、Name・Email・Passwordの入力は不要ですが、Organization名とData Storage Locationは別途設定が必要です。

> **Note**: Sentryの無料プラン（Developer）では月5,000イベントまで無料で利用できます。個人プロジェクトには十分です。

---

## 3. プロジェクト作成

RigLabではフロントエンドとバックエンドで別々のプロジェクトを作成します。これにより、エラーの発生源を明確に区別できます。

プロジェクト作成は「Create a new project in 3 steps」の画面で進めます。フロントエンド・バックエンドそれぞれ作成してください。

### 3-1. フロントエンド用プロジェクト（Next.js）

1. ダッシュボード左メニューの **「Projects」** → 右上の **「Create Project」** をクリック

2. **Step 1 — Choose your platform（プラットフォーム選択）**
   - 一覧から **「Next.js」** を検索・選択

3. **Step 2 — Set your alert frequency（アラート頻度の設定）**
   - **「Alert me on every new issue」**（全ての新しいエラーで通知）— 最初はこちら推奨
   - または「When there are more than...」で閾値を設定
   - 後から Settings → Alerts で変更可能なので、迷ったらデフォルトでOK

4. **Step 3 — Name your project and assign it a team（プロジェクト名とチーム）**
   - **Project Name**: `riglab-frontend`
   - **Team**: デフォルトのチーム（サインアップ時に自動作成済み）をそのまま選択

5. **「Create Project」** をクリック
6. セットアップガイドが表示されるが、コード設定は完了済みなので **スキップして構いません**

### 3-2. バックエンド用プロジェクト（Rails）

同じ手順でもう1つ作成します。

1. **「Projects」** → **「Create Project」**
2. **Step 1**: プラットフォームで **「Rails」** を選択
3. **Step 2**: アラート頻度はフロントエンドと同じ設定でOK
4. **Step 3**: Project Name を `riglab-backend` に設定、Teamはデフォルト
5. **「Create Project」** をクリック
6. セットアップガイドはスキップ

---

## 4. DSN取得

DSN（Data Source Name）はSentryにイベントを送信するための接続文字列です。各プロジェクトに固有のDSNが発行されます。

### DSNの確認方法

1. ダッシュボード左メニューの **「Settings」** をクリック
2. **「Projects」** → 対象プロジェクト名（例: `riglab-frontend`）をクリック
3. 左メニューの **「Client Keys (DSN)」** をクリック
4. **DSN** の値をコピー

DSNは以下のような形式です:
```
https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@oXXXXXX.ingest.sentry.io/XXXXXXX
```

> **Note**: DSNは秘密情報ではありませんが、不必要に公開する必要もありません。フロントエンドのDSNはブラウザから見えるため、悪用されても自分のSentryにゴミデータが送られるだけです。

---

## 5. 環境変数の設定

### 5-1. ローカル開発環境

フロントエンドは `frontend/.env.local`（`.gitignore` で除外済み）に追記:

```bash
# frontend/.env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oXXXXX.ingest.sentry.io/XXXXX
```

バックエンドは `backend/.env`（`.gitignore` で `/.env*` 除外済み）に追記:

```bash
# backend/.env
SENTRY_DSN=https://xxxxx@oXXXXX.ingest.sentry.io/XXXXX
```

設定後、Dockerコンテナを再起動:

```bash
docker compose down && docker compose up -d
```

### 5-2. 本番環境（Vercel — フロントエンド）

1. Vercelダッシュボード → 対象プロジェクト → **「Settings」** → **「Environment Variables」**
2. 以下を追加:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | (コピーしたDSN) | Production, Preview |

3. **「Save」** をクリック
4. 再デプロイ（Settings → Deployments → 最新のデプロイで「Redeploy」）

### 5-3. 本番環境（Render — バックエンド）

1. Renderダッシュボード → 対象サービス → **「Environment」**
2. 以下を追加:

| Key | Value |
|-----|-------|
| `SENTRY_DSN` | (コピーしたDSN) |

3. **「Save Changes」** をクリック → 自動で再デプロイされます

---

## 6. 動作確認

### 6-1. フロントエンドの確認

ブラウザの開発者ツール（Console）で意図的にエラーを発生させます:

```javascript
// ブラウザのConsoleで実行
throw new Error("Sentry test from RigLab frontend");
```

または、アプリ内で存在しないページにアクセスしてエラーを発生させます。

### 6-2. バックエンドの確認

Railsコンソールからテストメッセージを送信:

```bash
docker compose exec back bundle exec rails runner 'Sentry.capture_message("Sentry test from RigLab backend")'
```

### 6-3. Sentryダッシュボードで確認

1. https://sentry.io にログイン
2. 左メニューの **「Issues」** をクリック
3. 対象プロジェクトを選択
4. 送信したテストエラー/メッセージが表示されていれば成功

> **Note**: イベントが反映されるまで数秒〜1分程度かかる場合があります。

---

## 7. 既存の設定ファイル一覧（参考）

コード側のSentry設定は以下のファイルで完了しています。通常は変更不要です。

### フロントエンド

| ファイル | 役割 |
|---------|------|
| `frontend/instrumentation-client.ts` | クライアントサイドSDK初期化。`NEXT_PUBLIC_SENTRY_DSN` が設定されている場合のみ有効化 |
| `frontend/sentry.server.config.ts` | サーバーサイドSDK初期化。同様にDSNが設定されている場合のみ有効化 |
| `frontend/instrumentation.ts` | Next.js instrumentation hook。`register()` でサーバー設定を読み込み、`onRequestError()` でサーバーサイドエラーをSentryに送信 |
| `frontend/next.config.ts` | `withSentryConfig()` でNext.js設定をラップ。ソースマップのアップロード等を担当 |

### バックエンド

| ファイル | 役割 |
|---------|------|
| `backend/config/initializers/sentry.rb` | Rails起動時のSentry初期化。`SENTRY_DSN` 環境変数が設定されている場合のみ有効化 |
| `backend/Gemfile` | `sentry-ruby` と `sentry-rails` gem を定義 |

### 設定の特徴

- **DSN未設定時はno-op**: 全ての設定ファイルでDSN環境変数の存在チェックを行い、未設定の場合はSentryを初期化しません。これにより、ローカル開発時にDSNなしでも正常に動作します
- **tracesSampleRate**: フロントエンドは `1.0`（全トレース）、バックエンドは `0.5`（50%サンプリング）に設定されています
- **environment**: フロントエンドは `NODE_ENV`、バックエンドは `Rails.env` から自動で設定されます
