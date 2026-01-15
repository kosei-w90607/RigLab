# AGENTS.md - 開発フロー概要

## プロジェクト概要

- **技術スタック**: Rails 7.1 (API) + React 18 + Vite (Frontend)
- **モード**: Solo (Claude Code 単独開発)
- **開発手法**: TDD + Tidy First

## 開発ワークフロー

```
Plan → Work → Review → Commit
```

### 1. Plan (計画)

タスクを Plans.md に記録し、優先順位をつける。

```bash
/plan-with-agent 〇〇を作りたい
```

### 2. Work (実装)

Plans.md のタスクを TDD で実装する。

```bash
/work
```

または「go」で次のテストを実装。

### 3. Review (レビュー)

実装をレビューし、品質を確認する。

```bash
/claude-code-harness:core:harness-review
```

### 4. Commit (コミット)

構造変更と振る舞い変更を分離してコミット。

```bash
/commit
```

## スキル一覧

| スキル | 用途 |
|--------|------|
| `tdd` | テスト駆動開発ワークフロー |
| `tidy-first` | 構造/振る舞い変更の分離 |
| `commit` | コミット規約とベストプラクティス |

## ディレクトリ構成

```
pc_RigLab/
├── backend/          # Rails API
├── frontend/         # React + Vite
├── .claude/          # Claude Code 設定
│   ├── CLAUDE.md     # 基本設定
│   ├── rules/        # 品質ルール
│   ├── memory/       # 意思決定記録
│   └── skills/       # スキル定義
├── AGENTS.md         # このファイル
└── Plans.md          # タスク管理
```

## 次のステップ

1. 「`/plan-with-agent` 〇〇を作りたい」で計画を作成
2. 「`/work`」または「go」でタスクを実行
3. 「`/commit`」で変更をコミット
