# Plans.md - 実装計画

## 現在のフェーズ

**Phase 10: 認証機能拡張 — パスワードリセット・Google ログイン・メール認証**

---

## 直近の作業サマリー（2026-02-18）

### 完了: Phase 10-B/C 実装、10-D テスト・ドキュメント（PR #73）

- Phase 10-B（メール認証）: 全6タスク完了 — auto-confirm廃止、確認メール送信、verify-emailページ等
- Phase 10-C（Google OAuth）: 全7タスク完了 — social_accounts テーブル、OAuthコールバック、Googleボタン等
- Phase 10-D（統合テスト）: 全4タスク完了 — RSpec認証テスト、E2Eテスト、API設計書更新
- Google OAuth ボタン表示制御: `useGoogleEnabled` hook で Provider 有無に応じた条件描画

### 変更ファイル（PR #73）
- `backend/app/controllers/api/v1/auth/registrations_controller.rb` — auto-confirm廃止
- `backend/app/controllers/api/v1/auth/email_confirmations_controller.rb` — 新規
- `backend/app/controllers/api/v1/auth/oauth_callbacks_controller.rb` — 新規
- `backend/app/controllers/api/v1/auth/sessions_controller.rb` — 未認証チェック追加
- `backend/app/mailers/auth_mailer.rb` — 確認メールテンプレート追加
- `backend/app/views/auth_mailer/email_confirmation.html.erb` — 新規
- `backend/app/views/auth_mailer/email_confirmation.text.erb` — 新規
- `backend/app/models/social_account.rb` — 新規
- `backend/db/migrate/*_create_social_accounts.rb` — 新規
- `backend/spec/requests/api/v1/auth/` — 各controllerテスト追加
- `frontend/app/verify-email/page.tsx` — 新規
- `frontend/app/signin/page.tsx` — Googleボタン・未認証チェック追加
- `frontend/app/signup/page.tsx` — 確認メール送信画面・Googleボタン追加
- `frontend/lib/auth.ts` — Google Provider追加、callback修正
- `frontend/hooks/useGoogleEnabled.ts` — 新規作成
- `frontend/e2e/auth-integration.spec.ts` — E2Eテスト追加
- `docs/05_api-design.md` — 認証API仕様更新

### 次回アクション
- なし（全タスク完了、PR #73 マージ・デプロイ済み）

### 本番リリースチェックリスト

> コード準備は完了済み。本番運用開始には以下の手動作業が必要。

**完了済み:**
- [x] **ビルド修正**: rechartsエラー解消（PR #43）
- [x] **セキュリティヘッダー**: next.config.tsに追加済み（PR #43）
- [x] **環境変数テンプレート**: .env.example 再作成済み
- [x] **利用規約/プライバシー**: /terms, /privacy 作成済み・ダークモード対応完了
- [x] **Sentry（ローカル）**: DSN取得→ローカル環境変数設定 完了（docs/12 §5-1〜5-2完了、§5-3はデプロイ時）
- [x] **.env整理**: frontend/.env→.env.local移行、.env.example追加

## **インフラ構築（順序あり）:**

### Step 1: 認証シークレット生成
- [x] 以下のいずれかで生成（Auth.js v5推奨: 32文字以上のランダム文字列）:
  ```bash
  openssl rand -base64 33
  # または
  npx auth secret
  ```
- [x] 生成した値を安全にメモ（front/backで同じ値を使う）
- [x] 設定先を確認しておく（※実際の設定は Step 4/5 で行う。変数名が異なるので注意）:
  - **Vercel（frontend）**: `AUTH_SECRET` = 生成した値 → Step 5 で設定
  - **Render（backend）**: `NEXTAUTH_SECRET` = 同じ値 → Step 4 で設定

### Step 2: Render アカウント作成・Blueprint デプロイ
- [x] https://render.com でアカウント作成（GitHub SSO推奨）
- [x] 「New」→「Blueprint」を選択
- [x] リポジトリ `kosei-w90607/RigLab` を選択・連携
- [x] `render.yaml` が自動検出され、Web Service（riglab-api）+ PostgreSQL（riglab-db）が作成される

