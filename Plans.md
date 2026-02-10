# Plans.md - 実装計画

## 現在のフェーズ

**Phase 9: 最終リリース準備 — プリセット充実・サイト説明・ダークモード・ドキュメント整備 ✅ 完了**

---

## 直近の作業サマリー（2026-02-11）

### 完了: 全開発タスク100%完了 — 本番デプロイ待ち

| カテゴリ | 内容 |
|----------|------|
| テーマシステム改善 | darkMode class→data-theme variant変更、管理画面ライトモード固定 |
| ダークモード追加対応 | プライバシー/利用規約、SpecComparison、RankingSection、price-trends各ページ |
| お問い合わせリンク | Googleフォームに変更 |
| REFACTOR-01完了 | 共有URL token統一、OG画像レガシーコード削除（build/個別ID形式を除去） |
| ドキュメント最終更新 | Plans.md 100%達成、docs/09改訂履歴追記、README.md更新 |

### 変更ファイル
- `frontend/tailwind.config.ts` - darkMode: class→data-theme variant
- `frontend/app/providers.tsx` - ThemeProvider attribute='data-theme'
- `frontend/app/admin/layout.tsx` - 管理画面data-theme="light"固定
- `frontend/app/admin/*.tsx` (3files) - ライトモード対応
- `frontend/app/privacy/page.tsx`, `terms/page.tsx` - ダークモード対応
- `frontend/app/components/configurator/SpecComparison/*.tsx` (3files) - dark対応
- `frontend/app/components/home/RankingSection.tsx` - dark対応・メッセージ改善
- `frontend/app/components/Footer.tsx` - お問い合わせリンクGoogleフォーム化
- `frontend/app/share/opengraph-image.tsx` - レガシー共有URL形式削除（token統一）
- `frontend/app/price-trends/**/*.tsx` (3files) - dark対応
- `Plans.md` - 進捗100%、REFACTOR-01完了
- `docs/09_product-review.md` - Phase 9最終調整の改訂履歴追記
- `README.md` - ダークモード・認証方式更新

### テスト結果
- Backend RSpec: 347 examples, 0 failures
- Frontend TypeScript: 型エラーなし

### 次回アクション
- 本番リリースチェックリスト消化（手動デプロイ作業7項目）

### 本番リリースチェックリスト

> コード準備は完了済み。本番運用開始には以下の手動作業が必要。

- [x] **ビルド修正**: rechartsエラー解消（PR #43）
- [x] **セキュリティヘッダー**: next.config.tsに追加済み（PR #43）
- [x] **環境変数テンプレート**: .env.example 再作成済み（PR #43）
- [ ] **Sentry**: アカウント作成→プロジェクト作成→DSN取得→`SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`環境変数設定
- [ ] **CORS**: 本番ドメイン確定→`CORS_ORIGINS`環境変数設定
- [ ] **デプロイ先**: Vercelデプロイ（Root Directory: `frontend`、環境変数設定）
- [ ] **認証シークレット**: 本番用`AUTH_SECRET`生成（`openssl rand -base64 32`）→環境変数設定
- [x] **利用規約/プライバシー**: /terms, /privacy ページの内容作成済み・ダークモード対応完了
- [ ] **本番DB**: 本番DB作成→マイグレーション実行→初期データ投入（`rails db:seed`）
- [ ] **ドメイン**: ドメイン取得→DNS設定→HTTPS確認→`NEXT_PUBLIC_APP_URL`環境変数設定
- [ ] **管理者ユーザー**: 本番環境で管理者ユーザー作成（rails console or seed）

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

- [x] A-13: NextAuth.js v4 → v5 アップグレード
  - 詳細: Auth.js v5 への移行完了（NextAuth()関数形式、handlers.GET/POST、AUTH_SECRET対応）

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

### 6-G: セキュリティ ✅

- [x] G-01: ログイン試行制限（6-J-2 Rack::Attack で実装済み）
- [x] G-02: パスワード要件（User モデル + signup バリデーション確認済み）
- [x] G-03: レート制限（6-J-2 Rack::Attack で実装済み）

---

### 6-H: 追加タスク

