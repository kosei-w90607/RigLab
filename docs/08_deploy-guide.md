# デプロイ手順書

## 1. 概要

### 1.1 デプロイ構成

RigLabは以下の構成でデプロイすることを想定しています。

| コンポーネント | 推奨サービス | 代替 |
|--------------|-------------|------|
| フロントエンド | Vercel | Netlify, Cloudflare Pages |
| バックエンドAPI | **Render** | Railway, Fly.io |
| データベース | **Render PostgreSQL** | Railway MySQL (dev同等), AWS RDS |

### 1.2 環境一覧

| 環境 | 用途 | URL例 |
|------|------|-------|
| development | ローカル開発 | localhost |
| staging | 検証環境 | staging.riglab.app |
| production | 本番環境 | riglab.app |

---

## 2. フロントエンドのデプロイ（Vercel）

### 2.1 事前準備

- Vercelアカウント作成
- GitHubリポジトリとの連携

### 2.2 プロジェクト設定

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. 以下の設定を行う:

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.3 環境変数の設定

Vercelの「Settings」→「Environment Variables」で以下を設定:

| 変数名 | 値 | 環境 | 説明 |
|--------|-----|------|------|
| NEXT_PUBLIC_API_URL | https://api.riglab.app/api/v1 | Production | クライアント側APIエンドポイント |
| NEXT_PUBLIC_API_URL | https://staging-api.riglab.app/api/v1 | Preview | ステージング用APIエンドポイント |
| NEXT_PUBLIC_APP_URL | https://riglab.app | Production | アプリケーションURL（OGP等で使用） |
| NEXTAUTH_URL | https://riglab.app | Production | NextAuth認証コールバックURL |
| NEXTAUTH_SECRET | (ランダム生成した文字列) | Production | NextAuthセッション暗号化キー |
| AUTH_GOOGLE_ID | (Google OAuthクライアントID) | Production | Google OAuth認証用 |
| AUTH_GOOGLE_SECRET | (Google OAuthクライアントシークレット) | Production | Google OAuth認証用 |
| INTERNAL_API_URL | https://api.riglab.app/api/v1 | Production | サーバーサイドAPI通信用URL |
| SENTRY_DSN | (SentryプロジェクトのDSN) | Production | Sentryエラートラッキング用 |

> **NEXTAUTH_SECRET の生成方法:**
> ```bash
> openssl rand -base64 32
> ```

### 2.4 デプロイ

```bash
# mainブランチへのpushで自動デプロイ
git push origin main
```

### 2.5 vercel.json（オプション）

`frontend/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

> **Note:** Next.jsはApp Routerでルーティングを処理するため、SPA用のrewriteルールは不要です。

---

## 3. バックエンドのデプロイ（Render）— 正式採用

> **Note:** RigLabは本番環境にRenderを採用しています。ローカル開発はMySQL、本番はPostgreSQLのハイブリッド構成です。

### 3.1 事前準備

- Renderアカウント作成（https://render.com — GitHub SSO推奨）
- GitHubリポジトリとの連携

### 3.2 データベースの作成

1. Renderダッシュボードで「New」→「PostgreSQL」を選択
2. 以下の設定:

```
Name: riglab-db
Plan: Free
```

> **注意:** Render Free PostgreSQL は作成後90日でアクセス不可になります。ポートフォリオ用途では再作成で対応してください。

### 3.3 Blueprint デプロイ（推奨）

プロジェクトルートの `render.yaml` を使用して一括デプロイ:

1. Renderダッシュボード → 「New」→「Blueprint」
2. GitHubリポジトリを選択
3. `render.yaml` が自動検出され、Web Service + PostgreSQL が作成される

`render.yaml`:
```yaml
databases:
  - name: riglab-db
    plan: free

services:
  - type: web
    name: riglab-api
    runtime: ruby
    plan: free
    rootDir: backend
    buildCommand: './bin/render-build.sh'
    startCommand: 'bundle exec puma -C config/puma.rb'
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: riglab-db
          property: connectionString
      - key: RAILS_ENV
        value: production
      - key: RACK_ENV
        value: production
      - key: RAILS_SERVE_STATIC_FILES
        value: true
      - key: RAILS_LOG_TO_STDOUT
        value: true
      - key: WEB_CONCURRENCY
        value: 2
      - key: RAILS_MASTER_KEY
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
      - key: CORS_ORIGINS
        sync: false
      - key: SENTRY_DSN
        sync: false
      - key: RAKUTEN_APPLICATION_ID
        sync: false
      - key: RAKUTEN_ACCESS_KEY
        sync: false
      - key: CRON_SECRET
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
```

### 3.4 ビルドスクリプト

`backend/bin/render-build.sh`:
```bash
#!/usr/bin/env bash
set -o errexit

