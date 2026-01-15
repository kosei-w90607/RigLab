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
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.3 環境変数の設定

Vercelの「Settings」→「Environment Variables」で以下を設定:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| VITE_API_URL | https://api.riglab.app/api/v1 | Production |
| VITE_API_URL | https://staging-api.riglab.app/api/v1 | Preview |

### 2.4 デプロイ

```bash
# mainブランチへのpushで自動デプロイ
git push origin main
```

### 2.5 vercel.json（オプション）

`frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

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

| 変数名 | 値 |
|--------|-----|
| RAILS_ENV | production |
| RACK_ENV | production |
| RAILS_MASTER_KEY | (credentials.yml.encの復号キー) |
| DATABASE_URL | (Renderが自動生成) |
| RAILS_SERVE_STATIC_FILES | true |
| RAILS_LOG_TO_STDOUT | true |

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

- [ ] 全テストがパスしている
- [ ] 環境変数が正しく設定されている
- [ ] CORS設定が本番ドメインを許可している
- [ ] データベースマイグレーションを確認
- [ ] シークレットキーが安全に管理されている

### 7.2 デプロイ後

- [ ] ヘルスチェックエンドポイントが応答する
- [ ] フロントエンドからAPIに接続できる
- [ ] 認証フローが動作する
- [ ] 主要機能が動作する
- [ ] エラーログを監視

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

## 9. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