### Step 3: 本番DB（Render PostgreSQL）
- [x] Blueprint デプロイで自動作成（`riglab-db` Free プラン）
- [x] `DATABASE_URL` は render.yaml の `fromDatabase` で自動注入
- [x] render-build.sh に `bundle exec rails db:seed` を追加し、デプロイ時に自動実行（Render Free tier では Shell 不可のため）
  ※ seeds.rb はべき等（find_or_create_by）なので毎回安全
  ※ admin パスワードは `ENV.fetch('ADMIN_PASSWORD', 'admin123')` で管理
- [ ] **注意**: Render Free PostgreSQL は作成後に期限あり → Render Dashboard で期限日を確認し、期限前に再作成で対応

### Step 4: バックエンドデプロイ（Render）
- [x] Blueprint デプロイで自動設定される項目を確認:
  - `render.yaml`: buildCommand → `./bin/render-build.sh`
  - `render.yaml`: startCommand → `bundle exec puma -C config/puma.rb`
  - `DATABASE_URL`: PostgreSQL から自動注入
  - `RAILS_ENV`, `RACK_ENV`: production
  - `RAILS_SERVE_STATIC_FILES`, `RAILS_LOG_TO_STDOUT`, `WEB_CONCURRENCY=2`
- [x] 手動設定が必要な環境変数（Render Dashboard → Environment）:

  | # | 変数名 | 重要度 | 値 | 未設定時の影響 |
  |---|--------|--------|-----|-------------|
  | 1 | `RAILS_MASTER_KEY` | **必須** | `cat backend/config/master.key` の値 | Rails起動失敗 |
  | 2 | `SECRET_KEY_BASE` | **必須** | `openssl rand -hex 64` で生成 | Rails起動失敗 |
  | 3 | `NEXTAUTH_SECRET` | **必須** | Step 1 の値（Vercel AUTH_SECRET と同じ） | JWT認証が動かない |
  | 4 | `CORS_ORIGINS` | **必須** | Vercel発行URL（Step 6 で設定） | フロントからAPI呼べない |
  | 5 | `RAKUTEN_APPLICATION_ID` | **必須** | 楽天デベロッパーで取得したアプリID | 楽天API連携が動かない |
  | 6 | `RAKUTEN_ACCESS_KEY` | **必須** | 楽天デベロッパーで取得したアクセスキー | 同上 |
  | 7 | `CRON_SECRET` | **必須** | ランダム文字列（GitHub Secrets にも同じ値） | 価格取得バッチが認証失敗 |
  | 8 | `SENTRY_DSN` | 任意 | Sentry backend用DSN | エラー監視なし（動作に影響なし） |
  | 9 | `ADMIN_EMAIL` | 任意 | 管理者メールアドレス | デフォルト `admin@example.com` が使われる |

- [x] **RAILS_MASTER_KEY の取得**: credentials再生成済み（master.key紛失のため）。Render に設定する値を取得済み
  ```bash
  # 再生成済み — 以下で値を確認可能
  docker compose exec back cat config/master.key
  ```
- [x] デプロイ → ログで起動成功を確認（Deployed ステータス）
- [x] DB セットアップ: render-build.sh で自動実行（Shell 不要）

### Step 5: フロントエンドデプロイ（Vercel）
- [x] https://vercel.com でアカウント作成（GitHub SSO）
- [x] 「Add New Project」→ リポジトリ選択
- [x] プロジェクト設定:
  - Framework Preset: **Next.js**（自動検出）
  - Root Directory: **frontend**
  - Build Command: `npm run build`
  - Install Command: `npm install`