bundle install
bundle exec rails db:migrate
```

> **Note:** Render Free tier では `preDeployCommand` が使用できないため、ビルドスクリプト内でマイグレーションを実行します。

### 3.5 環境変数の設定

Render ダッシュボードの「Environment」タブで以下を手動設定（`sync: false` の項目）:

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `RAILS_MASTER_KEY` | (credentials.yml.encの復号キー) | `cat backend/config/master.key` で確認 |
| `NEXTAUTH_SECRET` | (認証シークレット) | フロントエンドの `AUTH_SECRET` と同じ値 |
| `CORS_ORIGINS` | (Vercel本番URL) | 例: `https://rig-lab.vercel.app` |
| `SENTRY_DSN` | (Sentry DSN) | オプション |
| `RAKUTEN_APPLICATION_ID` | (楽天APIアプリID) | 楽天デベロッパーで取得 |
| `RAKUTEN_ACCESS_KEY` | (楽天APIアクセスキー) | 同上 |
| `CRON_SECRET` | (ランダム文字列) | GitHub Actions価格取得用（GitHub Secretsと同一値） |
| `RESEND_API_KEY` | (ResendのAPIキー) | メール送信（パスワードリセット、メール認証） |
| `FRONTEND_URL` | (Vercel本番URL) | メール内リンク生成用（例: `https://rig-lab.vercel.app`） |

### 3.6 初回デプロイ後のセットアップ（自動実行）

`render-build.sh` に `bundle exec rails db:seed` を組み込み済みのため、**デプロイ時に自動実行**されます。

```bash
# backend/bin/render-build.sh
bundle install
bundle exec rails db:migrate
bundle exec rails db:seed    # べき等（find_or_create_by）なので毎回安全
```

**管理者アカウントの管理:**
- メール: `ENV.fetch('ADMIN_EMAIL', 'admin@example.com')` — Render 環境変数で管理
- パスワード: `ENV.fetch('ADMIN_PASSWORD', 'admin123')` — Render 環境変数で管理
- 本番の値は Render Dashboard → Environment で設定
- 未設定時は開発用デフォルト（`admin@example.com` / `admin123`）が使われる
- 毎デプロイ時に ENV の値にリセットされる（ENV が SSOT）

> **なぜ render-build.sh に seed を組み込んでいるか:**
> Render Free tier では Shell/SSH が使用不可（有料プランのみ）。
> seeds.rb は全レコード `find_or_create_by!` / `find_or_initialize_by` パターンで実装しており、
> 何度実行しても重複データは作られない（べき等）。

### 3.6.1 有料プラン移行時の修正ガイド

有料プラン（Starter以上）に移行すると Shell/SSH が使えるようになるため、以下の修正を推奨:

| # | 修正内容 | ファイル | 詳細 |
|---|---------|---------|------|
| 1 | render-build.sh から db:seed を削除 | `backend/bin/render-build.sh` | Shell で任意タイミング実行可能になる |
| 2 | seeds.rb の ENV 依存を戻す（任意） | `backend/db/seeds.rb` | Shell で直接変更可能 |
| 3 | ADMIN_EMAIL / ADMIN_PASSWORD 環境変数を削除（任意） | Render Dashboard | Shell 操作で代替 |
| 4 | render.yaml のプラン変更 | `render.yaml` | `plan: free` → `plan: starter` 等 |

### 3.7 Sidekiq の制限と GitHub Actions 代替

#### 問題

Render で Sidekiq を動かすには Background Worker サービス + Redis (Key Value Store) が必要だが、**いずれも Free tier では利用不可（有料プランのみ）**。

| 必要なサービス | Render での型 | Free tier |
|--------------|-------------|-----------|
| Background Worker | `type: worker` | **NG** |
| Redis | `type: keyvalue` | **NG** |

#### 現在の代替手段

Sidekiq を通さず、GitHub Actions → HTTP POST → `perform_now`（同期実行）で代替:

