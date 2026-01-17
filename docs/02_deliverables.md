# 成果物リスト

プロジェクト完走時に揃っていなければならない全ての成果物一覧。

---

## 1. ドキュメント

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| D-01 | プロジェクトコンセプト | `docs/00_project-concept.md` | ✅ 完了 |
| D-02 | 要件定義書 | `docs/01_requirements.md` | ✅ 完了 |
| D-03 | 成果物リスト | `docs/02_deliverables.md` | ✅ 完了 |
| D-04 | 画面遷移図 | `docs/03_screen-flow.md` | ✅ 完了 |
| D-05 | ワイヤーフレーム | `docs/04_wireframes.md` | ✅ 完了 |
| D-06 | API設計書 | `docs/05_api-design.md` | ✅ 完了 |
| D-07 | データベース設計書 | `docs/06_database-design.md` | ✅ 完了 |
| D-08 | 環境構築手順書 | `docs/07_setup-guide.md` | ✅ 完了 |
| D-09 | デプロイ手順書 | `docs/08_deploy-guide.md` | ✅ 完了 |
| D-10 | README | `README.md` | ✅ 完了 |

---

## 2. フロントエンド（Next.js 15 App Router）

### 2.1 共通コンポーネント

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| F-01 | ルートレイアウト | `frontend/app/layout.tsx` | ⬜ 未着手 |
| F-02 | ヘッダー | `frontend/app/components/Header.tsx` | ⬜ 未着手 |
| F-03 | フッター | `frontend/app/components/Footer.tsx` | ⬜ 未着手 |
| F-04 | ローディング（グローバル） | `frontend/app/loading.tsx` | ⬜ 未着手 |
| F-05 | エラーページ | `frontend/app/error.tsx` | ⬜ 未着手 |
| F-06 | 404ページ | `frontend/app/not-found.tsx` | ⬜ 未着手 |

### 2.2 ユーザー向けページ

| # | 成果物 | URL | ファイルパス | 状態 |
|---|--------|-----|-------------|------|
| F-10 | トップページ | `/` | `frontend/app/page.tsx` | ⬜ 未着手 |
| F-11 | おまかせ構成 | `/builder` | `frontend/app/builder/page.tsx` | ⬜ 未着手 |
| F-12 | おまかせ結果 | `/builder/result` | `frontend/app/builder/result/page.tsx` | ⬜ 未着手 |
| F-13 | カスタム構成 | `/configurator` | `frontend/app/configurator/page.tsx` | ⬜ 未着手 |
| F-14 | 構成詳細 | `/builds/[id]` | `frontend/app/builds/[id]/page.tsx` | ⬜ 未着手 |
| F-15 | ダッシュボード | `/dashboard` | `frontend/app/dashboard/page.tsx` | ⬜ 未着手 |
| F-16 | ログイン | `/signin` | `frontend/app/signin/page.tsx` | ⬜ 未着手 |
| F-17 | 新規登録 | `/signup` | `frontend/app/signup/page.tsx` | ⬜ 未着手 |
| F-18 | 共有構成 | `/share` | `frontend/app/share/page.tsx` | ⬜ 未着手 |
| F-19 | OG画像生成 | `/share` | `frontend/app/share/opengraph-image.tsx` | ⬜ 未着手 |

### 2.3 管理者向けページ

| # | 成果物 | URL | ファイルパス | 状態 |
|---|--------|-----|-------------|------|
| F-20 | 管理ダッシュボード | `/admin` | `frontend/app/admin/page.tsx` | ⬜ 未着手 |
| F-21 | 管理レイアウト | `/admin/*` | `frontend/app/admin/layout.tsx` | ⬜ 未着手 |
| F-22 | パーツ一覧 | `/admin/parts` | `frontend/app/admin/parts/page.tsx` | ⬜ 未着手 |
| F-23 | パーツ新規登録 | `/admin/parts/new` | `frontend/app/admin/parts/new/page.tsx` | ⬜ 未着手 |
| F-24 | パーツ編集 | `/admin/parts/[id]` | `frontend/app/admin/parts/[id]/page.tsx` | ⬜ 未着手 |
| F-25 | プリセット一覧 | `/admin/presets` | `frontend/app/admin/presets/page.tsx` | ⬜ 未着手 |
| F-26 | プリセット新規登録 | `/admin/presets/new` | `frontend/app/admin/presets/new/page.tsx` | ⬜ 未着手 |
| F-27 | プリセット編集 | `/admin/presets/[id]` | `frontend/app/admin/presets/[id]/page.tsx` | ⬜ 未着手 |

### 2.4 機能・ユーティリティ

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| F-30 | API クライアント | `frontend/lib/api.ts` | ⬜ 未着手 |
| F-31 | 認証設定（NextAuth.js） | `frontend/app/api/auth/[...nextauth]/route.ts` | ⬜ 未着手 |
| F-32 | 認証プロバイダー | `frontend/app/providers.tsx` | ⬜ 未着手 |
| F-33 | 型定義 | `frontend/types/index.ts` | ⬜ 未着手 |
| F-34 | 環境変数型定義 | `frontend/env.d.ts` | ⬜ 未着手 |

### 2.5 UIコンポーネント

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| F-40 | ボタン | `frontend/app/components/ui/Button.tsx` | ⬜ 未着手 |
| F-41 | 入力フィールド | `frontend/app/components/ui/Input.tsx` | ⬜ 未着手 |
| F-42 | セレクトボックス | `frontend/app/components/ui/Select.tsx` | ⬜ 未着手 |
| F-43 | カード | `frontend/app/components/ui/Card.tsx` | ⬜ 未着手 |
| F-44 | モーダル | `frontend/app/components/ui/Modal.tsx` | ⬜ 未着手 |
| F-45 | スケルトン | `frontend/app/components/ui/Skeleton.tsx` | ⬜ 未着手 |
| F-46 | 確認ダイアログ | `frontend/app/components/ui/ConfirmDialog.tsx` | ⬜ 未着手 |
| F-47 | トースト通知 | `frontend/app/components/ui/Toast.tsx` | ⬜ 未着手 |