- [x] H-01: 新フィルタリングパラメータのテスト追加（parts_spec.rb）
- [x] H-02: recommendations エンドポイントのAPIテスト追加
- [x] H-03: E2Eテスト作成（Playwright）→ 6-J-3 で実装済み

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

### 6-J: v1.0リリース準備 ✅

#### 6-J-1: sign_out エンドポイント実装
- [x] J-01: Api::V1::Auth::SessionsController#destroy 実装
- [x] J-02: routes.rb に DELETE /api/v1/auth/sign_out 追加
- [x] J-03: RSpec テスト追加

#### 6-J-2: セキュリティ強化
- [x] J-04: ログイン試行制限（Rack::Attack 導入、5回失敗で15分ロック）
- [x] J-05: レート制限（API全般に適用）
- [x] J-06: CSPヘッダー設定

#### 6-J-3: E2Eテスト
- [x] J-07: Playwright セットアップ（frontend/e2e/）- 既存
- [x] J-08: おまかせ構成フローE2Eテスト
- [x] J-09: カスタム構成フローE2Eテスト
- [x] J-10: 構成保存・共有フローE2Eテスト

#### 6-J-4: ドキュメント整備
- [x] J-11: README.md 最終更新
- [x] J-12: セットアップガイド最終確認

---

### 6-K: 追加バグ修正

