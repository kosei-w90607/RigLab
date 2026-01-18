# Plans.md - 実装計画

## 現在のフェーズ

**Phase 2: バックエンドAPI** - コントローラー・サービス実装

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

## Phase 2: バックエンドAPI

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

## Phase 3: フロントエンド基盤

### 3.1 共通コンポーネント

- [x] F-01: frontend/app/layout.tsx
  - 詳細: ルートレイアウト、メタデータ、Provider設定

- [x] F-32: frontend/app/providers.tsx
  - 詳細: SessionProvider、その他Context

- [x] F-02: frontend/app/components/Header.tsx
  - 参照: docs/04_wireframes.md

- [x] F-03: frontend/app/components/Footer.tsx

- [ ] F-04: frontend/app/loading.tsx
  - 詳細: グローバルローディング表示

- [ ] F-05: frontend/app/error.tsx
  - 詳細: エラーバウンダリ

- [ ] F-06: frontend/app/not-found.tsx
  - 詳細: 404ページ

### 3.2 UIコンポーネント

- [ ] F-40: Button コンポーネント
  - パス: frontend/app/components/ui/Button.tsx
  - 参照: docs/04_wireframes.md Section 6

- [ ] F-41: Input コンポーネント
  - パス: frontend/app/components/ui/Input.tsx

- [ ] F-42: Select コンポーネント
  - パス: frontend/app/components/ui/Select.tsx

- [ ] F-43: Card コンポーネント
  - パス: frontend/app/components/ui/Card.tsx

- [ ] F-44: Modal コンポーネント
  - パス: frontend/app/components/ui/Modal.tsx

- [ ] F-45: Skeleton コンポーネント
  - パス: frontend/app/components/ui/Skeleton.tsx

- [ ] F-46: ConfirmDialog コンポーネント
  - パス: frontend/app/components/ui/ConfirmDialog.tsx

- [ ] F-47: Toast コンポーネント
  - パス: frontend/app/components/ui/Toast.tsx

### 3.3 ユーティリティ

- [ ] F-30: frontend/lib/api.ts
  - 詳細: API クライアント（fetch wrapper）

- [ ] F-31: frontend/app/api/auth/[...nextauth]/route.ts
  - 詳細: NextAuth.js設定

- [ ] F-33: frontend/types/index.ts
  - 詳細: 型定義（Part, Build, User等）

- [ ] F-34: frontend/env.d.ts
  - 詳細: 環境変数の型定義

---

## Phase 4: ユーザー向け画面

### 4.1 認証画面

- [ ] F-16: frontend/app/signin/page.tsx
  - 参照: docs/04_wireframes.md

- [ ] F-17: frontend/app/signup/page.tsx

### 4.2 メイン画面

- [ ] F-10: frontend/app/page.tsx
  - 詳細: トップページ

- [ ] F-11: frontend/app/builder/page.tsx
  - 詳細: おまかせ構成入力

- [ ] F-12: frontend/app/builder/result/page.tsx
  - 詳細: おまかせ構成結果

- [ ] F-13: frontend/app/configurator/page.tsx
  - 詳細: カスタム構成

- [ ] F-14: frontend/app/builds/[id]/page.tsx
  - 詳細: 構成詳細

- [ ] F-15: frontend/app/dashboard/page.tsx
  - 詳細: ユーザーダッシュボード

### 4.3 共有機能

- [ ] F-18: frontend/app/share/page.tsx
  - 詳細: 共有構成ページ

- [ ] F-19: frontend/app/share/opengraph-image.tsx
  - 詳細: OG画像動的生成

---

## Phase 5: 管理者画面

- [ ] F-21: frontend/app/admin/layout.tsx
  - 詳細: 管理者用レイアウト

- [ ] F-20: frontend/app/admin/page.tsx
  - 詳細: 管理ダッシュボード

- [ ] F-22: frontend/app/admin/parts/page.tsx
  - 詳細: パーツ一覧

- [ ] F-23: frontend/app/admin/parts/new/page.tsx
  - 詳細: パーツ新規登録

- [ ] F-24: frontend/app/admin/parts/[id]/page.tsx
  - 詳細: パーツ編集

- [ ] F-25: frontend/app/admin/presets/page.tsx
  - 詳細: プリセット一覧

- [ ] F-26: frontend/app/admin/presets/new/page.tsx
  - 詳細: プリセット新規登録

- [ ] F-27: frontend/app/admin/presets/[id]/page.tsx
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
| Phase 3: フロントエンド基盤 | 19 | 4 | 21% |
| Phase 4: ユーザー向け画面 | 11 | 0 | 0% |
| Phase 5: 管理者画面 | 8 | 0 | 0% |
| **合計** | **72** | **38** | **53%** |

---

## 技術的負債（認証システム移行時に解消）

認証システムを **DeviseTokenAuth → NextAuth.js + JWT検証** に移行する際に、以下の項目を修正する。

### TD-001: ApplicationController 認証メソッドエイリアス

**ファイル:** `backend/app/controllers/application_controller.rb`

**現状:**
```ruby
# Deviseのネームスペース付きメソッドを一般的な名前でも使えるようにする
alias_method :authenticate_user!, :authenticate_api_v1_user!
alias_method :current_user, :current_api_v1_user
alias_method :user_signed_in?, :api_v1_user_signed_in?
```

**原因:** DeviseTokenAuthが `namespace :api do namespace :v1 do` 内でマウントされているため、メソッド名が `authenticate_api_v1_user!` になる。本来の仕様（NextAuth.js + JWT検証）では不要。

**移行時の対応:**
1. DeviseTokenAuth関連のgem・設定を削除
2. シンプルなJWT検証ロジックに置き換え
3. このエイリアスを削除し、適切な認証メソッドを実装

---

### TD-002: User モデルの DeviseTokenAuth 依存

**ファイル:** `backend/app/models/user.rb`

**現状:**
```ruby
devise :database_authenticatable, :registerable,
       :recoverable, :rememberable, :validatable, :confirmable
include DeviseTokenAuth::Concerns::User
```

**移行時の対応:**
1. Devise関連の設定を削除
2. パスワードハッシュはbcryptで直接管理（またはNextAuth側で完結）
3. 必要に応じてUsersテーブルのカラム整理

---

### TD-003: routes.rb の DeviseTokenAuth マウント

**ファイル:** `backend/config/routes.rb`

**現状:**
```ruby
mount_devise_token_auth_for 'User', at: 'auth', controllers: {
  registrations: 'api/v1/auth/registrations',
  sessions: 'api/v1/auth/sessions',
  passwords: 'api/v1/auth/passwords'
}
```

**移行時の対応:**
1. このマウントを削除
2. 必要に応じてJWT検証用のエンドポイントを新設
3. 既存の auth コントローラーを削除または書き換え

---

### 移行チェックリスト

- [ ] DeviseTokenAuth gem を削除
- [ ] devise gem を削除（必要に応じて）
- [ ] ApplicationController のエイリアスを削除
- [ ] JWT検証ロジックを実装（`before_action :verify_jwt`等）
- [ ] User モデルから Devise 設定を削除
- [ ] routes.rb から DeviseTokenAuth マウントを削除
- [ ] 認証コントローラー（api/v1/auth/*）を整理
- [ ] フロントエンドに NextAuth.js を導入
- [ ] 全テストが通ることを確認
