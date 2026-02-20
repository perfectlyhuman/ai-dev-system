---
description: "Debug reflection: systematically examine assumptions when stuck on a problem"
---

# /check-assumptions - Debug Reflection

You are performing a systematic debugging analysis. When stuck, the problem is almost always a wrong assumption.

## When to Use

- Multiple attempts without resolution
- Something that "should work" doesn't
- Unexpected behavior
- Error messages don't match what the code seems to do

## Execution Steps

### 1. Catalog Attempts

```
## Attempts So Far

1. {What was tried} → {What happened}
2. {What was tried} → {What happened}
```

### 2. Extract Assumptions

| # | Attempt | Assumption | Category |
|---|---------|-----------|----------|
| 1 | {attempt} | {what we assumed} | data/state/API/env/code |

### Common Categories

| Category | Examples |
|----------|---------|
| **Data** | "The response has this field", "The value is non-null" |
| **State** | "The row exists", "The status is completed" |
| **API** | "The endpoint returns 200", "The format matches docs" |
| **Environment** | "The env var is set", "The service is running" |
| **Code flow** | "This function is called", "This branch is reached" |
| **Dependencies** | "The package supports this", "Types are generated" |

### 3. Evaluate Assumptions

| # | Assumption | Confidence | Evidence | Tested? |
|---|-----------|-----------|----------|---------|
| 1 | {assumption} | High/Med/Low | {evidence} | Yes/No |

**Focus on LOW confidence + NOT tested.**

### 4. Prioritize & Test

Test high-impact, easily-testable, likely-wrong assumptions first.

```
## Testing Assumption #{n}: "{assumption}"

**Test**: {what we'll do}
**Expected if true**: {outcome}
**Expected if false**: {outcome}
**Result**: {actual}
**Conclusion**: confirmed/refuted
```

### 5. Synthesize

1. Which assumptions were wrong? → Likely root cause
2. What's the fix?
3. Document in chapter "Learnings & Gotchas":

```markdown
### {Problem Title} ({YYYY-MM})

**Problem**: {what we were trying to do}
**Wrong assumption**: {what we incorrectly believed}
**Reality**: {what was actually true}
**Solution**: {how we fixed it}
**Prevention**: {how to catch this earlier}
```

## Common Traps

- **"The docs are correct"** — API docs can be outdated. Verify with actual requests.
- **"It worked before"** — Code changes, deps update, environments drift.
- **"The error message tells the truth"** — Real error may be upstream.
- **"My code is right"** — Check your usage of the framework first.
- **"The data is what I expect"** — Log it. Print it. Verify it.

## Rules

- Be honest about confidence levels.
- Test assumptions in isolation — change one thing at a time.
- Don't skip documentation. Future sessions will hit the same problems.