---

## 3. バックエンド（Rails API）

### 3.1 モデル

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| B-01 | User モデル | `backend/app/models/user.rb` | 🔄 既存 |
| B-02 | PartsCpu モデル | `backend/app/models/parts_cpu.rb` | ✅ 完了 |
| B-03 | PartsGpu モデル | `backend/app/models/parts_gpu.rb` | ✅ 完了 |
| B-04 | PartsMemory モデル | `backend/app/models/parts_memory.rb` | ✅ 完了 |
| B-05 | PartsStorage モデル | `backend/app/models/parts_storage.rb` | ✅ 完了 |
| B-06 | PartsOs モデル | `backend/app/models/parts_os.rb` | ✅ 完了 |
| B-07 | PartsMotherboard モデル | `backend/app/models/parts_motherboard.rb` | ✅ 完了 |
| B-08 | PartsPsu モデル | `backend/app/models/parts_psu.rb` | ✅ 完了 |
| B-09 | PartsCase モデル | `backend/app/models/parts_case.rb` | ✅ 完了 |
| B-10 | PcEntrustSet モデル | `backend/app/models/pc_entrust_set.rb` | ✅ 完了 |
| B-11 | PcCustomSet モデル | `backend/app/models/pc_custom_set.rb` | ✅ 完了 |

### 3.2 コントローラー（API）

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| B-20 | 認証コントローラー | `backend/app/controllers/api/v1/auth/*` | 🔄 既存 |
| B-21 | パーツコントローラー | `backend/app/controllers/api/v1/parts_controller.rb` | ✅ 完了 |
| B-22 | おまかせ構成コントローラー | `backend/app/controllers/api/v1/presets_controller.rb` | ✅ 完了 |
| B-23 | カスタム構成コントローラー | `backend/app/controllers/api/v1/builds_controller.rb` | ⬜ 未着手 |

### 3.3 管理者用コントローラー

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| B-30 | 管理パーツコントローラー | `backend/app/controllers/api/v1/admin/parts_controller.rb` | ⬜ 未着手 |
| B-31 | 管理構成コントローラー | `backend/app/controllers/api/v1/admin/presets_controller.rb` | ⬜ 未着手 |

### 3.4 サービス・ロジック

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| B-40 | パーツ推奨サービス | `backend/app/services/parts_recommendation_service.rb` | ⬜ 未着手 |
| B-41 | 互換性チェックサービス | `backend/app/services/compatibility_check_service.rb` | ⬜ 未着手 |

### 3.5 マイグレーション

| # | 成果物 | 説明 | 状態 |
|---|--------|------|------|
| B-50 | users テーブル | ユーザー情報 | 🔄 既存 |
| B-51 | parts_cpus テーブル | CPU パーツ | ✅ 完了 |
| B-52 | parts_gpus テーブル | GPU パーツ | ✅ 完了 |
| B-53 | parts_memories テーブル | メモリ パーツ | ✅ 完了 |
| B-54 | parts_storages テーブル | ストレージ パーツ | ✅ 完了 |
| B-55 | parts_os テーブル | OS | ✅ 完了 |
| B-56 | parts_motherboards テーブル | マザーボード | ✅ 完了 |
| B-57 | parts_psus テーブル | 電源ユニット | ✅ 完了 |
| B-58 | parts_cases テーブル | PCケース | ✅ 完了 |
| B-59 | pc_entrust_sets テーブル | おまかせ構成 | ✅ 完了 |
| B-60 | pc_custom_sets テーブル | カスタム構成 | ✅ 完了 |

### 3.6 テスト

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| B-70 | モデルテスト | `backend/spec/models/` | ✅ 完了 |
| B-71 | コントローラーテスト | `backend/spec/requests/` | ⬜ 未着手 |
| B-72 | サービステスト | `backend/spec/services/` | ⬜ 未着手 |

---

## 4. インフラ・設定

| # | 成果物 | ファイルパス | 状態 |
|---|--------|-------------|------|
| I-01 | Docker Compose | `docker-compose.yml` | ✅ 完了 |
| I-02 | Backend Dockerfile | `backend/Dockerfile` | ✅ 完了 |
| I-03 | Frontend Dockerfile | `frontend/Dockerfile` | ✅ 完了 |
| I-04 | 環境変数サンプル（Backend） | `backend/.env.example` | ✅ 完了 |
| I-05 | 環境変数サンプル（Frontend） | `frontend/.env.example` | ✅ 完了 |
| I-06 | Next.js設定 | `frontend/next.config.ts` | ✅ 完了 |
| I-07 | Tailwind設定 | `frontend/tailwind.config.ts` | ✅ 完了 |
| I-08 | TypeScript設定 | `frontend/tsconfig.json` | ✅ 完了 |

---

## 5. 進捗サマリー

| カテゴリ | 完了 | 未着手 | 合計 |
|----------|------|--------|------|
| ドキュメント | 10 | 0 | 10 |
| フロントエンド | 0 | 34 | 34 |
| バックエンド | 23 | 4 | 27 |
| インフラ | 8 | 0 | 8 |
| **合計** | **41** | **38** | **79** |

---

## 6. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2025-01-12 | ワイヤーフレーム、デプロイ手順書を追加 |
| 2025-01-12 | 命名規則を更新（SignUp, Builder, Configurator等） |
| 2025-01-15 | Next.js App Router構成に全面改訂。UIコンポーネント、サービス層を追加 |
