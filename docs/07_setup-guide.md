# 環境構築手順書

## 1. 前提条件

### 1.1 必要なソフトウェア

| ソフトウェア | バージョン | 備考 |
|-------------|-----------|------|
| Docker | 20.10以上 | Docker Desktop推奨 |
| Docker Compose | 2.0以上 | Docker Desktopに同梱 |
| Git | 2.30以上 | - |

### 1.2 推奨環境

- **OS**: macOS / Windows (WSL2) / Linux
- **メモリ**: 8GB以上
- **ディスク**: 10GB以上の空き容量

---

## 2. プロジェクト構成

```
pc_RigLab/
├── backend/          # Rails API (Ruby 3.2.2, Rails 7.1)
├── frontend/         # Next.js 15 App Router (Node.js 21.5.0)
├── docs/             # ドキュメント
├── docker-compose.yml
└── README.md
```

**サービス構成:**

| サービス | ポート | 説明 |
|---------|-------|------|
| front | localhost:3000 | フロントエンド（Next.js） |
| back | localhost:3001 | バックエンドAPI（Rails） |
| db | localhost:3306 | データベース（MySQL 8.0） |

---

## 3. セットアップ手順

### 3.1 リポジトリのクローン

```bash
git clone <repository-url>
cd pc_RigLab
```

### 3.2 環境変数ファイルの作成

**バックエンド用:**
```bash
cp backend/.env.example backend/.env.local
```

`.env.local`の内容例:
```env
# Rails
RAILS_ENV=development
SECRET_KEY_BASE=your_secret_key_base_here

# Database
DATABASE_HOST=db
DATABASE_USERNAME=root
DATABASE_PASSWORD=mysql

# Devise Token Auth
DEVISE_JWT_SECRET_KEY=your_jwt_secret_key_here
```

> **Note**: `.env.example`が存在しない場合は、上記の内容で`backend/.env.local`を直接作成してください。

**フロントエンド用:**
```bash
cp frontend/.env.example frontend/.env.local
```

`.env.local`の内容例:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 3.3 Dockerイメージのビルド

```bash
docker compose build
```

初回ビルドには数分かかります。

### 3.4 コンテナの起動

```bash
docker compose up -d
```

### 3.5 データベースのセットアップ

```bash
# データベースの作成
docker compose exec back rails db:create

# マイグレーションの実行
docker compose exec back rails db:migrate

# シードデータの投入（オプション）
docker compose exec back bundle exec rails db:seed
```

> **Note**: `db:seed`は`bundle exec`を付けて実行してください。シードデータにはサンプルのパーツ、プリセット、ユーザーが含まれます。

### 3.6 動作確認

1. **フロントエンド**: http://localhost:3000 にアクセス
2. **バックエンドAPI**: http://localhost:3001/api/v1/parts にアクセス
3. **データベース**: `mysql -h 127.0.0.1 -P 3306 -u root -pmysql`

---

## 4. 開発時の操作

### 4.1 コンテナの操作

```bash
# コンテナの起動
docker compose up -d

# コンテナの停止
docker compose down

# コンテナの再起動
docker compose restart

# ログの確認
docker compose logs -f          # 全サービス
docker compose logs -f back     # バックエンドのみ
docker compose logs -f front    # フロントエンドのみ
```

### 4.2 Rails コマンドの実行

```bash
# Railsコンソール
docker compose exec back rails c

# マイグレーション
docker compose exec back rails db:migrate

# マイグレーションのロールバック
docker compose exec back rails db:rollback

# ルーティング確認
docker compose exec back rails routes

# テスト実行
docker compose exec back bundle exec rspec
```

### 4.3 フロントエンドの操作

```bash
# パッケージの追加
docker compose exec front npm install <package-name>

# Lintの実行
docker compose exec front npm run lint

# ビルド
docker compose exec front npm run build
```

### 4.4 データベースの操作

```bash
# MySQLクライアントに接続
docker compose exec db mysql -u root -pmysql

# データベースのリセット
docker compose exec back rails db:reset

# SQLを直接実行
docker compose exec db mysql -u root -pmysql app_development -e "SELECT * FROM users;"
```

---

## 5. トラブルシューティング

### 5.1 ポートが使用中の場合

エラー例:
```
Error: Ports are not available: exposing port TCP 0.0.0.0:3001
```

解決策:
```bash
# 使用中のポートを確認
lsof -i :3001

# コンテナを停止して再起動
docker compose down
docker compose up -d
```

### 5.2 データベース接続エラー

エラー例:
```
Mysql2::Error::ConnectionError: Can't connect to MySQL server on 'db'
```

解決策:
```bash
# DBコンテナの状態確認
docker compose ps

# DBコンテナの再起動
docker compose restart db

# 少し待ってからbackを再起動
sleep 5
docker compose restart back
```

### 5.3 Gemのインストールエラー

解決策:
```bash
# コンテナを再ビルド
docker compose build back --no-cache
docker compose up -d
```

### 5.4 node_modulesの問題

解決策:
```bash
# ボリュームを削除して再ビルド
docker compose down -v
docker compose build front --no-cache
docker compose up -d
```

### 5.5 データベースのリセット

```bash
# ボリュームを含めて停止
docker compose down -v

# 再起動＆セットアップ
docker compose up -d
docker compose exec back rails db:create db:migrate db:seed
```

---

## 6. VSCode設定（推奨）

### 6.1 推奨拡張機能

```json
{
  "recommendations": [
    "ms-azuretools.vscode-docker",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "castwide.solargraph",
    "rebornix.ruby"
  ]
}
```

### 6.2 開発サーバーへの接続設定

`.vscode/settings.json`:
```json
{
  "docker.host": "unix:///var/run/docker.sock",
  "ruby.useBundler": true,
  "solargraph.useBundler": true
}
```

---

## 7. よく使うコマンドまとめ

| 操作 | コマンド |
|------|---------|
| 起動 | `docker compose up -d` |
| 停止 | `docker compose down` |
| ログ確認 | `docker compose logs -f` |
| Railsコンソール | `docker compose exec back rails c` |
| DBマイグレーション | `docker compose exec back rails db:migrate` |
| Seedデータ投入 | `docker compose exec back bundle exec rails db:seed` |
| テスト実行 | `docker compose exec back bundle exec rspec` |
| フロント依存追加 | `docker compose exec front npm install <pkg>` |
| 全てリセット | `docker compose down -v && docker compose up -d` |

---

## 8. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2025-01-15 | フロントエンドをNext.js 15 App Routerに変更（Vite→Next.js、環境変数プレフィックスをNEXT_PUBLIC_に変更） |
| 2025-01-15 | ポート番号を標準化（front:3000, back:3001, db:3306） |
| 2026-01-31 | Docker seedコマンドにbundle execを追記、コマンド一覧にseed追加 |
