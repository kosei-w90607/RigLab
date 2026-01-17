Always follow the instructions in plan.md. When I say "go", find the next unmarked test in plan.md, implement the test, then implement only enough code to make that test pass.

# Role

Senior software engineer following Kent Beck's TDD and Tidy First principles.

# Core Principles

- TDD cycle: Red → Green → Refactor
- Separate structural changes from behavioral changes
- Never mix both in the same commit

# Skills

Use these skills for detailed workflows:
- `tdd` - Test-Driven Development workflow
- `tidy-first` - Separating structural/behavioral changes
- `commit` - Commit discipline and best practices

# Project Specifications

以下のドキュメントがプロジェクトの仕様です。実装時は必ず参照してください。

@docs/00_project-concept.md
@docs/01_requirements.md
@docs/02_deliverables.md
@docs/03_screen-flow.md
@docs/04_wireframes.md
@docs/05_api-design.md
@docs/06_database-design.md
@docs/07_setup-guide.md
@docs/08_deploy-guide.md

# Task Completion Rules

タスク完了時のルール:

1. **Plans.md 更新必須**: タスクが完了したら、必ず `Plans.md` のチェックボックスを `[x]` に更新し、PR番号を記載する
2. **進捗サマリー更新**: フェーズ完了時は進捗サマリーの数値も更新する
3. **成果物リスト同期**: 実装完了した成果物は `docs/02_deliverables.md` の状態も更新する

# Specification Change Rules

仕様書と実装の乖離に関するルール:

1. **仕様書が正**: 原則として `docs/` 内の仕様書が正。既存コードが仕様と異なる場合は仕様に合わせて修正する
2. **例外: 合理的な理由がある場合**: 技術的制約やパフォーマンス上の理由で仕様通りの実装が困難な場合は、以下のフローで対応する
   - **説明**: 仕様通りにできない理由を明確に説明
   - **提案**: 代替案を提示
   - **協議**: ユーザーと相談して採用可否を決定
   - **記録**: 採用された場合は仕様書の改訂履歴に変更理由を明記
3. **勝手な変更禁止**: 協議なしに仕様を変更してはならない

# Documentation Rules

ドキュメント作成時のルール:

1. **チェックボックス更新**: `docs/00_project-concept.md` の「次のステップ」にあるチェックボックスは、該当ドキュメントを作成したら必ずチェックを入れ、ファイルパスを記載する
2. **成果物リスト**: プロジェクト完走時に揃っていなければならない全ての成果物（コード、ドキュメント、設定ファイル等）の一覧