```
GitHub Actions (cron: 毎日 JST 3:00)
  → POST /api/v1/cron/price_fetch (Authorization: Bearer CRON_SECRET)
    → PriceFetchAllJob.perform_now
      → PriceFetchJob.perform_now × 全パーツ
```

**必要な設定:**
- **GitHub Secrets**: `RENDER_API_URL`（Render 公開URL）+ `CRON_SECRET`（認証トークン）
- **Render 環境変数**: `CRON_SECRET`（GitHub Secrets と同じ値）
- seeds.rb で60日分のサンプル価格履歴も自動生成される

**関連ファイル:**
| ファイル | 役割 |
|---------|------|
| `.github/workflows/price-fetch.yml` | GitHub Actions cron 定義 |
| `backend/app/controllers/api/v1/cron/price_fetch_controller.rb` | HTTP トリガーエンドポイント |
| `backend/app/jobs/price_fetch_all_job.rb` | 全カテゴリ価格取得ジョブ |
| `backend/app/jobs/price_fetch_job.rb` | 個別パーツ価格取得ジョブ |

#### 3.7.1 有料プラン移行時（Sidekiq 復活手順）

有料プランに切り替えると Background Worker + Redis が利用可能になり、Sidekiq を本来の設計通りに動かせる。

**修正箇所:**

| # | 修正内容 | ファイル |
|---|---------|---------|
| 1 | render.yaml に Redis + Worker サービスを追加 | `render.yaml` |
| 2 | Render 環境変数に `REDIS_URL` を追加 | Render Dashboard |
| 3 | `perform_now` → `perform_later` に戻す | `cron/price_fetch_controller.rb` |
| 4 | GitHub Actions ワークフローを無効化（任意） | `.github/workflows/price-fetch.yml` |

**render.yaml に追加するサービス例:**
```yaml
services:
  - type: keyvalue
    name: riglab-redis
    plan: starter
    maxmemoryPolicy: noeviction
    ipAllowList: []

  - type: worker
    name: riglab-sidekiq
    runtime: ruby
    plan: starter
    rootDir: backend
    buildCommand: bundle install
    startCommand: bundle exec sidekiq
    envVars:
      - key: REDIS_URL
        fromService:
          type: keyvalue
          name: riglab-redis
          property: connectionString
      - key: RAILS_MASTER_KEY
        sync: false
```

> **Note:** 既存の `sidekiq.rb`, `sidekiq_cron.rb`, `sidekiq.yml` は実装済みで休眠中。有料プラン移行時はそのまま利用可能。

---

## 4. 代替: バックエンドのデプロイ（Railway）

> **Note:** RailwayはMySQLをネイティブサポートするため、DB変更なしでデプロイ可能です。ただしRigLabはRenderを正式採用しています。

### 4.1 メリット

- MySQLをネイティブサポート（PlanetScale終了後の最適選択肢）
- シンプルな設定（railway.json で宣言的管理）
- GitHub連携が容易（pushで自動デプロイ）
- `preDeployCommand` でマイグレーション自動実行

### 4.2 セットアップ

1. https://railway.app でアカウント作成（GitHub SSO推奨）
2. 「New Project」→「Deploy from GitHub repo」を選択
3. リポジトリ `kosei-w90607/RigLab` を選択・連携
4. バックエンド用サービスを作成:
   - Root Directory: `backend`
   - ※ `backend/railway.json` が自動検出され、build/deploy設定が適用される
5. MySQLサービスを追加:
   - 「+ New」→「Database」→「Add MySQL」
   - Variables タブで `DATABASE_URL` を参照変数として設定:
     ```
     DATABASE_URL = ${{MySQL.DATABASE_URL}}
     ```

### 4.3 環境変数

Railwayは`DATABASE_URL`を変数参照で自動注入します。追加で以下を設定:

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `RAILS_ENV` | `production` | |
| `RACK_ENV` | `production` | |
| `RAILS_MASTER_KEY` | (credentials.yml.encの復号キー) | `cat backend/config/master.key` で確認 |
| `DATABASE_URL` | `${{MySQL.DATABASE_URL}}` | Railway変数参照 |
| `NEXTAUTH_SECRET` | (認証シークレット) | フロントエンドの `AUTH_SECRET` と同じ値 |
| `CORS_ORIGINS` | (Vercel本番URL) | 例: `https://rig-lab.vercel.app` |
| `SENTRY_DSN` | (Sentry DSN) | オプション |
| `RAKUTEN_APPLICATION_ID` | (楽天APIアプリID) | 楽天デベロッパーで取得 |
| `RAKUTEN_ACCESS_KEY` | (楽天APIアクセスキー) | 同上 |
| `RAILS_SERVE_STATIC_FILES` | `true` | |
| `RAILS_LOG_TO_STDOUT` | `true` | |

