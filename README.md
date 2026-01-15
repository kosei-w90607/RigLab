# RigLab

PC初心者から自作経験者まで、誰でも簡単にPC構成を作成・比較できるWebアプリケーション。

## 機能

### おまかせ構成（Builder）

予算と用途を選ぶだけで、最適なPC構成を提案します。

- 予算帯: エントリー / ミドル / ハイエンド / ウルトラ
- 用途: ゲーミング / クリエイティブ / オフィス

### カスタム構成（Configurator）

自分でパーツを選んでオリジナルのPC構成を作成できます。

- CPU、GPU、メモリ、ストレージ、OS、その他パーツを自由に選択
- 合計価格の自動計算
- 構成の保存・共有（要ログイン）

## 技術スタック

| 層 | 技術 |
|----|------|
| Frontend | React 18 + Vite + Tailwind CSS + MUI |
| Backend | Ruby on Rails 7.1 (API mode) |
| Database | MySQL 8.0 |
| Authentication | Devise Token Auth |
| Infrastructure | Docker Compose |

## クイックスタート

### 必要条件

- Docker 20.10+
- Docker Compose 2.0+
- Git

### セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd pc_RigLab

# 環境変数ファイルを作成
cp backend/.env.example backend/.env.local

# Dockerコンテナを起動
docker compose up -d

# データベースをセットアップ
docker compose exec back rails db:create db:migrate db:seed
```

### アクセス

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:8080 |
| バックエンドAPI | http://localhost:3030 |

## ドキュメント

| ドキュメント | パス |
|-------------|------|
| プロジェクトコンセプト | [docs/00_project-concept.md](docs/00_project-concept.md) |
| 要件定義書 | [docs/01_requirements.md](docs/01_requirements.md) |
| 成果物リスト | [docs/02_deliverables.md](docs/02_deliverables.md) |
| 画面遷移図 | [docs/03_screen-flow.md](docs/03_screen-flow.md) |
| ワイヤーフレーム | [docs/04_wireframes.md](docs/04_wireframes.md) |
| API設計書 | [docs/05_api-design.md](docs/05_api-design.md) |
| データベース設計書 | [docs/06_database-design.md](docs/06_database-design.md) |
| 環境構築手順書 | [docs/07_setup-guide.md](docs/07_setup-guide.md) |
| デプロイ手順書 | [docs/08_deploy-guide.md](docs/08_deploy-guide.md) |

## 開発

### コマンド一覧

```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f

# Railsコンソール
docker compose exec back rails c

# マイグレーション実行
docker compose exec back rails db:migrate

# テスト実行
docker compose exec back bundle exec rspec
```

詳しくは[環境構築手順書](docs/07_setup-guide.md)を参照してください。

## ライセンス

MIT License
