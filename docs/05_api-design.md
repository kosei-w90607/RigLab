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

> **注:** 認証は NextAuth.js (フロントエンド) + Rails JWT 検証 (バックエンド) で実装されています。
> フロントエンドは NextAuth.js の Credentials Provider を使用し、Rails バックエンドと JWT で通信します。

### 2.1 ユーザー登録

```
POST /api/v1/auth/register
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
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.2 ログイン

```
POST /api/v1/auth/login
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
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**エラーレスポンス (401):**
```json
{
  "error": "メールアドレスまたはパスワードが正しくありません"
}
```

### 2.3 現在のユーザー取得

```
GET /api/v1/auth/me
```

**ヘッダー:**
```
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200):**
```json
{
  "user": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "role": "user"
  }
}
```

**エラーレスポンス (401):**
```json
{
  "error": "認証が必要です"
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
| category | string | カテゴリ (cpu, gpu, memory, storage, os, motherboard, psu, case) |
| keyword | string | 検索キーワード |
| min_price | integer | 最小価格 |
| max_price | integer | 最大価格 |
| cpu_socket | string | CPUソケットでフィルタ（主にマザーボード向け。例: LGA1700, AM5） |
| memory_type | string | メモリタイプでフィルタ（メモリ、マザーボード向け。例: DDR5, DDR4） |
| form_factor | string | フォームファクタでフィルタ（ケース、マザーボード向け。例: ATX, mATX, ITX） |
| min_gpu_length | integer | GPU最小長(mm)でフィルタ（ケース向け。指定値以上のmax_gpu_length_mmを持つケースを取得） |
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

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| category | string | ✓ | カテゴリ (cpu, gpu, memory, storage, os, motherboard, psu, case) |

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

### 3.3 パーツ推奨取得（互換性ベース）

```
GET /api/v1/parts/recommendations
```

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| cpu_id | integer | ✓ | CPU ID |
| memory_id | integer | ✓ | メモリ ID |
| gpu_id | integer | - | GPU ID（省略可、電源容量計算に使用） |

**レスポンス (200):**
```json
{
  "motherboard": {
    "id": 50,
    "category": "motherboard",
    "name": "ASUS ROG STRIX Z790-F",
    "maker": "ASUS",
    "price": 45000,
    "specs": { ... },
    "socket": "LGA1700",
    "memory_type": "DDR5",
    "form_factor": "ATX"
  },
  "psu": {
    "id": 60,
    "category": "psu",
    "name": "Corsair RM850e",
    "maker": "Corsair",
    "price": 18000,
    "specs": { ... },
    "wattage": 850
  },
  "case": {
    "id": 70,
    "category": "case",
    "name": "NZXT H5 Flow",
    "maker": "NZXT",
    "price": 12000,
    "specs": { ... },
    "form_factor": "ATX",
    "max_gpu_length_mm": 365
  }
}
```

**推奨ロジック:**
- **マザーボード**: CPU ソケットとメモリタイプが一致するもの（価格順）
- **電源**: CPU TDP + GPU TDP × 1.5 + 100W 以上の容量を持つもの（容量・価格順）
- **ケース**: GPU 長が収まり、マザーボードのフォームファクタに対応するもの（価格順）

**エラーレスポンス (400):**
```json
{
  "error": {
    "code": "MISSING_PARAMS",
    "message": "CPUとメモリのIDが必要です"
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
      "cpu": {
        "id": 5,
        "name": "Intel Core i5-14400F",
        "maker": "Intel",
        "price": 28800
      },
      "gpu": {
        "id": 12,
        "name": "RTX 4060 Ti",
        "maker": "NVIDIA",
        "price": 58000
      },
      "memory": {
        "id": 20,
        "name": "DDR5-5600 32GB",
        "maker": "Crucial",
        "price": 15000
      },
      "storage1": {
        "id": 30,
        "name": "Samsung 990 Pro 1TB",
        "maker": "Samsung",
        "price": 18000
      },
      "os": null,
      "motherboard": {
        "id": 50,
        "name": "ASUS TUF GAMING B760",
        "maker": "ASUS",
        "price": 22000
      },
      "psu": {
        "id": 60,
        "name": "Corsair RM750",
        "maker": "Corsair",
        "price": 15000
      },
      "case": {
        "id": 70,
        "name": "NZXT H5 Flow",
        "maker": "NZXT",
        "price": 12000
      }
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

### 6.7 ユーザー一覧取得（要管理者権限）

```
GET /api/v1/admin/users
```

**クエリパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| page | integer | ページ番号 |
| per_page | integer | 1ページあたり件数 (default: 20) |

**レスポンス (200):**
```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "管理者",
      "role": "admin",
      "confirmed": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-10T00:00:00Z"
    },
    {
      "id": 2,
      "email": "user@example.com",
      "name": "一般ユーザー",
      "role": "user",
      "confirmed": true,
      "created_at": "2025-01-05T00:00:00Z",
      "updated_at": "2025-01-05T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "per_page": 20
  }
}
```

### 6.8 ユーザー権限更新（要管理者権限）

```
PATCH /api/v1/admin/users/:id
```

**リクエスト:**
```json
{
  "role": "admin"
}
```

**有効なロール値:** `user`, `admin`

**レスポンス (200):**
```json
{
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "一般ユーザー",
    "role": "admin",
    "confirmed": true,
    "created_at": "2025-01-05T00:00:00Z",
    "updated_at": "2025-01-15T00:00:00Z"
  }
}
```

**エラーレスポンス (422):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "無効なロールです"
  }
}
```