- [x] 環境変数（Settings → Environment Variables）:

  | # | 変数名 | 重要度 | 設定値 | 未設定時の影響 |
  |---|--------|--------|-------|-------------|
  | 1 | `NEXT_PUBLIC_API_URL` | **必須** | `https://<render-url>/api/v1` | クライアントからAPI呼べない（デフォルト: localhost:3001） |
  | 2 | `INTERNAL_API_URL` | **必須** | `https://<render-url>/api/v1` | SSR・認証が動かない（auth.ts, next.config.ts が参照） |
  | 3 | `AUTH_SECRET` | **必須** | Step 1 の値（**Render NEXTAUTH_SECRET と必ず同じ値**） | **致命的**: 値が異なるとJWT署名/検証不一致で全認証API失敗。デフォルト使用時はJWT偽造も可能 |
  | 4 | `NEXT_PUBLIC_APP_URL` | 推奨 | `https://<vercel-url>` | OGメタデータのURL不正（デフォルト: `riglab.example.com`） |
  | 5 | `NEXTAUTH_URL` | 推奨 | `https://<vercel-url>` | Auth.js v5は自動検出するが明示推奨 |
  | 6 | `NEXT_PUBLIC_SENTRY_DSN` | 任意 | Sentry frontend用DSN | エラー監視なし（動作に影響なし） |

  > **🚨 AUTH_SECRET 重要警告**: `frontend/lib/auth.ts:7` で `AUTH_SECRET || NEXTAUTH_SECRET || 'development-secret-key-for-riglab'` とフォールバックしている。
  > - **AUTH_SECRET は `||` チェーンの最初にあるため、NEXTAUTH_SECRET より優先される**
  > - Vercel に `AUTH_SECRET` と `NEXTAUTH_SECRET` の両方が設定されている場合、`AUTH_SECRET` の値が使われる
  > - **この値が Render の `NEXTAUTH_SECRET` と異なると、JWT署名（Frontend）と検証（Backend）で鍵が一致せず、全認証APIが `JWT::VerificationError` で失敗する**
  > - 必ず **Render の `NEXTAUTH_SECRET` と同一の値** を設定すること

  > **⚠️ INTERNAL_API_URL 必須**: `frontend/lib/auth.ts:6` と `frontend/next.config.ts:6` が参照。未設定時は `localhost:3001` にフォールバックし、**Vercel上でのSSR認証（サインイン）と next.config.ts の rewrites が全て失敗する**。Render公開URLの `/api/v1` パスまで含めて設定すること。

- [x] 「Deploy」→ ビルドログ確認 → デプロイ成功
- [x] Vercel発行URL をメモ（例: `https://rig-lab.vercel.app`）

### Step 6: CORS設定
- [×] Render Dashboard → Environment で `CORS_ORIGINS` を設定:
  ```
  CORS_ORIGINS=https://rig-lab.vercel.app
  ```
  ※ 独自ドメインも使う場合はカンマ区切りで追加
- [×] Render再デプロイ → フロントエンドからAPI接続確認

### Step 6.5: GitHub Secrets 設定（価格取得バッチ用）
- [×] GitHub リポジトリ → Settings → Secrets and variables → Actions で以下を設定:

  | # | 変数名 | 重要度 | 設定値 |
  |---|--------|--------|-------|
  | 1 | `RENDER_API_URL` | **必須** | Render 公開URL（例: `https://riglab-api.onrender.com`）※ `/api/v1` は不要（workflow内で付加） |
  | 2 | `CRON_SECRET` | **必須** | Render に設定した `CRON_SECRET` と同じ値 |

- [ ] 設定後、GitHub Actions で手動テスト実行（手順は下記参照）
- [ ] ジョブログで `${RENDER_API_URL}/api/v1/cron/price_fetch` への POST 成功（HTTP 200）を確認

#### GitHub Actions 手動テスト手順

**前提:** `.yml` ファイルの変更は不要。`workflow_dispatch` が既に定義済みなので GitHub UI から手動実行可能。

**手順:**
1. GitHub リポジトリ（`kosei-w90607/RigLab`）→ **Actions** タブ
2. 左サイドバーの **「Daily Price Fetch」** をクリック
3. 右上の **「Run workflow」** → Branch は **`main`** を選択 → **「Run workflow」** 実行
4. 実行中のジョブをクリック → `Trigger price fetch` ステップのログを確認
5. curl が HTTP 200 を返していれば成功

**失敗時の対処:**

| 症状 | 原因 | 対処 |
|------|------|------|
| `unauthorized` (401) | CRON_SECRET 不一致 | Render と GitHub Secrets の値を再確認 |
| `connection refused` | RENDER_API_URL が間違い | URL を確認（`/api/v1` は不要、workflow が付加） |
| Render がスリープ中 | Free tier コールドスタート | 数分待って再実行、またはブラウザで先にアクセス |

