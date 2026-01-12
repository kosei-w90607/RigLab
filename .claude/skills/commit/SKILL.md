---
name: commit
description: Commit discipline for TDD workflow. Use when ready to commit changes. Ensures all tests pass and follows structural/behavioral separation.
allowed-tools: Bash, Read, Grep
---

# Commit Discipline

## Prerequisites

Only commit when ALL conditions are met:

1. **All tests are passing**
2. **All compiler/linter warnings resolved**
3. **Change represents a single logical unit of work**

## Commit Message Format

Clearly state whether the commit contains:
- `[structural]` - Renaming, extracting, moving code (no behavior change)
- `[behavioral]` - New features, bug fixes, logic changes

Examples:
```
[structural] Extract validation logic to separate method
[behavioral] Add user email validation
```

## Best Practices

- Use **small, frequent commits** rather than large, infrequent ones
- Never mix structural and behavioral changes in the same commit
- Run tests before committing

## Workflow

1. Run all tests
2. Check for linter warnings
3. Review staged changes
4. Write clear commit message with type prefix
5. Commit