---

## 7. エンドポイント一覧

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| POST | /api/v1/auth/register | - | ユーザー登録 |
| POST | /api/v1/auth/login | - | ログイン |
| GET | /api/v1/auth/me | ✓ | 現在のユーザー取得 |
| GET | /api/v1/parts | - | パーツ一覧（フィルタリング対応） |
| GET | /api/v1/parts/:id | - | パーツ詳細（category必須） |
| GET | /api/v1/parts/recommendations | - | パーツ推奨取得（互換性ベース） |
| GET | /api/v1/presets | - | プリセット検索 |
| GET | /api/v1/presets/:id | - | プリセット詳細 |
| GET | /api/v1/builds | ✓ | 構成一覧 |
| GET | /api/v1/builds/:id | △ | 構成詳細 |
| POST | /api/v1/builds | ✓ | 構成作成 |
| PATCH | /api/v1/builds/:id | ✓ | 構成更新 |
| DELETE | /api/v1/builds/:id | ✓ | 構成削除 |
| GET | /api/v1/builds/shared/:token | - | 共有構成取得 |
| POST | /api/v1/share_tokens | - | 共有トークン作成 |
| GET | /api/v1/share_tokens/:token | - | 共有トークン取得 |
| POST | /api/v1/admin/parts | Admin | パーツ登録 |
| PATCH | /api/v1/admin/parts/:id | Admin | パーツ更新 |
| DELETE | /api/v1/admin/parts/:id | Admin | パーツ削除 |
| GET | /api/v1/admin/presets/:id | Admin | プリセット詳細取得 |
| POST | /api/v1/admin/presets | Admin | プリセット登録 |
| PATCH | /api/v1/admin/presets/:id | Admin | プリセット更新 |
| DELETE | /api/v1/admin/presets/:id | Admin | プリセット削除 |
| GET | /api/v1/admin/users | Admin | ユーザー一覧 |
| PATCH | /api/v1/admin/users/:id | Admin | ユーザー権限更新 |

---

## 8. 共有トークン API

未保存のPC構成を共有するためのトークンベースAPIです。
ログイン不要で構成を共有でき、SNS等でのシェア時にOG画像プレビューが表示されます。

### 8.1 共有トークン作成

```
POST /api/v1/share_tokens
```

**認証:** 不要

**リクエスト:**
```json
{
  "cpu_id": 1,
  "gpu_id": 10,
  "memory_id": 20,
  "storage1_id": 30,
  "os_id": null,
  "motherboard_id": 50,
  "psu_id": 60,
  "case_id": 70
}
```

**レスポンス (201):**
```json
{
  "data": {
    "token": "abc123xyz789def456",
    "url": "/share/abc123xyz789def456"
  }
}
```

### 8.2 共有トークン取得

```
GET /api/v1/share_tokens/:token
```

**認証:** 不要

**レスポンス (200):**
```json
{
  "data": {
    "token": "abc123xyz789def456",
    "cpu_id": 1,
    "gpu_id": 10,
    "memory_id": 20,
    "storage1_id": 30,
    "os_id": null,
    "motherboard_id": 50,
    "psu_id": 60,
    "case_id": 70,
    "created_at": "2026-02-01T12:00:00Z"
  }
}
```

**エラーレスポンス (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "トークンが見つかりません"
  }
}
```

### 8.3 共有フロー

1. **共有ボタン押下時**
   - フロント: `POST /api/v1/share_tokens` でトークン生成
   - 返却されたURLをクリップボードにコピー or Web Share API

2. **共有URLアクセス時**
   - URL形式: `https://example.com/share/{token}`
   - フロント: `GET /api/v1/share_tokens/{token}` でパーツID取得
   - フロント: 各パーツIDで `GET /api/v1/parts/{id}` してパーツ詳細取得
   - OG画像: `/share/{token}/opengraph-image` で動的生成

3. **カスタマイズ時**
   - 「この構成をカスタマイズ」ボタン押下
   - `/configurator?cpu={id}&gpu={id}&...` に遷移
   - 構成データが引き継がれた状態でカスタム構成ページを表示

