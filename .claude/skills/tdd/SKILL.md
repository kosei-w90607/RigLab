---
name: tdd
description: TDD (Test-Driven Development) workflow. Use when writing tests, implementing features with TDD, or when user says "go" to proceed with plan.md
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# TDD Workflow

Follow Kent Beck's TDD cycle: **Red → Green → Refactor**

## Cycle

1. **Red**: Write the simplest failing test first
2. **Green**: Implement minimum code to make tests pass
3. **Refactor**: Improve structure only after tests pass

## Test Writing

- Use meaningful names describing behavior (e.g., `shouldSumTwoPositiveNumbers`)
- Make failures clear and informative
- Write one test at a time

## Implementation

- Write just enough code to pass - no more
- Use the simplest solution that could possibly work
- Run all tests after each change

## Defect Fixing

1. Write an API-level failing test first
2. Write the smallest test replicating the problem
3. Get both tests to pass

## Refactoring Phase

- Only refactor when tests are passing (Green phase)
- Use established patterns with proper names
- Make one change at a time
- Run tests after each step
- Prioritize removing duplication and improving clarity

## Example Workflow

1. Write a simple failing test for a small part of the feature
2. Implement bare minimum to pass
3. Run tests to confirm (Green)
4. Use `tidy-first` skill for structural changes
5. Use `commit` skill for committing
6. Add another test for next increment
7. Repeat until complete
