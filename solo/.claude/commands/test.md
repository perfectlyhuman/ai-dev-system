---
description: "Run comprehensive testing: typecheck, lint, format, build, and E2E"
---

# /test - Comprehensive Testing

You are running a structured test suite. Test at the appropriate level based on what's changed.

## Test Levels

### Level 1: Quick Validation (Default)

```bash
pnpm typecheck
pnpm lint:fix
pnpm format:fix
```

### Level 2: Build Verification

```bash
pnpm build
```

### Level 3: E2E Tests (when available)

```bash
cd apps/e2e && pnpm test
```

### Level 4: Database Verification (after schema changes)

```bash
pnpm supabase:web:typegen
pnpm typecheck
```

### Level 5: Manual Verification

For UI changes, describe what to check: pages, interactions, expected behavior, edge cases.

## Execution

### 1. Determine Scope

Check `git diff --stat` to see what changed:
- Code-only → Level 1
- Significant changes → Levels 1 + 2
- UI changes → Levels 1 + 2 + 3 + 5
- Schema changes → Levels 1 + 4
- Pre-ship → All applicable levels

### 2. Run Tests Sequentially

Each level depends on previous passing.

### 3. Report Results

```
## Test Results

### Level 1: Quick Validation
- ✅ typecheck: passed
- ✅ lint: passed
- ✅ format: passed

### Issues Found
- {description}

### Manual Testing Needed
- {list}
```

### 4. Fix Issues

Fix immediately if straightforward. Discuss if complex. Never leave failing tests.

## Rules

- Always run at least Level 1 before marking any task as done.
- Fix issues found — don't just report them.
- Document recurring issues in the relevant chapter's "Learnings & Gotchas".
