# API設計書

## 1. 概要

### 1.1 基本情報

| 項目 | 値 |
|------|-----|
| ベースURL | `/api/v1` |
| 認証方式 | JWT (Bearer Token) |
| フォーマット | JSON |
| 文字コード | UTF-8 |

### 1.2 共通ヘッダー

**リクエスト:**
```
Content-Type: application/json
Authorization: Bearer <token>  # 認証が必要なエンドポイント
```

**レスポンス:**
```
Content-Type: application/json
```

### 1.3 共通レスポンス形式

**成功時:**
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}
```

**エラー時:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      { "field": "email", "message": "は不正な形式です" }
    ]
  }
}
```

### 1.4 HTTPステータスコード

| コード | 意味 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 削除成功 |
| 400 | リクエスト不正 |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソース未発見 |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |

---

## 2. 認証 API

### 2.1 ユーザー登録

```
POST /api/v1/auth
```

**リクエスト:**
```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**レスポンス (201):**
```json
{
  "data": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com"
  }
}
```

### 2.2 ログイン

```
POST /api/v1/auth/sign_in
```

**リクエスト:**
```json
{
  "email": "yamada@example.com",
  "password": "password123"
}
```

**レスポンス (200):**
```json
{
  "data": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "user"
  }
}
```

**レスポンスヘッダー:**
```
access-token: xxxxx
client: xxxxx
uid: yamada@example.com
```

### 2.3 ログアウト

```
DELETE /api/v1/auth/sign_out
```

**レスポンス (200):**
```json
{
  "message": "ログアウトしました"
}
```

### 2.4 現在のユーザー取得

```
GET /api/v1/auth/validate_token
```

**レスポンス (200):**
```json
{
  "data": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "user"
  }
}
```

---

## 3. パーツ API

### 3.1 パーツ一覧取得

```
GET /api/v1/parts
```

**クエリパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| category | string | カテゴリ (cpu, gpu, memory, storage, os, other) |
| keyword | string | 検索キーワード |
| min_price | integer | 最小価格 |
| max_price | integer | 最大価格 |
| page | integer | ページ番号 |
| per_page | integer | 1ページあたり件数 (default: 20) |

**レスポンス (200):**
```json
{
  "data": [
    {
      "id": 1,
      "category": "cpu",
      "name": "Intel Core i7-14700K",
      "maker": "Intel",
      "price": 52000,
      "specs": {
        "cores": 20,
        "threads": 28,
        "base_clock": "3.4GHz"
      }
    },
    {
      "id": 2,
      "category": "cpu",
      "name": "AMD Ryzen 7 7800X3D",
      "maker": "AMD",
      "price": 58000,
      "specs": {
        "cores": 8,
        "threads": 16,
        "base_clock": "4.2GHz"
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20
  }
}
```

### 3.2 パーツ詳細取得

```
GET /api/v1/parts/:id
```

**レスポンス (200):**
```json
{
  "data": {
    "id": 1,
    "category": "cpu",
    "name": "Intel Core i7-14700K",
    "maker": "Intel",
    "price": 52000,
    "specs": {
      "cores": 20,
      "threads": 28,
      "base_clock": "3.4GHz",
      "boost_clock": "5.6GHz",
      "tdp": "125W"
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-10T00:00:00Z"
  }
}
```

---

## 4. プリセット（おまかせ構成）API

### 4.1 プリセット検索

```
GET /api/v1/presets
```

**クエリパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| budget | string | 予算帯 (entry, middle, high) |
| use_case | string | 用途 (gaming, creative, office) |

**レスポンス (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "ゲーミングPC ミドルスペック",
      "budget_range": "middle",
      "use_case": "gaming",
      "total_price": 189800,
      "parts": [
        {
          "category": "cpu",
          "part": {
            "id": 5,
            "name": "Intel Core i5-14400F",
            "price": 28800
          }
        },
        {
          "category": "gpu",
          "part": {
            "id": 12,
            "name": "RTX 4060 Ti",
            "price": 58000
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "per_page": 20
  }
}
```

### 4.2 プリセット詳細取得

```
GET /api/v1/presets/:id
```

**レスポンス (200):**
```json
{
  "data": {
    "id": 1,
    "name": "ゲーミングPC ミドルスペック",
    "description": "FPSゲームを快適にプレイできるミドルスペック構成",
    "budget_range": "middle",
    "use_case": "gaming",
    "total_price": 189800,
    "parts": [
      {
        "category": "cpu",
        "part": {
          "id": 5,
          "name": "Intel Core i5-14400F",
          "maker": "Intel",
          "price": 28800
        }
      },
      {
        "category": "gpu",
        "part": {
          "id": 12,
          "name": "RTX 4060 Ti",
          "maker": "NVIDIA",
          "price": 58000
        }
      },
      {
        "category": "memory",
        "part": {
          "id": 20,
          "name": "DDR5-5600 32GB",
          "maker": "Crucial",
          "price": 15000
        }
      }
    ]
  }
}
```

---

## 5. カスタム構成 API

### 5.1 構成一覧取得（要認証）

```
GET /api/v1/builds
```

**レスポンス (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "マイゲーミングPC",
      "total_price": 185000,
      "created_at": "2025-01-12T00:00:00Z",
      "updated_at": "2025-01-12T00:00:00Z"
    },
    {
      "id": 2,
      "name": "動画編集用PC",
      "total_price": 250000,
      "created_at": "2025-01-10T00:00:00Z",
      "updated_at": "2025-01-10T00:00:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "per_page": 20
  }
}
```

### 5.2 構成詳細取得

```
GET /api/v1/builds/:id
```

**注:** 共有URLの場合は認証不要

**レスポンス (200):**
```json
{
  "data": {
    "id": 1,
    "name": "マイゲーミングPC",
    "total_price": 185000,
    "share_token": "abc123xyz",
    "parts": [
      {
        "category": "cpu",
        "part": {
          "id": 1,
          "name": "Intel Core i7-14700K",
          "maker": "Intel",
          "price": 52000
        }
      },
      {
        "category": "gpu",
        "part": {
          "id": 10,
          "name": "RTX 4070",
          "maker": "NVIDIA",
          "price": 85000
        }
      }
    ],
    "user": {
      "id": 1,
      "name": "山田太郎"
    },
    "created_at": "2025-01-12T00:00:00Z",
    "updated_at": "2025-01-12T00:00:00Z"
  }
}
```

### 5.3 構成作成（要認証）

```
POST /api/v1/builds
```

**リクエスト:**
```json
{
  "name": "新しい構成",
  "parts": {
    "cpu_id": 1,
    "gpu_id": 10,
    "memory_id": 20,
    "storage1_id": 30,
    "storage2_id": 31,
    "storage3_id": null,
    "os_id": 40
  }
}
```

**レスポンス (201):**
```json
{
  "data": {
    "id": 3,
    "name": "新しい構成",
    "total_price": 185000,
    "share_token": "def456uvw",
    "parts": [ ... ],
    "created_at": "2025-01-12T12:00:00Z"
  }
}
```

### 5.4 構成更新（要認証）

```
PATCH /api/v1/builds/:id
```

**リクエスト:**
```json
{
  "name": "更新した構成名",
  "parts": {
    "cpu_id": 2,
    "gpu_id": 11
  }
}
```

**レスポンス (200):**
```json
{
  "data": {
    "id": 3,
    "name": "更新した構成名",
    "total_price": 190000,
    ...
  }
}
```

### 5.5 構成削除（要認証）

```
DELETE /api/v1/builds/:id
```

**レスポンス (204):** No Content

### 5.6 共有URL経由で構成取得

```
GET /api/v1/builds/shared/:share_token
```

**レスポンス (200):** 5.2と同じ形式

---

## 6. 管理者 API

### 6.1 パーツ登録（要管理者権限）

```
POST /api/v1/admin/parts
```

**リクエスト:**
```json
{
  "category": "cpu",
  "name": "Intel Core i9-14900K",
  "maker": "Intel",
  "price": 85000,
  "specs": {
    "cores": 24,
    "threads": 32,
    "base_clock": "3.2GHz",
    "boost_clock": "6.0GHz"
  }
}
```

**レスポンス (201):**
```json
{
  "data": {
    "id": 100,
    "category": "cpu",
    "name": "Intel Core i9-14900K",
    ...
  }
}
```

### 6.2 パーツ更新（要管理者権限）

```
PATCH /api/v1/admin/parts/:id
```

### 6.3 パーツ削除（要管理者権限）

```
DELETE /api/v1/admin/parts/:id
```

### 6.4 プリセット登録（要管理者権限）

```
POST /api/v1/admin/presets
```

**リクエスト:**
```json
{
  "name": "クリエイター向けハイエンド",
  "description": "4K動画編集も快適にこなせる構成",
  "budget_range": "high",
  "use_case": "creative",
  "parts": {
    "cpu_id": 100,
    "gpu_id": 50,
    "memory_id": 25,
    "storage1_id": 35,
    "storage2_id": 36,
    "storage3_id": null,
    "os_id": 40
  }
}
```

### 6.5 プリセット更新（要管理者権限）

```
PATCH /api/v1/admin/presets/:id
```

### 6.6 プリセット削除（要管理者権限）

```
DELETE /api/v1/admin/presets/:id
```

---

## 7. エンドポイント一覧

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| POST | /api/v1/auth | - | ユーザー登録 |
| POST | /api/v1/auth/sign_in | - | ログイン |
| DELETE | /api/v1/auth/sign_out | ✓ | ログアウト |
| GET | /api/v1/auth/validate_token | ✓ | トークン検証 |
| GET | /api/v1/parts | - | パーツ一覧 |
| GET | /api/v1/parts/:id | - | パーツ詳細 |
| GET | /api/v1/presets | - | プリセット検索 |
| GET | /api/v1/presets/:id | - | プリセット詳細 |
| GET | /api/v1/builds | ✓ | 構成一覧 |
| GET | /api/v1/builds/:id | △ | 構成詳細 |
| POST | /api/v1/builds | ✓ | 構成作成 |
| PATCH | /api/v1/builds/:id | ✓ | 構成更新 |
| DELETE | /api/v1/builds/:id | ✓ | 構成削除 |
| GET | /api/v1/builds/shared/:token | - | 共有構成取得 |
| POST | /api/v1/admin/parts | Admin | パーツ登録 |
| PATCH | /api/v1/admin/parts/:id | Admin | パーツ更新 |
| DELETE | /api/v1/admin/parts/:id | Admin | パーツ削除 |
| POST | /api/v1/admin/presets | Admin | プリセット登録 |
| PATCH | /api/v1/admin/presets/:id | Admin | プリセット更新 |
| DELETE | /api/v1/admin/presets/:id | Admin | プリセット削除 |

---

## 8. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2025-01-15 | ストレージ3スロット対応: storage_idをstorage1_id, storage2_id, storage3_idに変更 |
