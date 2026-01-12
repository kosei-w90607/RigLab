---
name: tidy-first
description: Tidy First approach for separating structural changes from behavioral changes. Use before making behavioral changes or during refactoring.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Tidy First Approach

Separate all changes into two distinct types:

## Change Types

### 1. STRUCTURAL CHANGES
Rearranging code **without changing behavior**:
- Renaming variables, methods, classes
- Extracting methods or classes
- Moving code between files
- Reorganizing imports
- Formatting changes

### 2. BEHAVIORAL CHANGES
Adding or modifying **actual functionality**:
- New features
- Bug fixes
- Logic changes
- API changes

## Rules

1. **Never mix** structural and behavioral changes in the same commit
2. **Always make structural changes first** when both are needed
3. **Validate** structural changes don't alter behavior by running tests before and after

## Workflow

1. Identify needed structural improvements
2. Make structural changes one at a time
3. Run tests after each structural change
4. Use `commit` skill to commit structural changes separately
5. Then proceed with behavioral changes
6. Commit behavioral changes separately
