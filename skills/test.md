# /test - Comprehensive Testing

## Purpose
Run thorough tests to validate changes before shipping. Provides evidence-based confidence that code works correctly.

## When to Use
- Before committing/pushing changes
- After implementing a feature
- When debugging to verify fixes
- As part of `/dev` workflow

## Mode
- **Read from**: Codebase, test results
- **Write to**: Nothing (validation only)

## Test Levels

### Level 1: Quick Validation (Always Run)
Fast checks from project.json testing commands:
- typecheck
- lint
- format

### Level 2: Build Verification (Before Push)
Full test suite from project.json:
- full command

### Level 3: E2E Tests (UI/Flow Changes)
End-to-end tests:
- e2e command from project.json

### Level 4: API Verification (Backend Changes)
Manual or scripted API testing:
- Test affected endpoints
- Verify schemas
- Check error handling

### Level 5: Database Verification (Schema Changes)
- Regenerate types
- Verify compilation
- Check migrations

## Execution Steps

### 1. Determine Test Scope

| Change Type | Required Tests |
|-------------|----------------|
| TypeScript code | Level 1 + 2 |
| UI components | Level 1 + 2 + 3 |
| API routes | Level 1 + 2 + 4 |
| Database schema | Level 1 + 2 + 5 |
| Full features | All levels |

### 2. Run Tests
Execute in order, stopping if any fail.

### 3. Handle Failures
1. Don't push - fix first
2. Understand the failure
3. Fix root cause, not symptom
4. Re-run from Level 1

### 4. Document Results
```
## Test Results Summary

### Quick Validation
- typecheck: PASS
- lint: PASS (X auto-fixed)
- format: PASS

### Build Verification
- full: PASS

### E2E Tests
- [test-name]: PASS

### Manual Verification
- [What was tested]: [Result]

### Overall: READY TO SHIP / NEEDS FIXES
```

## Notes
- Tests are not optional
- A passing build is the minimum bar
- Manual verification catches what automation misses
- If you can't test it, you can't ship it
