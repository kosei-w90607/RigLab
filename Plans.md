# Plans.md - 実装計画

## 現在のフェーズ

**全フェーズ完了** 🎉 - プロジェクト基本機能実装完了

---

## Phase 0: 環境整備 ✅

### 完了済み
- [x] harness-init によるワークフローファイル導入
- [x] I-04: backend/.env.example 作成 (PR #7)
- [x] I-05: frontend/.env.example 作成 (PR #7)
- [x] I-06: frontend/next.config.ts 設定 (PR #7)
- [x] I-07: frontend/tailwind.config.ts 設定 (PR #7)
- [x] I-08: frontend/tsconfig.json 確認・調整 (PR #7)

---

## Phase 1: バックエンド基盤（モデル・マイグレーション） ✅

### 1.1 パーツテーブル

- [x] B-51: parts_cpus マイグレーション作成 (PR #8)
- [x] B-02: PartsCpu モデル実装 (PR #8)
- [x] B-52: parts_gpus マイグレーション作成 (PR #8)
- [x] B-03: PartsGpu モデル実装 (PR #8)
- [x] B-53: parts_memories マイグレーション作成 (PR #8)
- [x] B-04: PartsMemory モデル実装 (PR #8)
- [x] B-54: parts_storages マイグレーション作成 (PR #8)
- [x] B-05: PartsStorage モデル実装 (PR #8)
- [x] B-55: parts_os マイグレーション作成 (PR #8)
- [x] B-06: PartsOs モデル実装 (PR #8)
- [x] B-56: parts_motherboards マイグレーション作成 (PR #8)
- [x] B-07: PartsMotherboard モデル実装 (PR #8)
- [x] B-57: parts_psus マイグレーション作成 (PR #8)
- [x] B-08: PartsPsu モデル実装 (PR #8)
- [x] B-58: parts_cases マイグレーション作成 (PR #8)
- [x] B-09: PartsCase モデル実装 (PR #8)

### 1.2 構成テーブル

- [x] B-59: pc_entrust_sets マイグレーション作成 (PR #8)
- [x] B-10: PcEntrustSet モデル実装 (PR #8)
- [x] B-60: pc_custom_sets マイグレーション作成 (PR #8)
- [x] B-11: PcCustomSet モデル実装 (PR #8)

---

## Phase 2: バックエンドAPI ✅

### 2.1 パーツAPI

- [x] B-21: Api::V1::PartsController 実装 (PR #10)
  - テスト: spec/requests/api/v1/parts_spec.rb
  - エンドポイント: GET /api/v1/parts, /api/v1/parts/:id

### 2.2 おまかせ構成API

- [x] B-22: Api::V1::PresetsController 実装 (PR #10)
  - テスト: spec/requests/api/v1/presets_spec.rb
  - エンドポイント: GET /api/v1/presets, GET /api/v1/presets/:id

- [x] B-40: PartsRecommendationService 実装 (PR #11)
  - テスト: spec/services/parts_recommendation_service_spec.rb
  - 詳細: 予算・用途に基づくパーツ推奨ロジック

### 2.3 カスタム構成API

- [x] B-23: Api::V1::BuildsController 実装 (PR #12)
  - テスト: spec/requests/api/v1/builds_spec.rb
  - エンドポイント: CRUD /api/v1/builds, GET /api/v1/builds/shared/:share_token

- [x] B-41: CompatibilityCheckService 実装 (PR #13)
  - テスト: spec/services/compatibility_check_service_spec.rb
  - 詳細: パーツ互換性チェックロジック（CPU/メモリ/マザーボード/GPU/ケースの互換性）

### 2.4 管理者API

- [x] B-30: Api::V1::Admin::PartsController 実装 (PR #14)
  - テスト: spec/requests/api/v1/admin/parts_spec.rb (15 tests)
  - エンドポイント: CRUD（管理者認証必須）
  - 追加: ユーザーにroleカラム追加（user/admin）

- [x] B-31: Api::V1::Admin::PresetsController 実装 (PR #14)
  - テスト: spec/requests/api/v1/admin/presets_spec.rb (14 tests)

---

## Phase 3: フロントエンド基盤 ✅

### 3.1 共通コンポーネント

- [x] F-01: frontend/app/layout.tsx
  - 詳細: ルートレイアウト、メタデータ、Provider設定

- [x] F-32: frontend/app/providers.tsx
  - 詳細: SessionProvider、その他Context

- [x] F-02: frontend/app/components/Header.tsx
  - 参照: docs/04_wireframes.md

- [x] F-03: frontend/app/components/Footer.tsx

- [x] F-04: frontend/app/loading.tsx
  - 詳細: グローバルローディング表示

- [x] F-05: frontend/app/error.tsx
  - 詳細: エラーバウンダリ

- [x] F-06: frontend/app/not-found.tsx
  - 詳細: 404ページ

### 3.2 UIコンポーネント

- [x] F-40: Button コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Button.tsx
  - 参照: docs/04_wireframes.md Section 6

- [x] F-41: Input コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Input.tsx

- [x] F-42: Select コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Select.tsx

- [x] F-43: Card コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Card.tsx

- [x] F-44: Modal コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Modal.tsx

- [x] F-45: Skeleton コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Skeleton.tsx

- [x] F-46: ConfirmDialog コンポーネント (PR #17)
  - パス: frontend/app/components/ui/ConfirmDialog.tsx

- [x] F-47: Toast コンポーネント (PR #17)
  - パス: frontend/app/components/ui/Toast.tsx

### 3.3 ユーティリティ

- [x] F-30: frontend/lib/api.ts (PR #18)
  - 詳細: API クライアント（fetch wrapper）

- [x] F-31: frontend/app/api/auth/[...nextauth]/route.ts (PR #18)
  - 詳細: NextAuth.js設定

- [x] F-33: frontend/types/index.ts (PR #18)
  - 詳細: 型定義（Part, Build, User等）

- [x] F-34: frontend/env.d.ts (PR #18)
  - 詳細: 環境変数の型定義

---

## Phase 4: ユーザー向け画面 ✅

### 4.1 認証画面

- [x] F-16: frontend/app/signin/page.tsx (PR #19, #20)
  - 参照: docs/04_wireframes.md

- [x] F-17: frontend/app/signup/page.tsx (PR #19, #20)

### 4.2 メイン画面

- [x] F-10: frontend/app/page.tsx (PR #19)
  - 詳細: トップページ

- [x] F-11: frontend/app/builder/page.tsx (PR #19)
  - 詳細: おまかせ構成入力

- [x] F-12: frontend/app/builder/result/page.tsx (PR #19)
  - 詳細: おまかせ構成結果

- [x] F-13: frontend/app/configurator/page.tsx (PR #19)
  - 詳細: カスタム構成

- [x] F-14: frontend/app/builds/[id]/page.tsx (PR #19)
  - 詳細: 構成詳細

- [x] F-15: frontend/app/dashboard/page.tsx (PR #19)
  - 詳細: ユーザーダッシュボード

### 4.3 共有機能

- [x] F-18: frontend/app/share/page.tsx (PR #19)
  - 詳細: 共有構成ページ

- [x] F-19: frontend/app/share/opengraph-image.tsx (PR #19)
  - 詳細: OG画像動的生成

---

## Phase 5.5: 認証統合（DeviseTokenAuth → NextAuth.js + JWT）✅

### 5.5.1 バックエンド

- [x] A-01: JwtAuthenticatable concern作成 (PR #20)
  - パス: backend/app/controllers/concerns/jwt_authenticatable.rb
  - 詳細: JWT検証、authenticate_user!、require_admin!メソッド
- [x] A-02: ApplicationController 認証メソッド置換 (PR #20)
- [x] A-03: User モデルから Devise 依存削除 (PR #20)
- [x] A-04: routes.rb から DeviseTokenAuth 削除 (PR #20)
- [x] A-05: Gemfile から DeviseTokenAuth/Devise 削除 (PR #20)

### 5.5.2 フロントエンド

- [x] A-10: NextAuth.js CredentialsProvider 実装 (PR #20)
  - パス: frontend/lib/auth.ts
- [x] A-11: サインインページ API連携 (PR #20)
  - パス: frontend/app/signin/page.tsx
- [x] A-12: サインアップページ API連携 (PR #20)
  - パス: frontend/app/signup/page.tsx

### 5.5.3 将来課題

- [ ] A-13: NextAuth.js v4 → v5 アップグレード
  - 詳細: Auth.js への移行（オプション）

---

## Phase 5: 管理者画面 ✅

- [x] F-21: frontend/app/admin/layout.tsx (PR #22)
  - 詳細: 管理者用レイアウト（認証チェック・サイドバー・ヘッダー）

- [x] F-20: frontend/app/admin/page.tsx (PR #22)
  - 詳細: 管理ダッシュボード（統計表示・クイックアクション）

- [x] F-22: frontend/app/admin/parts/page.tsx (PR #22)
  - 詳細: パーツ一覧（カテゴリフィルター・ページネーション・削除）

- [x] F-23: frontend/app/admin/parts/new/page.tsx (PR #22)
  - 詳細: パーツ新規登録（カテゴリ別フォームフィールド）

- [x] F-24: frontend/app/admin/parts/[id]/page.tsx (PR #22)
  - 詳細: パーツ編集

- [x] F-25: frontend/app/admin/presets/page.tsx (PR #22)
  - 詳細: プリセット一覧（予算帯・用途フィルター・ページネーション）

- [x] F-26: frontend/app/admin/presets/new/page.tsx (PR #22)
  - 詳細: プリセット新規登録（パーツ選択）

- [x] F-27: frontend/app/admin/presets/[id]/page.tsx (PR #22)
  - 詳細: プリセット編集

---

## TDD ワークフロー

「go」と言うと、次の未完了タスクのテストを書き、実装します。

1. **Red**: テストを書く（失敗する）
2. **Green**: 最小限のコードで通す
3. **Refactor**: リファクタリング
4. **Commit**: 構造/振る舞いを分離してコミット

## コマンド

| コマンド | 説明 |
|----------|------|
| `go` | 次のタスクを実装 |
| `/work` | タスクを実行 |
| `/commit` | 変更をコミット |
| `/sync-status` | 進捗確認・Plans.md更新 |

---

## 進捗サマリー

| フェーズ | タスク数 | 完了 | 進捗率 |
|----------|---------|------|--------|
| Phase 0: 環境整備 | 6 | 6 | 100% ✅ |
| Phase 1: バックエンド基盤 | 20 | 20 | 100% ✅ |
| Phase 2: バックエンドAPI | 8 | 8 | 100% ✅ |
| Phase 3: フロントエンド基盤 | 19 | 19 | 100% ✅ |
| Phase 4: ユーザー向け画面 | 11 | 11 | 100% ✅ |
| Phase 5.5: 認証統合 | 8 | 8 | 100% ✅ |
| Phase 5: 管理者画面 | 8 | 8 | 100% ✅ |
| **合計** | **80** | **80** | **100%** 🎉 |

---

## 技術的負債（Phase 5.5 で解消済み）✅

認証システムを **DeviseTokenAuth → NextAuth.js + JWT検証** に移行完了。

### 移行チェックリスト

- [x] DeviseTokenAuth gem を削除 (PR #20)
- [x] devise gem を削除 (PR #20)
- [x] ApplicationController のエイリアスを削除 (PR #20)
- [x] JWT検証ロジックを実装（JwtAuthenticatable concern） (PR #20)
- [x] User モデルから Devise 設定を削除 (PR #20)
- [x] routes.rb から DeviseTokenAuth マウントを削除 (PR #20)
- [x] 認証コントローラー（api/v1/auth/*）を整理 (PR #20)
- [x] フロントエンドに NextAuth.js を導入 (PR #18, #20)
- [ ] NextAuth.js v4 → v5 へアップグレード（将来課題）