### Step 7: ドメイン設定（任意）
- [ ] 独自ドメインを使う場合のみ
- [ ] Vercel: Settings → Domains → ドメイン追加 → DNS設定
- [ ] Render: Settings → Custom Domains
- [ ] HTTPS は両サービスとも自動対応
- [ ] ドメイン変更後、環境変数を更新:
  - Vercel: `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`
  - Render: `CORS_ORIGINS`

### Step 8: 管理者ユーザー設定
- [x] admin 認証情報は環境変数で管理（Render Dashboard → Environment で設定）
  - `ADMIN_EMAIL`: 管理者メールアドレス（デフォルト: `admin@example.com`）
  - `ADMIN_PASSWORD`: 管理者パスワード（デフォルト: `admin123`）
  - 毎デプロイ時に ENV の値にリセットされる（ENV が SSOT）
  - 変更 = Render Dashboard で環境変数を更新 → 再デプロイ

### Step 9: 動作確認
- [x] TOPページ表示（`https://rig-lab.vercel.app`）
- [x] 認証: サインアップ → サインイン → ログアウト
- [x] おまかせ構成: builder → 予算・用途選択 → 結果表示 → 保存
- [x] カスタム構成: configurator → パーツ選択 → 互換性フィルタ動作 → 保存
- [x] 構成共有: 共有URL生成 → 別ブラウザでアクセス
- [x] 管理画面: /admin → パーツCRUD → プリセットCRUD
- [x] 価格分析: /price-trends → カテゴリ別表示 → 楽天API連携確認
- [ ] Sentryダッシュボードでテストエラーが捕捉されることを確認

> **Sidekiq制限**: Render Free tier では Worker Service を実行できないため、価格取得バッチは GitHub Actions の定期実行で代替しています。`.github/workflows/price-fetch.yml` 参照。GitHub Secrets に `RENDER_API_URL` と `CRON_SECRET` の設定が必要です。

### Render Free tier 制約と対応

**問題:** Render Free tier では Shell/SSH が使用不可。計画時の「Render Shell で db:seed / rails runner を実行」が実行できない。

**解決策:** render-build.sh に `bundle exec rails db:seed` を組み込み + admin 認証情報の ENV 化
- seeds.rb はべき等（`find_or_create_by!` / `find_or_initialize_by`）なので毎デプロイ安全
- admin メール: `ENV.fetch('ADMIN_EMAIL', 'admin@example.com')` — Render 環境変数で管理
- admin パスワード: `ENV.fetch('ADMIN_PASSWORD', 'admin123')` — Render 環境変数で管理

**有料プラン移行時の修正箇所（5点）:**

| # | 修正内容 | ファイル |
|---|---------|---------|
| 1 | render-build.sh から db:seed を削除 | `backend/bin/render-build.sh` |
| 2 | seeds.rb の ENV 依存を戻す（任意） | `backend/db/seeds.rb` |
| 3 | ADMIN_EMAIL / ADMIN_PASSWORD 環境変数を削除（任意） | Render Dashboard |
| 4 | render.yaml のプラン変更 | `render.yaml` |

> 詳細は `docs/08_deploy-guide.md` Step 3.6.1 を参照。

### Sidekiq → GitHub Actions 代替の経緯

**本来の設計:**
- Sidekiq + Redis で価格取得バッチを定期実行（毎日 JST 3:00）
- `sidekiq-cron` gem で `PriceFetchAllJob` をスケジュール実行
- 実装済みファイル: `sidekiq.rb`, `sidekiq_cron.rb`, `sidekiq.yml`, `PriceFetchAllJob`, `PriceFetchJob`

**問題: Render Free tier では Background Worker / Redis が使えない**

Render で Sidekiq を動かすには以下の **3つのサービス** が必要（Context7 / Render公式ドキュメント確認済み）:

| サービス | Render での型 | Free tier | 用途 |
|---------|-------------|-----------|------|
| Web Service | `type: web` | **OK** | Rails API（これは動いている） |
| Background Worker | `type: worker` | **NG（有料のみ）** | `bundle exec sidekiq` を実行 |
| Redis (Key Value) | `type: keyvalue` | **NG（有料のみ）** | Sidekiq のジョブキュー管理 |

→ Free tier では Worker も Redis も作れないため、Sidekiq は一切動かない。

**代替策: GitHub Actions + HTTP エンドポイント**