- [x] K-01: BUG-04 メモリーフィルタリング修正 (PR #26)
  - `frontend/lib/api.ts`: APIレスポンスのsnake_case→camelCase変換を追加
  - **原因**: バックエンドは `memory_type` (snake_case) を返すが、フロントエンドは `memoryType` (camelCase) を期待していた
  - **対応**: APIクライアントに `transformKeysToCamelCase` 関数を追加し、全レスポンスを自動変換
  - 既存のフィルタリングロジック（configurator/page.tsx）は正しく実装済み

---

### 6-L: テスト不合格の修正タスク

> 手動テスト（docs/10_manual-test-procedure.md）で Fail となった10項目の修正

- [x] FIX-01: 共有URL問題（高）— share_token経由URLに修正完了。`/share?build=xxx` / `/share?token=xxx` 形式に統一
- [x] FIX-02: 管理画面レスポンシブ対応（中）— ハンバーガートグル+オーバーレイサイドバー、テーブルパディング調整
- [x] FIX-03: Firefoxパーツ登録のカテゴリ固有情報保存不具合（中）— formRef+DOM直接値収集でFirefox対応
- [x] FIX-04: OG画像SNSプレビュー表示問題（中）— opengraph-image.tsxにbuild/tokenパラメータ対応追加、layout.tsxのOG URL修正
- [x] FIX-05: プリセット名が「おすすめ構成 #N」表示になる問題（中）— `{preset.name}` に修正

---

### 6-M: UX改善タスク

> docs/09_product-review.md のUX改善項目から抽出

- [x] UX-T01: alert()→トースト通知 — useToast()に全箇所置換完了
- [x] UX-T02: 管理画面CRUD操作にトースト通知追加 — 全CRUD操作に成功/失敗トースト追加
- [x] UX-T03: パーツ管理フィルタ状態の保持（URL）— useSearchParamsでURL反映・復元
- [x] UX-T04: プリセット編集で合計額リアルタイム表示 — PresetFormに合計金額カード追加
- [x] UX-T05: ハンバーガーメニューのアカウント名を最上部に — ナビリンク前に移動
- [x] UX-T06: 「先頭に戻る」ボタンをユーザー向けページに共通設置 — builder/result, dashboard追加
- [x] UX-T07: ページごとのコンテナ幅設定 — builder max-w-2xl→max-w-3xl統一
- [x] UX-T08: 詳細・編集ページに「戻る」ボタン追加 — builds/[id], configurator(編集モード)
- [x] UX-T09: バリデーションエラー日本語化（rails-i18n）— gem追加、ja.yml作成、locale設定
- [x] UX-T10: プリセット登録時の予算帯警告表示 — 黄色警告バナー表示（保存ブロックなし）

---

### 6.1 設計仕様との突合検証（6-A〜6-E 完了後）

- [x] FR-001: おまかせ構成提案の動作確認 ← コードレベル検証済み
  - PartsRecommendationService の推奨ロジック検証
- [x] FR-002: カスタム構成の動作確認 ← コードレベル検証済み
  - CompatibilityCheckService の互換性チェック検証
- [x] FR-003: 構成保存・管理の動作確認 ← コードレベル検証済み
- [x] FR-004: 構成共有の動作確認 ← コードレベル検証済み
  - share_token 生成・OG画像生成
- [x] FR-005: 認証フローの動作確認 ← コードレベル検証済み
  - サインアップ → サインイン → ログアウト

### 6.2 セキュリティ強化（6-D3 で対応）

- [x] SEC-01: ログイン試行制限の実装確認（5回失敗で15分ロック）← 6-J-2 Rack::Attack で実装済み
- [x] SEC-02: パスワード要件の実装確認（8文字以上、英数字混合）← User モデル + signup バリデーション確認済み
- [x] SEC-03: レート制限の検討・実装 ← 6-J-2 Rack::Attack で実装済み
- [x] SEC-04: セキュリティヘッダー設定（CSP等）← 6-J-2 CSPヘッダー設定済み
- [x] SEC-05: 環境変数・シークレット管理の確認 ← .env.example存在、.gitignoreで除外確認済み

### 6.3 UX/アクセシビリティ改善

- [x] UX-01: 見出し階層（h1〜h3）の実装確認 ← h1統一、h2/h3順序修正済み
- [x] UX-02: aria-label（アイコンボタン）の実装確認 ← dashboard、admin各ページのSVG/ボタン修正済み
- [x] UX-03: フォーカスリングの実装確認 ← Button/Input/Select に focus-visible:ring 確認済み
- [x] UX-04: キーボード操作の動作確認 ← Modal に Escape/role="dialog"/aria-modal 確認済み
- [x] UX-05: エラーメッセージの明確化 ← role="alert" を Input/Select/signin/signup/configurator に追加
- [x] UX-06: Empty State（0件時）の表示確認 ← dashboard/admin/parts/admin/presets/builder-result 確認済み
- [x] UX-07: ローディング状態の表示確認 ← Skeleton コンポーネント活用確認済み

### 6.4 パフォーマンス

- [x] PERF-01: 初回ロード時間の計測（目標: 3秒以内）← 全ページ655ms以内でクリア
- [x] PERF-02: APIレスポンス時間の計測（目標: 500ms以内）← parts 320ms / presets 227ms / builds 49ms でクリア
- [x] PERF-03: DBインデックスの確認・最適化 ← schema.rb で全主要カラムにインデックス確認済み
- [x] PERF-04: バンドルサイズの確認 ← 最小限の依存関係（5 production deps）確認済み

### 6.5 テスト・品質保証（6-E で対応）

- [x] TEST-01: E2Eテスト作成（主要フロー）← 6-J-3 で実装済み
  - おまかせ構成フロー
  - カスタム構成フロー
  - 構成保存・共有フロー
- [x] TEST-02: レスポンシブ実機テスト ← 30項目実施（24 Pass / 6 Fail: 管理画面タブレット・スマホ）
- [x] TEST-03: クロスブラウザテスト ← 15項目実施（14 Pass / 1 Fail: Firefoxパーツ登録）
- [x] TEST-04: Lighthouse監査（アクセシビリティ・パフォーマンス）← 8ページ×4指標=32項目、全基準クリア

### 6.6 運用準備

- [x] OPS-01: シードデータ投入（初期パーツ・プリセット）← 6-D で実装済み
- [x] OPS-02: エラー監視導入（Sentry）← @sentry/nextjs + sentry-rails、DSN未設定時no-op
- [x] OPS-03: 本番環境設定確認（HTTPS、CORS、環境変数）← CORS ENV変数化、.env.example整理、docs/08にチェックリスト追記
- [x] OPS-04: バックアップ戦略の策定 ← docs/08にDB定期バックアップ・復元手順追記
- [x] OPS-05: デプロイ手順の検証 ← docs/08をNext.js向けに最新化

### 6.7 ドキュメント整備

- [x] DOC-00: API設計書と実装の整合性確認・更新（2026-02-01）
- [x] DOC-01: README.md 最終更新 ← 6-J-4 で更新済み
- [x] DOC-02: 利用規約・プライバシーポリシー ← /terms, /privacy ページ作成
- [x] DOC-03: 管理者向け運用マニュアル ← docs/11_admin-manual.md 作成

---

---

## Phase 7: API活用（v1.0リリース前）

> パーツ手入力の工数削減のため、v1.0リリース前に実装する。スクレイピング不採用（利用規約違反・著作権リスク）、公式API活用で合法的に実装する方針。

**ビジョン:**
- Amazon PA-API / 楽天商品検索API等を活用し、パーツ情報の自動取得・更新
- 価格推移グラフの表示（過去N日間の価格変動を可視化）
- 「PC買い時おじさん」の一言コメント（価格トレンドに基づくアドバイス表示）
- TOPページへの買い時情報・人気パーツ掲載

**期待効果:**
- 管理者の手入力工数を大幅削減（パーツ情報の自動取得）
- ユーザーの購買判断を支援（価格推移・買い時アドバイス）
- サイトの再訪率向上（定期的に更新される価格情報）

### 7.1 実装済みタスク

- [x] API-01: Amazon PA-API連携 → 見送り（楽天APIを採用）
- [x] API-02: 楽天商品検索API連携（価格比較）(PR #40)
- [x] API-03: 価格推移データの収集・保存（定期バッチ）(PR #40)
- [x] API-04: 価格推移グラフUI（Recharts）(PR #39)
- [x] API-05: 「PC買い時おじさん」コメント生成ロジック (PR #39)
- [x] API-06: TOPページへの情報掲載UI (PR #40)
- [x] REFACTOR-01: 共有URL 3形式→1形式（token形式）に統一 → v1.0で対応完了
  - 生成側: `lib/share.ts`, `dashboard/page.tsx`, `builds/[id]/page.tsx`, `builder/result/page.tsx`, `configurator/page.tsx` — 全てtoken生成済み
  - 読み取り側: `share/page.tsx` — token読み取りのみ
  - OG画像: `share/opengraph-image.tsx` — レガシー形式（build/個別ID）を削除、token形式のみに統一

---

## Phase 8: TOPページ改善 & 価格分析ページ ✅

> Phase 7で実装した価格分析基盤を活用し、TOPページのUX改善と独立した価格分析ページを構築。

### 8.1 TOPページ改善

- [x] P8-01: BuyNowSection改善（買い時情報の見やすさ向上）
- [x] P8-02: PriceTrendsSection改善（価格動向のビジュアル強化）
- [x] P8-03: RankingSection新規作成（人気パーツランキング表示）

### 8.2 価格分析ページ

- [x] P8-04: /price-trends 一覧ページ（カテゴリ別価格サマリー）
- [x] P8-05: /price-trends/[category] カテゴリ別ページ（パーツ一覧+価格チャート）
- [x] P8-06: /price-trends/[category]/[partId] パーツ詳細ページ（個別価格推移）

### 8.3 バックエンドAPI

- [x] P8-07: PriceTrendsController（価格トレンドAPI）
- [x] P8-08: RankingsController（ランキングAPI）
- [x] P8-09: routes.rb ルーティング追加

### 8.4 テスト・その他

- [x] P8-10: price_trends_spec.rb テスト
- [x] P8-11: rankings_spec.rb テスト
- [x] P8-12: 型定義更新（PriceTrend, RankingPart等）
- [x] P8-13: Header.tsx に価格分析リンク追加

---

## Phase 8.5: UX改善 — 価格分析・ランキング・管理画面検索 ✅

> Phase 8完了後、実際のサイト操作で発覚した5つのUX問題を修正。

### 8.5.1 ランキング品質改善

- [x] P8.5-01: GENRE_IDSマッピング追加（PCパーツ7カテゴリ） (PR #44)
- [x] P8.5-02: ランキングAPIにgenreId送信（美容液等の排除） (PR #44)
- [x] P8.5-03: ランキングカテゴリ4→7に拡張（マザーボード・電源・ケース追加） (PR #44)

### 8.5.2 管理画面検索品質改善

- [x] P8.5-04: 検索APIにgenreIdフィルタ追加 (PR #44)
- [x] P8.5-05: 信頼ショップフィルタリング機能（filter_results, trusted_shop?） (PR #44)
- [x] P8.5-06: カテゴリ自動検出（detect_category + detectedCategoryバッジ） (PR #44)
- [x] P8.5-07: パーツ登録時カテゴリ自動入力 (PR #44)

### 8.5.3 価格分析ページ改善

- [x] P8.5-08: 価格分析ページをカテゴリタブ+パーツテーブルに全面リライト (PR #44)
- [x] P8.5-09: category_detailにdaily_averages追加 (PR #44)

---

## Phase 9: 最終リリース準備 ✅

> プリセット充実・サイト説明セクション・ダークモード対応・ドキュメント全面更新

### 9.1 プリセット充実

- [x] P9-01: コスパ最強エントリーPC追加（entry/gaming: i5-14400 + Arc B580）
- [x] P9-02: 次世代AMDゲーミングPC追加（middle/gaming: Ryzen 7 9800X3D + RTX 5070）
- [x] P9-03: オールAMD構成PC追加（middle/gaming: Ryzen 7 7800X3D + RX 9070 XT）
- [x] P9-04: 4Kゲーミング最強PC追加（high/gaming: Ryzen 9 9900X3D + RTX 5080）
- [x] P9-05: 次世代クリエイターPC追加（high/creative: Ryzen 9 9950X3D + RTX 5090）
- [x] P9-06: コスパ重視オフィスPC追加（entry/office: i5-14400 + 内蔵GPU）

### 9.2 TOPページ改善

- [x] P9-07: 「RigLabとは」サイト説明セクション追加（3カラムグリッド）

### 9.3 ダークモード対応

- [x] P9-08: 基盤セットアップ（next-themes + tailwind darkMode + daisyUI dark）
- [x] P9-09: Headerテーマトグルボタン（太陽/月アイコン）
- [x] P9-10: UIコンポーネントdark化（Card/Button/Input/Select/Modal/Skeleton/Toast/ConfirmDialog/ScrollToTop）
- [x] P9-11: 全ページコンポーネントdark化（~20ファイル）

### 9.4 ドキュメント更新

- [x] P9-12: Amazon PA-API見送り理由記載（docs/09）
- [x] P9-13: Phase 7-8.5成果物をドキュメント反映（docs/02,03,04,05）
- [x] P9-14: Plans.md Phase 9追加・進捗サマリー最終更新

### 9.5 最終調整

- [x] P9-15: テーマシステム改善（class→data-theme variant）
- [x] P9-16: 管理画面ライトモード固定
- [x] P9-17: プライバシー/利用規約ダークモード対応
- [x] P9-18: お問い合わせリンクGoogleフォーム化
- [x] P9-19: SpecComparison/RankingSection dark対応・メッセージ改善

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
| Phase 5.5: 認証統合 | 9 | 9 | 100% ✅ |
| Phase 5: 管理者画面 | 8 | 8 | 100% ✅ |
| Phase 6: プロダクト品質向上 | 31 | 31 | 100% ✅ |
| Phase 6.1-6.7: 品質検証 | 34 | 34 | 100% ✅ |
| Phase 6-L: テスト不合格修正 | 5 | 5 | 100% ✅ |
| Phase 6-M: UX改善 | 10 | 10 | 100% ✅ |
| Phase 7: API活用 | 7 | 7 | 100% ✅ |
| Phase 8: TOPページ改善 & 価格分析 | 13 | 13 | 100% ✅ |
| Phase 8.5: UX改善 | 9 | 9 | 100% ✅ |
| Phase 9: 最終リリース準備 | 19 | 19 | 100% ✅ |
| **合計** | **214** | **214** | **100%** 🎉 |

> 全開発タスク100%完了。本番リリースチェックリスト（手動デプロイ作業）のみ残存。

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
- [x] NextAuth.js v4 → v5 へアップグレード ← Auth.js v5 移行完了
