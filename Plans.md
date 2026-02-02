# Plans.md - 実装計画

## 現在のフェーズ

**Phase 6: プロダクト品質向上** - v1.0リリースに向けたブラッシュアップ

---

## 直近の作業サマリー（2026-02-03）

### 完了: BUG-04 メモリーフィルタリング修正

APIレスポンスの snake_case → camelCase 変換機能を追加し、メモリーフィルタリングが正しく動作するように修正。

| 問題 | 原因 | 対応 |
|------|------|------|
| CPU選択時にメモリーがフィルタリングされない | APIレスポンスが snake_case でフロントエンドが camelCase を期待 | APIクライアントに自動変換を追加 |

### 変更ファイル
- `frontend/lib/api.ts` - `transformKeysToCamelCase` 関数を追加、レスポンス自動変換
- `Plans.md` - K-01 完了マーク

### 次回アクション
Phase 6-J のタスクを順に実行:
1. J-01〜J-03: sign_out エンドポイント実装
2. J-04〜J-06: セキュリティ強化
3. J-07〜J-10: E2Eテスト
4. J-11〜J-12: ドキュメント整備

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

## Phase 6: プロダクト品質向上（v1.0リリース準備）

> 参照: `docs/09_product-review.md`（詳細なチェックリスト）

---

### 6-A: 仕様書更新 ✅

- [x] SPEC-A01: 予算帯の統一
  - `frontend/app/admin/presets/page.tsx`: ミドル「10~20万円」→「10~30万円」
  - `frontend/app/builder/result/page.tsx`: APIマッピング修正（entry/middle/high）
  - `frontend/app/admin/presets/_components/PresetForm.tsx`: 予算帯修正
- [x] SPEC-A02: `docs/01_requirements.md` 更新
  - 互換性フィルタリング仕様の明確化
  - 「選ばせる」UIの要件追加
- [x] SPEC-A03: `docs/09_product-review.md` 更新
  - Phase 6 キックオフ意思決定を記録
  - BUG-03追加、SPEC-01修正完了、バグ認識の訂正

---

### 6-B: バグ修正 ✅

- [x] BUG-FIX-01: ハンバーガーメニュー無反応
  - `frontend/app/components/Header.tsx`: モバイルメニュー開閉機能を実装
- [x] BUG-FIX-02: おまかせ構成の空検索エラー
  - `backend/app/controllers/api/v1/presets_controller.rb`: シリアライズ修正（cpu/gpu/memory/storage1を直接返す）
  - `frontend/app/builder/result/page.tsx`: nullセーフなPartRow実装
  - `frontend/types/index.ts`: PcEntrustSet型をnull許容に修正

---

### 6-C: 互換性フィルタリング実装 ✅

- [x] C-01: バックエンドAPI拡張
  - `backend/app/controllers/api/v1/parts_controller.rb`: フィルタリングパラメータ追加
    - `cpu_socket`: CPUソケットでフィルタリング
    - `memory_type`: メモリタイプでフィルタリング
    - `form_factor`: フォームファクタでフィルタリング
    - `min_gpu_length`: GPU最小長でフィルタリング
- [x] C-02: フロントエンドフィルタリングUI
  - `frontend/app/configurator/page.tsx`: 互換性フィルタリング実装
    - CPU選択後 → マザボ・メモリの選択肢をフィルタリング
    - GPU選択後 → ケースの選択肢をフィルタリング
    - マザボ・電源・ケースの選択UI追加
- [x] C-03: 管理画面の互換性チェック
  - `frontend/app/admin/presets/_components/PresetForm.tsx`: 互換性警告表示
    - CPU-マザボソケット互換性
    - CPU-メモリタイプ互換性
    - GPU-ケースサイズ互換性
    - マザボ-ケースフォームファクタ互換性
    - 電源容量警告

---

### 6-D: Seedデータ整備 ✅

- [x] D-01: プリセットSeedデータ作成
  - `backend/db/seeds.rb`: 9つのプリセット追加
    - エントリー帯（10万円）: ゲーミング/クリエイター/オフィス
    - ミドル帯（25万円）: ゲーミング/クリエイター/オフィス
    - ハイエンド帯（40万円）: ゲーミング/クリエイター/ワークステーション

---

### 6-E: OG画像対応 ✅

- [x] E-01: 共有時のOG画像生成修正
  - `frontend/app/share/opengraph-image.tsx`: APIコールにcategoryパラメータ追加
  - `frontend/app/share/page.tsx`: 同様の修正

---

### 6-F: テストレビュー ✅

- [x] F-01: RSpecファイル全体レビュー
  - **発見事項**:
    - ❌ 新フィルタリングパラメータ（cpu_socket, memory_type, form_factor, min_gpu_length）のテストが未実装
    - ❌ GET /api/v1/parts/recommendations のAPIレベルテストがない
    - ✅ シリアライザ構造は正しい
    - ✅ サービス層テストは良好

---

### 6-G: セキュリティ（後回し）

- [ ] G-01: ログイン試行制限
- [ ] G-02: パスワード要件
- [ ] G-03: レート制限

---

### 6-H: 追加タスク

- [x] H-01: 新フィルタリングパラメータのテスト追加（parts_spec.rb）
- [x] H-02: recommendations エンドポイントのAPIテスト追加
- [ ] H-03: E2Eテスト作成（Playwright）→ 6-J-3 に移行

---

### 6-I: 追加バグ修正・UX改善 ✅

> 参照: Phase 6-2計画