4. **保存時**
   - 未ログイン: ログインページへ遷移（戻り先URL保持）
   - ログイン済: `POST /api/v1/builds` で保存
   - 保存後: ダッシュボードへ遷移

### 8.4 データベース設計

**share_tokens テーブル:**
| カラム | 型 | 説明 |
|--------|-----|------|
| id | bigint | 主キー |
| token | string | 共有トークン（unique） |
| parts_data | json | パーツ構成データ（パーツ情報をJSON形式で保存） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

**parts_data のJSON構造例:**
```json
{
  "cpu": { "id": 1, "name": "Intel Core i7-14700K", "price": 52000 },
  "gpu": { "id": 5, "name": "GeForce RTX 4070", "price": 85000 },
  "memory": { "id": 3, "name": "DDR5-5600 32GB", "price": 18000 },
  "storage1": { "id": 10, "name": "Samsung 990 Pro 1TB", "price": 15000 },
  "storage2": null,
  "storage3": null,
  "os": { "id": 1, "name": "Windows 11 Home", "price": 15000 },
  "motherboard": { "id": 2, "name": "ASUS TUF B760M-PLUS", "price": 22000 },
  "psu": { "id": 4, "name": "Corsair RM750e", "price": 12000 },
  "case": { "id": 6, "name": "NZXT H5 Flow", "price": 13000 },
  "total_price": 232000
}
```

**インデックス:**
- `token` に unique インデックス

**設計理由:**
- パーツデータをJSONで保存することで、元のパーツが削除されても構成を表示可能
- 正規化せずにスナップショットとして保存することで、共有時点のパーツ情報を保持

---

## 9. 全エンドポイント一覧（統合版）

| メソッド | エンドポイント | 認証 | 説明 |
|---------|---------------|------|------|
| POST | /api/v1/auth/register | - | ユーザー登録 |
| POST | /api/v1/auth/login | - | ログイン |
| GET | /api/v1/auth/me | ✓ | 現在のユーザー取得 |
| GET | /api/v1/parts | - | パーツ一覧（フィルタリング対応） |
| GET | /api/v1/parts/:id | - | パーツ詳細（category必須） |
| GET | /api/v1/parts/recommendations | - | パーツ推奨取得（互換性ベース） |
| GET | /api/v1/presets | - | プリセット検索 |
| GET | /api/v1/presets/:id | - | プリセット詳細 |
| GET | /api/v1/builds | ✓ | 構成一覧 |
| GET | /api/v1/builds/:id | △ | 構成詳細（共有時は認証不要） |
| POST | /api/v1/builds | ✓ | 構成作成 |
| PATCH | /api/v1/builds/:id | ✓ | 構成更新 |
| DELETE | /api/v1/builds/:id | ✓ | 構成削除 |
| GET | /api/v1/builds/shared/:token | - | 共有構成取得 |
| POST | /api/v1/share_tokens | - | 共有トークン作成 |
| GET | /api/v1/share_tokens/:token | - | 共有トークン取得 |
| POST | /api/v1/admin/parts | Admin | パーツ登録 |
| PATCH | /api/v1/admin/parts/:id | Admin | パーツ更新 |
| DELETE | /api/v1/admin/parts/:id | Admin | パーツ削除 |
| GET | /api/v1/admin/presets/:id | Admin | プリセット詳細取得 |
| POST | /api/v1/admin/presets | Admin | プリセット登録 |
| PATCH | /api/v1/admin/presets/:id | Admin | プリセット更新 |
| DELETE | /api/v1/admin/presets/:id | Admin | プリセット削除 |
| GET | /api/v1/admin/users | Admin | ユーザー一覧 |
| PATCH | /api/v1/admin/users/:id | Admin | ユーザー権限更新 |

---

## 10. 改訂履歴

| 日付 | 内容 |
|------|------|
| 2025-01-12 | 初版作成 |
| 2025-01-15 | ストレージ3スロット対応: storage_idをstorage1_id, storage2_id, storage3_idに変更 |
| 2025-01-17 | パーツ詳細取得にcategoryパラメータを必須追加（理由: DB設計上パーツが8テーブルに分散しており、IDのみでは一意特定不可のため） |
| 2026-02-01 | 共有トークンAPI追加（セクション8）- 未保存構成の共有機能を統一 |
| 2026-02-01 | Phase 6 完了に伴うAPI設計書の実装との同期: (1) パーツ一覧に互換性フィルタパラメータ追加（cpu_socket, memory_type, form_factor, min_gpu_length）、(2) パーツ推奨API追加（GET /api/v1/parts/recommendations）、(3) 管理者ユーザーAPI追加（GET/PATCH /api/v1/admin/users）、(4) プリセット一覧のレスポンス形式をフラット形式に修正、(5) 認証APIエンドポイント名を実装に合わせて修正（/auth/register, /auth/login, /auth/me）、(6) エンドポイント一覧を統合・更新 |