### 4.4 railway.json

`backend/railway.json`:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bin/rails server -b :: -p ${PORT:-3000}",
    "preDeployCommand": "bundle exec rails db:prepare"
  }
}
```

- `preDeployCommand`: デプロイ毎にマイグレーション自動実行（`db:prepare` = DB未作成なら作成 + migrate）
- `-b ::`: 全インターフェースにバインド（Railway必須）
- `${PORT:-3000}`: Railwayが`PORT`環境変数を自動注入

### 4.5 初回デプロイ後のセットアップ

Railway Shell で以下を実行:
```bash
bundle exec rails db:seed RAILS_ENV=production
```
※ seeds.rb で管理者ユーザー（admin@example.com）が作成される

---

## 5. 本番環境の設定

### 5.1 CORS設定

`backend/config/initializers/cors.rb`:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://riglab.app', 'https://www.riglab.app'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

> **Note:** JWT認証方式を採用しているため、Devise Token Auth用のexposeヘッダー（`access-token`, `expiry`, `token-type`, `uid`, `client`）は不要です。

> **本番環境でのCORS設定確認:**
> - `origins` に本番ドメインが正しく設定されていること
> - ステージング環境用に別途originsを追加する場合は環境変数 `CORS_ORIGINS` を使用

### 5.2 本番用Puma設定

`backend/config/puma.rb`:
```ruby
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

workers ENV.fetch("WEB_CONCURRENCY") { 2 }

preload_app!

port ENV.fetch("PORT") { 3000 }
environment ENV.fetch("RAILS_ENV") { "development" }

pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