| 項目 | 内容 |
|------|------|
| ワークフロー | `.github/workflows/price-fetch.yml` |
| スケジュール | `cron: '0 18 * * *'`（UTC 18:00 = JST 3:00） |
| 仕組み | GitHub Actions が `POST /api/v1/cron/price_fetch` を呼ぶ |
| 認証 | `Authorization: Bearer ${CRON_SECRET}` ヘッダーで保護 |
| 実行方法 | `PriceFetchAllJob.perform_now`（Sidekiq キューを通さず同期実行） |
| 必要な Secrets | `RENDER_API_URL`（Render 公開URL）+ `CRON_SECRET`（認証トークン） |

**現在のアーキテクチャ:**
```
GitHub Actions (cron) → HTTP POST → CronController → PriceFetchAllJob.perform_now
                                                       └→ PriceFetchJob.perform_now × N件
```
※ `perform_later` ではなく `perform_now` で同期実行（Redis/Sidekiq 不要）

**関連ファイル一覧:**

| ファイル | 役割 | 現在の状態 |
|---------|------|----------|
| `.github/workflows/price-fetch.yml` | GitHub Actions cron 定義 | **稼働中（代替手段）** |
| `backend/app/controllers/api/v1/cron/price_fetch_controller.rb` | HTTP トリガーエンドポイント | **稼働中** |
| `backend/app/jobs/price_fetch_all_job.rb` | 全カテゴリ価格取得ジョブ | **稼働中（perform_now）** |
| `backend/app/jobs/price_fetch_job.rb` | 個別パーツ価格取得ジョブ | **稼働中（perform_now）** |
| `backend/config/sidekiq.yml` | Sidekiq キュー設定 | 休眠中（Free tier では不使用） |
| `backend/config/initializers/sidekiq.rb` | Sidekiq Redis 接続設定 | 休眠中 |
| `backend/config/initializers/sidekiq_cron.rb` | Sidekiq-cron スケジュール設定 | 休眠中 |
| `backend/Gemfile` | `sidekiq`, `sidekiq-cron` gem | インストール済みだが未使用 |

**有料プラン移行時の修正箇所（Sidekiq 復活）:**

| # | 修正内容 | ファイル / 場所 |
|---|---------|----------------|
| 1 | render.yaml に Redis + Worker サービスを追加 | `render.yaml` |
| 2 | Render 環境変数に `REDIS_URL` を追加 | Render Dashboard |
| 3 | CronController の `perform_now` → `perform_later` に戻す | `cron/price_fetch_controller.rb` |
| 4 | GitHub Actions ワークフローを無効化/削除（任意） | `.github/workflows/price-fetch.yml` |
| 5 | GitHub Secrets（`RENDER_API_URL`, `CRON_SECRET`）を削除（任意） | GitHub Settings |

> **render.yaml に追加するサービス例（有料プラン時）:**
> ```yaml
> services:
>   - type: keyvalue
>     name: riglab-redis
>     plan: starter  # Free tier なし
>     maxmemoryPolicy: noeviction
>     ipAllowList: []
>   - type: worker
>     name: riglab-sidekiq
>     runtime: ruby
>     plan: starter  # Free tier なし
>     rootDir: backend
>     buildCommand: bundle install
>     startCommand: bundle exec sidekiq
>     envVars:
>       - key: REDIS_URL
>         fromService:
>           type: keyvalue
>           name: riglab-redis
>           property: connectionString
>       - key: RAILS_MASTER_KEY
>         sync: false
> ```

### 環境変数検証結果（2026-02-12）

コードが参照する全環境変数を洗い出し、render.yaml / Vercel 設定と突合した結果。

**Render (Backend) — render.yaml で自動設定（確認不要）:**
- `DATABASE_URL`, `RAILS_ENV`, `RACK_ENV`, `RAILS_SERVE_STATIC_FILES`, `RAILS_LOG_TO_STDOUT`, `WEB_CONCURRENCY=2`

**Render (Backend) — 手動設定が必要な8変数:** → Step 4 の表を参照

**Vercel (Frontend) — 設定が必要な6変数:** → Step 5 の表を参照

**GitHub Secrets — 価格取得バッチ用2変数:** → Step 6.5 を参照

