# Patterns - 再利用パターン

プロジェクトで確立した再利用可能なパターンを記録します。

## フォーマット

```markdown
## パターン名

**用途**: いつ使うか
**実装**: どう実装するか
**例**: 具体例
```

---

## TDD サイクル

**用途**: 新機能の実装時
**実装**:
1. テストを書く (Red)
2. 最小限のコードで通す (Green)
3. リファクタリング (Refactor)
4. コミット（構造/振る舞いを分離）

**例**:
```bash
# テストを書く
# → rspec spec/models/user_spec.rb (失敗)
# 実装
# → rspec spec/models/user_spec.rb (成功)
# リファクタリング
# コミット
```

## 構造/振る舞い分離コミット

**用途**: コードの変更をコミットする時
**実装**:
1. 構造変更（リネーム、移動、抽出）を先にコミット
2. 振る舞い変更（機能追加、バグ修正）を別コミット

**例**:
```bash
git commit -m "refactor: extract validation logic to separate method"
git commit -m "feat: add email format validation"
```
