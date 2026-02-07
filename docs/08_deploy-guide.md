# デプロイ手順書

## 1. 概要

### 1.1 デプロイ構成

RigLabは以下の構成でデプロイすることを想定しています。

| コンポーネント | 推奨サービス | 代替 |
|--------------|-------------|------|
| フロントエンド | Vercel | Netlify, Cloudflare Pages |
| バックエンドAPI | Render | Railway, Fly.io |
| データベース | PlanetScale | Railway MySQL, AWS RDS |

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

## 3. バックエンドのデプロイ（Render）

### 3.1 事前準備

- Renderアカウント作成
- GitHubリポジトリとの連携

### 3.2 データベースの作成

1. Renderダッシュボードで「New」→「PostgreSQL」を選択
   （注: RenderはMySQLをサポートしていないため、PostgreSQLを使用するか、外部のMySQLサービスを使用）
2. 以下の設定:

```
Name: riglab-db
Region: Singapore (または最寄りのリージョン)
PostgreSQL Version: 15
Plan: Free (開発用) / Starter (本番用)
```

### 3.3 Web Serviceの作成

1. 「New」→「Web Service」を選択
2. GitHubリポジトリを接続
3. 以下の設定:

```
Name: riglab-api
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Ruby
Build Command: bundle install && bundle exec rails db:migrate
Start Command: bundle exec puma -C config/puma.rb
Plan: Free (開発用) / Starter (本番用)
```

### 3.4 環境変数の設定

「Environment」タブで以下を設定:

| 変数名 | 値 | 説明 |
|--------|-----|------|
| RAILS_ENV | production | Rails実行環境 |
| RACK_ENV | production | Rack実行環境 |
| RAILS_MASTER_KEY | (credentials.yml.encの復号キー) | Rails暗号化キー |
| DATABASE_URL | (Renderが自動生成) | DB接続文字列 |
| RAILS_SERVE_STATIC_FILES | true | 静的ファイル配信 |
| RAILS_LOG_TO_STDOUT | true | ログ出力先 |
| NEXTAUTH_SECRET | (フロントエンドと同じ値) | JWT検証用共有シークレット |
| CORS_ORIGINS | https://riglab.app,https://www.riglab.app | CORS許可ドメイン |
| SENTRY_DSN | (SentryプロジェクトのDSN) | Sentryエラートラッキング用 |

### 3.5 render.yaml（Blueprint）

`render.yaml`:
```yaml
services:
  - type: web
    name: riglab-api
    runtime: ruby
    region: singapore
    plan: free
    rootDir: backend
    buildCommand: bundle install && bundle exec rails db:migrate
    startCommand: bundle exec puma -C config/puma.rb
    envVars:
      - key: RAILS_ENV
        value: production
      - key: RACK_ENV
        value: production
      - key: RAILS_MASTER_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: riglab-db
          property: connectionString

databases:
  - name: riglab-db
    plan: free
    region: singapore
```

---

## 4. 代替: Railway を使用したデプロイ

### 4.1 メリット

- MySQLをネイティブサポート
- シンプルな設定
- GitHub連携が容易

### 4.2 セットアップ

1. Railway.appでアカウント作成
2. 「New Project」→「Deploy from GitHub repo」を選択
3. バックエンド用サービスを作成

```
Service Name: riglab-api
Root Directory: backend
```

4. MySQLサービスを追加

```
「+ New」→「Database」→「MySQL」
```

### 4.3 環境変数

Railwayは`DATABASE_URL`を自動的に注入します。追加で設定:

| 変数名 | 値 |
|--------|-----|
| RAILS_ENV | production |
| RAILS_MASTER_KEY | (credentials.yml.encの復号キー) |

### 4.4 railway.json

`backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bundle exec rails db:migrate && bundle exec puma -C config/puma.rb",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

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
      expose: ['access-token', 'expiry', 'token-type', 'uid', 'client'],
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

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
- [ ] `INTERNAL_API_URL` - サーバーサイドAPI通信用URL
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

### 9.2 バックアップからの復元

```bash
# SQLファイルからの復元
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> < backup_20250101_030000.sql

# gzip圧縮ファイルからの復元
gunzip < backup_20250101_030000.sql.gz | mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> <DB_NAME>

# Docker環境での復元
docker compose exec -T db mysql -u root -pmysql app_development < backup_20250101_030000.sql
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
| `NEXTAUTH_SECRET` | Yes | セッション暗号化キー | `openssl rand -base64 32` で生成 |
| `INTERNAL_API_URL` | No | サーバーサイドAPI通信用（Docker内部通信等） | `http://back:3000/api/v1` |
| `SENTRY_DSN` | No | Sentryエラートラッキング | `https://xxx@sentry.io/xxx` |

### 10.2 バックエンド（Rails）

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `RAILS_ENV` | Yes | Rails実行環境 | `production` |
| `RACK_ENV` | Yes | Rack実行環境 | `production` |
| `RAILS_MASTER_KEY` | Yes | credentials.yml.enc復号キー | master.keyの内容 |
| `DATABASE_URL` | Yes | DB接続文字列 | `mysql2://user:pass@host/db` |
| `RAILS_SERVE_STATIC_FILES` | No | 静的ファイル配信有効化 | `true` |
| `RAILS_LOG_TO_STDOUT` | No | 標準出力へのログ出力 | `true` |
| `NEXTAUTH_SECRET` | Yes | JWT検証用（フロントエンドと同一値） | フロントエンドと同じ値 |
| `CORS_ORIGINS` | No | CORS許可ドメイン（カンマ区切り） | `https://riglab.app,https://www.riglab.app` |
| `SENTRY_DSN` | No | Sentryエラートラッキング | `https://xxx@sentry.io/xxx` |
| `RAILS_MAX_THREADS` | No | Pumaスレッド数 | `5` |
| `WEB_CONCURRENCY` | No | Pumaワーカー数 | `2` |

---

## 11. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2026-02-07 | Next.js対応に修正、環境変数一覧追加、チェックリスト拡充、バックアップ戦略追加 |