**注意点:**
1. **AUTH_SECRET 値不一致問題（致命的）**: Vercel の `AUTH_SECRET` が Render の `NEXTAUTH_SECRET` と異なる値で設定されていた。`auth.ts:7` で `AUTH_SECRET` が `||` チェーンの最初にあるため優先され、Frontend が異なる鍵で JWT を署名 → Backend で `JWT::VerificationError` → 全認証API失敗。**必ず同一の値にすること**
2. **INTERNAL_API_URL 未設定（致命的）**: Vercel に未設定だった。`auth.ts:6` と `next.config.ts:6` が `localhost:3001` にフォールバック → SSR認証・rewrites全失敗。**Render公開URL + `/api/v1` を設定すること**
3. **NEXT_PUBLIC_APP_URL 未設定（推奨）**: `layout.tsx:19` の OG メタデータ URL が `riglab.example.com` になる。Vercel公開URLを設定推奨
4. **RAKUTEN_ALLOWED_WEBSITE**: デフォルト `https://rig-lab.vercel.app`。Vercel URL がこれと異なる場合、楽天APIのリファラー制限で弾かれる可能性あり
5. **PostgreSQL 期限**: Render Dashboard で実際の期限日を確認すること

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

#### 6-J-5: セキュリティ E2Eテスト

- [x] SEC-TEST-01: CSP ヘッダーがレスポンスに含まれることを確認（Playwright e2e）
  - `response.headers()['content-security-policy']` の存在と主要ディレクティブを検証
  - 実装: `frontend/e2e/security.spec.ts`

- [x] SEC-TEST-02: signin/signup で外部 URL の callbackUrl が無視されることを確認（Playwright e2e）
  - `?callbackUrl=https://evil.com` → `/dashboard` にフォールバック
  - `?callbackUrl=//evil.com` → `/dashboard` にフォールバック
  - 実装: `frontend/e2e/security.spec.ts`

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

## Phase 10: 認証機能拡張 — パスワードリセット・Google ログイン・メール認証

> 仕様書: `docs/13_auth-enhancement-spec.md`

### 10-A: メール基盤 + パスワードリセット

- [x] A-01: Resend gem 追加 + ActionMailer 設定
- [x] A-02: `AuthMailer` 作成（パスワードリセットメール）
- [x] A-03: `PasswordResetsController` 実装（forgot + reset）
- [x] A-04: User モデルにトークン生成/検証メソッド追加
- [x] A-05: `/forgot-password` ページ作成
- [x] A-06: `/reset-password` ページ作成
- [x] A-07: `/signin` に「パスワードを忘れた方」リンク追加
- [x] A-08: Rate limit 追加（パスワードリセット用）

### 10-B: メール認証

- [x] B-01: 登録フロー変更（auto-confirm 廃止 → 確認メール送信）(PR #73)
- [x] B-02: `AuthMailer` に確認メールテンプレート追加 (PR #73)
- [x] B-03: `EmailConfirmationsController` 実装（verify + resend）(PR #73)
- [x] B-04: `/verify-email` ページ作成 (PR #73)
- [x] B-05: `/signup` 成功画面を「確認メール送信済み」に変更 (PR #73)
- [x] B-06: ログイン時の未認証チェック + 再送リンク (PR #73)

### 10-C: Google ログイン + アカウントリンク

- [x] C-01: `social_accounts` テーブル作成（migration）(PR #73)
- [x] C-02: `SocialAccount` モデル作成 (PR #73)
- [x] C-03: `OauthCallbacksController` 実装 (PR #73)
- [x] C-04: NextAuth に Google Provider 追加 (PR #73)
- [x] C-05: `signIn` / `jwt` callback 修正 (PR #73)
- [x] C-06: `/signin`, `/signup` に Google ボタン追加 (PR #73)
- [x] C-07: アカウントリンクロジック実装 (PR #73)

### 10-D: 統合テスト + 仕上げ

- [x] D-01: RSpec: 各 controller のテスト (PR #73)
- [x] D-02: E2E: 主要フローの動作確認 (PR #73)
- [x] D-03: letter_opener_web でメール表示確認（dev）
- [x] D-04: 本番環境変数ドキュメント更新 (PR #73)

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
| Phase 10: 認証機能拡張 | 25 | 25 | 100% ✅ |
| **合計** | **239** | **239** | **100% ✅** |

> 全フェーズ完了。

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