plugin :tmp_restart
```

### 5.3 Assets / Static Files

```ruby
# config/environments/production.rb
config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?
```

---

## 6. CI/CD パイプライン

### 6.1 GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: mysql
          MYSQL_DATABASE: app_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2.2'
          bundler-cache: true
          working-directory: backend

      - name: Run tests
        working-directory: backend
        env:
          RAILS_ENV: test
          DATABASE_URL: mysql2://root:mysql@127.0.0.1:3306/app_test
        run: |
          bundle exec rails db:migrate
          bundle exec rspec

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### 6.2 価格取得ワークフロー

`.github/workflows/price-fetch.yml`:

楽天APIからパーツ価格を定期的に取得するGitHub Actionsワークフローです。

- **スケジュール:** cron で毎日 JST 3:00 に実行
- **認証:** `CRON_SECRET` でエンドポイントを認証（Bearer トークン）
- **エンドポイント:** `POST /api/v1/cron/price_fetch`
- **必要なGitHub Secrets:** `RENDER_API_URL`（Render本番URL）、`CRON_SECRET`（認証トークン、Render環境変数と同じ値）

---

## 7. デプロイチェックリスト

### 7.1 デプロイ前

**テスト・ビルド確認:**
- [ ] 全テストがパスしている（`bundle exec rspec`, `npm run test`）
- [ ] フロントエンドのビルドが成功する（`npm run build`）
- [ ] データベースマイグレーションを確認
- [ ] シークレットキーが安全に管理されている

**環境変数確認（フロントエンド）:**
- [ ] `NEXT_PUBLIC_API_URL` - 本番APIエンドポイント
- [ ] `NEXT_PUBLIC_APP_URL` - 本番アプリケーションURL
- [ ] `NEXTAUTH_URL` - 本番URL（認証コールバック）
- [ ] `NEXTAUTH_SECRET` - ランダム生成された強固なシークレット
- [ ] `AUTH_GOOGLE_ID` - Google OAuthクライアントID（Google認証を利用する場合）
- [ ] `AUTH_GOOGLE_SECRET` - Google OAuthクライアントシークレット（Google認証を利用する場合）
- [ ] `INTERNAL_API_URL` - サーバーサイドAPI通信用URL（必須）
- [ ] `SENTRY_DSN` - Sentryエラートラッキング用（オプション）

**環境変数確認（バックエンド）:**
- [ ] `RAILS_ENV` = production
- [ ] `RACK_ENV` = production
- [ ] `RAILS_MASTER_KEY` - credentials復号キー
- [ ] `DATABASE_URL` - 本番DB接続文字列
- [ ] `RAILS_SERVE_STATIC_FILES` = true
- [ ] `RAILS_LOG_TO_STDOUT` = true
- [ ] `NEXTAUTH_SECRET` - フロントエンドと同一の値
- [ ] `CORS_ORIGINS` - 本番ドメイン
- [ ] `SENTRY_DSN` - Sentryエラートラッキング用（オプション）
- [ ] `RESEND_API_KEY` - Resendメール送信用
- [ ] `FRONTEND_URL` - メール内リンク生成用
- [ ] `CRON_SECRET` - GitHub Actions価格取得認証用

**HTTPS・セキュリティ確認:**
- [ ] HTTPS が有効になっている（Vercel/Render は自動対応）
- [ ] CORS設定が本番ドメインのみを許可している
- [ ] セキュリティヘッダーが設定されている（vercel.json で X-Content-Type-Options, X-Frame-Options 等）
- [ ] Rack::Attack が本番環境で有効になっている（レートリミット動作確認）
- [ ] CSP設定が適切である（API専用のため現在はコメントアウト済み）
- [ ] NEXTAUTH_SECRET が開発用の値ではなく本番用に生成されている

### 7.2 デプロイ後

- [ ] ヘルスチェックエンドポイントが応答する
- [ ] フロントエンドからAPIに接続できる
- [ ] 認証フローが動作する（サインアップ/サインイン/サインアウト）
- [ ] 主要機能が動作する（構成提案、構成ビルダー、共有機能）
- [ ] 管理画面にアクセスできる（admin権限のユーザーで確認）
- [ ] レートリミットが正常に機能する
- [ ] エラーログを監視（Sentry, ログサービス）

### 7.3 ロールバック手順

**Vercel:**
```bash
# 前のデプロイメントにロールバック
vercel rollback <deployment-url>
```

**Render:**
- ダッシュボードの「Manual Deploy」から過去のコミットを選択
- または「Rollback」ボタンをクリック

---

## 8. 監視とログ

### 8.1 ログ確認

**Render:**
```bash
# ログストリーミング
render logs --service riglab-api --tail
```

**Railway:**
```bash
railway logs
```

### 8.2 推奨監視サービス

| サービス | 用途 |
|---------|------|
| Sentry | エラートラッキング |
| LogDNA | ログ管理 |
| UptimeRobot | 死活監視 |

---

## 9. バックアップと復元

### 9.1 データベースバックアップ

#### 手動バックアップ（mysqldump）

```bash
# 本番DBのダンプ取得
mysqldump -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql

# Docker環境でのバックアップ
docker compose exec db mysqldump -u root -pmysql app_development > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮付きバックアップ
mysqldump -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### 自動バックアップ（cron設定例）

```bash
# /etc/cron.d/riglab-backup
# 毎日午前3時にバックアップ実行
0 3 * * * /path/to/backup-script.sh >> /var/log/riglab-backup.log 2>&1
```

`backup-script.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/riglab"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# バックアップ実行
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_DIR/riglab_$DATE.sql.gz"

# 古いバックアップの削除（30日以上前）
find "$BACKUP_DIR" -name "riglab_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$DATE] Backup completed successfully"
```

#### 本番環境バックアップ（PostgreSQL — Render）

```bash
# Render PostgreSQL のバックアップ
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮付き
pg_dump "$DATABASE_URL" | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 9.2 バックアップからの復元

```bash
# SQLファイルからの復元
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> < backup_20250101_030000.sql

# gzip圧縮ファイルからの復元
gunzip < backup_20250101_030000.sql.gz | mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME>

# Docker環境での復元
docker compose exec -T db mysql -u root -pmysql app_development < backup_20250101_030000.sql
```

#### PostgreSQL からの復元

```bash
# SQLファイルからの復元
psql "$DATABASE_URL" < backup_20250101_030000.sql