- [x] I-01: 予算帯仕様修正（~10万円→~15万円）
  - `docs/01_requirements.md`: 予算帯定義更新、改訂履歴追記
  - `frontend/app/builder/page.tsx`: ラジオボタンラベル修正
  - `frontend/app/builder/result/page.tsx`: budgetLabels修正
  - `frontend/app/admin/presets/page.tsx`: BUDGET_OPTIONS修正
  - `frontend/app/admin/presets/_components/PresetForm.tsx`: BUDGET_OPTIONS修正
- [x] I-02: 保存ボタン実装
  - `frontend/app/builder/result/page.tsx`: handleSave関数追加（未ログイン→ログインへ、ログイン済み→API保存）
- [x] I-03: 用途タグ表示
  - `frontend/app/builder/result/page.tsx`: PresetCardに用途タグ（紫色バッジ）追加
- [x] I-04: カードUX改善
  - `frontend/app/builder/result/page.tsx`: 「詳細を見る」ボタン削除、構成名をリンク化、ボタン右寄せ
- [x] I-05: Docker seedコマンドのドキュメント化
  - `docs/07_setup-guide.md`: bundle exec付きコマンド追記、コマンド一覧にseed追加

---

### 6-J: v1.0リリース準備

#### 6-J-1: sign_out エンドポイント実装
- [ ] J-01: Api::V1::Auth::SessionsController#destroy 実装
- [ ] J-02: routes.rb に DELETE /api/v1/auth/sign_out 追加
- [ ] J-03: RSpec テスト追加

#### 6-J-2: セキュリティ強化
- [ ] J-04: ログイン試行制限（Rack::Attack 導入、5回失敗で15分ロック）
- [ ] J-05: レート制限（API全般に適用）
- [ ] J-06: CSPヘッダー設定

#### 6-J-3: E2Eテスト
- [ ] J-07: Playwright セットアップ（frontend/e2e/）
- [ ] J-08: おまかせ構成フローE2Eテスト
- [ ] J-09: カスタム構成フローE2Eテスト
- [ ] J-10: 構成保存・共有フローE2Eテスト

#### 6-J-4: ドキュメント整備
- [ ] J-11: README.md 最終更新
- [ ] J-12: セットアップガイド最終確認

---

### 6-K: 追加バグ修正

- [x] K-01: BUG-04 メモリーフィルタリング修正 (PR #26)
  - `frontend/lib/api.ts`: APIレスポンスのsnake_case→camelCase変換を追加
  - **原因**: バックエンドは `memory_type` (snake_case) を返すが、フロントエンドは `memoryType` (camelCase) を期待していた
  - **対応**: APIクライアントに `transformKeysToCamelCase` 関数を追加し、全レスポンスを自動変換
  - 既存のフィルタリングロジック（configurator/page.tsx）は正しく実装済み

---

### 6.1 設計仕様との突合検証（6-A〜6-E 完了後）

- [ ] FR-001: おまかせ構成提案の動作確認
  - PartsRecommendationService の推奨ロジック検証
- [ ] FR-002: カスタム構成の動作確認
  - CompatibilityCheckService の互換性チェック検証
- [ ] FR-003: 構成保存・管理の動作確認
- [ ] FR-004: 構成共有の動作確認
  - share_token 生成・OG画像生成
- [ ] FR-005: 認証フローの動作確認
  - サインアップ → サインイン → ログアウト

### 6.2 セキュリティ強化（6-D3 で対応）

- [ ] SEC-01: ログイン試行制限の実装確認（5回失敗で15分ロック）
- [ ] SEC-02: パスワード要件の実装確認（8文字以上、英数字混合）
- [ ] SEC-03: レート制限の検討・実装
- [ ] SEC-04: セキュリティヘッダー設定（CSP等）
- [ ] SEC-05: 環境変数・シークレット管理の確認

### 6.3 UX/アクセシビリティ改善

- [ ] UX-01: 見出し階層（h1〜h3）の実装確認
- [ ] UX-02: aria-label（アイコンボタン）の実装確認
- [ ] UX-03: フォーカスリングの実装確認
- [ ] UX-04: キーボード操作の動作確認
- [ ] UX-05: エラーメッセージの明確化
- [ ] UX-06: Empty State（0件時）の表示確認
- [ ] UX-07: ローディング状態の表示確認

### 6.4 パフォーマンス

- [ ] PERF-01: 初回ロード時間の計測（目標: 3秒以内）
- [ ] PERF-02: APIレスポンス時間の計測（目標: 500ms以内）
- [ ] PERF-03: DBインデックスの確認・最適化
- [ ] PERF-04: バンドルサイズの確認

### 6.5 テスト・品質保証（6-E で対応）

- [ ] TEST-01: E2Eテスト作成（主要フロー）
  - おまかせ構成フロー
  - カスタム構成フロー
  - 構成保存・共有フロー
- [ ] TEST-02: レスポンシブ実機テスト
- [ ] TEST-03: クロスブラウザテスト
- [ ] TEST-04: Lighthouse監査（アクセシビリティ・パフォーマンス）

### 6.6 運用準備

- [ ] OPS-01: シードデータ投入（初期パーツ・プリセット）
- [ ] OPS-02: エラー監視導入（Sentry等）
- [ ] OPS-03: 本番環境設定確認（HTTPS、CORS、環境変数）
- [ ] OPS-04: バックアップ戦略の策定
- [ ] OPS-05: デプロイ手順の検証

### 6.7 ドキュメント整備

- [x] DOC-00: API設計書と実装の整合性確認・更新（2026-02-01）
- [ ] DOC-01: README.md 最終更新
- [ ] DOC-02: 利用規約・プライバシーポリシー（必要に応じて）
- [ ] DOC-03: 管理者向け運用マニュアル

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
| Phase 6: プロダクト品質向上 | 31 | 18 | 58% |
| **合計** | **111** | **98** | **88%** |

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
