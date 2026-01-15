# 画面遷移図

## 1. 画面一覧

### 1.1 ユーザー向け画面

| ID | 画面名 | URL | コンポーネント |
|----|--------|-----|---------------|
| S-01 | トップページ | `/` | `page.tsx` |
| S-02 | おまかせ構成 | `/builder` | `page.tsx` |
| S-03 | おまかせ結果 | `/builder/result` | `page.tsx` |
| S-04 | カスタム構成 | `/configurator` | `page.tsx` |
| S-05 | 構成詳細 | `/builds/[id]` | `page.tsx` |
| S-06 | ダッシュボード | `/dashboard` | `page.tsx` |
| S-07 | ログイン | `/signin` | `page.tsx` |
| S-08 | 新規登録 | `/signup` | `page.tsx` |
| S-09 | 共有構成 | `/share` | `page.tsx` + `opengraph-image.tsx` |

### 1.2 管理者向け画面

| ID | 画面名 | URL | コンポーネント |
|----|--------|-----|---------------|
| A-01 | 管理ダッシュボード | `/admin` | `page.tsx` |
| A-02 | パーツ一覧 | `/admin/parts` | `page.tsx` |
| A-03 | パーツ編集 | `/admin/parts/[id]` | `page.tsx` |
| A-04 | プリセット一覧 | `/admin/presets` | `page.tsx` |
| A-05 | プリセット編集 | `/admin/presets/[id]` | `page.tsx` |

---

## 2. 画面遷移図（ユーザー向け）

```mermaid
flowchart TD
    subgraph Public[公開ページ]
        TOP[S-01: Home]
        BUILDER[S-02: Builder]
        BUILDER_RESULT[S-03: BuilderResult]
        CONFIG[S-04: Configurator]
        DETAIL[S-05: BuildDetail]
    end

    subgraph Auth[認証]
        SIGNIN[S-07: SignIn]
        SIGNUP[S-08: SignUp]
    end

    subgraph Private[要ログイン]
        DASH[S-06: Dashboard]
    end

    %% トップページからの遷移
    TOP -->|おまかせで選ぶ| BUILDER
    TOP -->|自分で選ぶ| CONFIG
    TOP -->|ログイン| SIGNIN
    TOP -->|新規登録| SIGNUP

    %% おまかせフロー
    BUILDER -->|条件を入力して検索| BUILDER_RESULT
    BUILDER_RESULT -->|構成を保存| SIGNIN
    BUILDER_RESULT -->|詳細を見る| DETAIL
    BUILDER_RESULT -->|条件を変更| BUILDER

    %% カスタムフロー
    CONFIG -->|構成を保存| SIGNIN
    CONFIG -->|詳細を見る| DETAIL

    %% 認証フロー
    SIGNIN -->|ログイン成功| DASH
    SIGNIN -->|新規登録へ| SIGNUP
    SIGNUP -->|登録成功| SIGNIN

    %% ダッシュボードフロー
    DASH -->|構成を見る| DETAIL
    DASH -->|新しく作る| CONFIG

    %% 詳細ページから
    DETAIL -->|編集する| CONFIG
    DETAIL -->|共有URL発行| DETAIL
```

---

## 3. 画面遷移図（管理者向け）

```mermaid
flowchart TD
    subgraph Admin[管理画面]
        ADMIN_DASH[A-01: AdminDashboard]
        PARTS[A-02: PartsList]
        PARTS_EDIT[A-03: PartsEdit]
        PRESETS[A-04: PresetsList]
        PRESETS_EDIT[A-05: PresetsEdit]
    end

    SIGNIN[SignIn] -->|管理者でログイン| ADMIN_DASH

    ADMIN_DASH -->|パーツ管理| PARTS
    ADMIN_DASH -->|プリセット管理| PRESETS

    PARTS -->|新規登録| PARTS_EDIT
    PARTS -->|編集| PARTS_EDIT
    PARTS_EDIT -->|保存/キャンセル| PARTS

    PRESETS -->|新規登録| PRESETS_EDIT
    PRESETS -->|編集| PRESETS_EDIT
    PRESETS_EDIT -->|保存/キャンセル| PRESETS
```

---

## 4. ユーザーフロー

### 4.1 おまかせ構成フロー（Builder）

```
1. Home（トップページ）
   ↓ 「おまかせで選ぶ」クリック
2. Builder（おまかせ構成）
   ↓ 予算・用途を選択して「検索」
3. BuilderResult（結果ページ）
   ↓ 気に入った構成を「保存」
4. SignIn（未ログイン時）
   ↓ ログイン or 新規登録
5. Dashboard
   → 保存した構成を確認
```

### 4.2 カスタム構成フロー（Configurator）

```
1. Home（トップページ）
   ↓ 「自分で選ぶ」クリック
2. Configurator（カスタム構成）
   ↓ パーツを選択
   ↓ 合計価格を確認
   ↓ 「保存」クリック
3. SignIn（未ログイン時）
   ↓ ログイン or 新規登録
4. Dashboard
   → 保存した構成を確認
```

### 4.3 構成共有フロー（ログイン不要）

```
1. Configurator or BuilderResult or BuildDetail
   ↓ 「共有」または「Xで共有」クリック
2. URLエンコードされた共有URLが生成される
   （例: /share?c=eyJjcHUiOjEsImdwdSI6MTB9）
3. OG画像が動的に生成される（構成リスト表示）
4. Xに投稿 or URLをコピー
5. 第三者がURLにアクセス
   → ログイン不要で構成を閲覧可能
   → OG画像がプレビュー表示される
```

---

## 5. 状態遷移図（認証状態）

```mermaid
stateDiagram-v2
    [*] --> Guest: アクセス

    Guest --> Guest: 構成閲覧
    Guest --> Guest: おまかせ検索
    Guest --> Guest: カスタム作成（保存不可）
    Guest --> Guest: 構成共有（URLエンコード）
    Guest --> LoggingIn: ログイン試行

    LoggingIn --> User: 成功
    LoggingIn --> Guest: 失敗

    User --> User: 構成保存
    User --> User: 構成編集
    User --> User: 構成削除
    User --> User: 構成共有
    User --> Guest: ログアウト

    User --> Admin: 管理者権限あり

    Admin --> Admin: パーツ管理
    Admin --> Admin: おまかせ構成管理
    Admin --> User: 管理画面を離れる
```

---

## 6. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2025-01-12 | 命名規則を更新（SignUp, Builder, Configurator等） |
| 2025-01-15 | Next.js App Router対応、共有構成ページ追加、構成共有フロー更新 |