# gzip圧縮ファイルからの復元
gunzip < backup_20250101_030000.sql.gz | psql "$DATABASE_URL"
```

> **注意:** 復元前に必ず現在のデータをバックアップしてください。復元は既存データを上書きします。

### 9.3 バックアップスケジュール推奨

| 頻度 | 対象 | 保持期間 | 備考 |
|------|------|---------|------|
| 毎日 | フルバックアップ | 30日 | 自動cron実行 |
| 毎週 | フルバックアップ | 90日 | 長期保存用 |
| デプロイ前 | フルバックアップ | 7日 | マイグレーション実行前に必ず取得 |

### 9.4 バックアップの保管

- ローカルサーバーだけでなく、外部ストレージ（AWS S3, Google Cloud Storage等）にも保存を推奨
- バックアップファイルにはアクセス制限を設定し、暗号化を検討
- 定期的にバックアップからの復元テストを実施

---

## 10. 環境変数一覧

### 10.1 フロントエンド（Next.js）

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `NEXT_PUBLIC_API_URL` | Yes | クライアント側APIエンドポイント | `https://api.riglab.app/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Yes | アプリケーションURL（OGP等） | `https://riglab.app` |
| `NEXTAUTH_URL` | Yes | NextAuth認証コールバックURL | `https://riglab.app` |
| `AUTH_SECRET` | Yes | Auth.js v5 セッション暗号化キー | `openssl rand -base64 33` で生成 |
| `AUTH_GOOGLE_ID` | No | Google OAuth クライアントID | Google Cloud Consoleで取得 |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth クライアントシークレット | Google Cloud Consoleで取得 |
| `INTERNAL_API_URL` | Yes | サーバーサイドAPI通信用（Docker内部通信等） | `http://back:3000/api/v1` |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentryエラートラッキング | `https://xxx@sentry.io/xxx` |

> **Note:** `AUTH_SECRET` は Auth.js v5 の正式変数名です。後方互換のため `NEXTAUTH_SECRET` もフォールバックとして動作します。

### 10.2 バックエンド（Rails）

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `RAILS_ENV` | Yes | Rails実行環境 | `production` |
| `RACK_ENV` | Yes | Rack実行環境 | `production` |
| `RAILS_MASTER_KEY` | Yes | credentials.yml.enc復号キー | master.keyの内容 |
| `DATABASE_URL` | Yes | DB接続文字列 | `postgresql://user:pass@host/db` |
| `RAILS_SERVE_STATIC_FILES` | No | 静的ファイル配信有効化 | `true` |
| `RAILS_LOG_TO_STDOUT` | No | 標準出力へのログ出力 | `true` |
| `NEXTAUTH_SECRET` | Yes | JWT検証用（フロントエンドと同一値） | フロントエンドと同じ値 |
| `CORS_ORIGINS` | No | CORS許可ドメイン（カンマ区切り） | `https://riglab.app,https://www.riglab.app` |
| `SENTRY_DSN` | No | Sentryエラートラッキング | `https://xxx@sentry.io/xxx` |
| `RAKUTEN_APPLICATION_ID` | Yes | 楽天API アプリケーションID | `xxxxxxxxxx` |
| `RAKUTEN_ACCESS_KEY` | Yes | 楽天API アクセスキー | `xxxxxxxxxx` |
| `RAKUTEN_ALLOWED_WEBSITE` | No | 楽天API許可ドメイン | デフォルト: `https://rig-lab.vercel.app` |
| `RESEND_API_KEY` | Yes | Resendメール送信API キー | `re_xxxxxxxxxx` |
| `FRONTEND_URL` | Yes | フロントエンドURL（メール内リンク生成用） | `https://rig-lab.vercel.app` |
| `CRON_SECRET` | Yes | GitHub Actions定期実行認証トークン | `openssl rand -base64 32` で生成 |
| `RAILS_MAX_THREADS` | No | Pumaスレッド数 | `5` |
| `WEB_CONCURRENCY` | No | Pumaワーカー数 | `2` |

---

## 11. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2026-02-07 | Next.js対応に修正、環境変数一覧追加、チェックリスト拡充、バックアップ戦略追加 |
| 2026-02-12 | Railway正式採用、railway.json追加、Auth.js v5対応(AUTH_SECRET)、楽天API環境変数追記 |
| 2026-02-12 | Railway→Render正式移行、ハイブリッドDB構成（dev MySQL / prod PostgreSQL）、render.yaml・render-build.sh追加、Sidekiq制限注記、PostgreSQLバックアップ手順追記 |
| 2026-02-18 | CORS exposeヘッダー削除（JWT方式で不要）、RESEND_API_KEY/FRONTEND_URL/AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET/CRON_SECRET追加、price-fetch.ymlワークフロー説明追加 |
