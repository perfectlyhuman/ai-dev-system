---
description: "Update documentation with new learnings, decisions, and patterns after implementation"
user_invocable: true
---

# /update-docs - Documentation Update

You are capturing learnings and updating project documentation after implementation work. This is how institutional knowledge is preserved across Claude sessions.

## When to Use

- After completing an implementation task (`/dev`)
- After a debugging session
- After discovering stale or incomplete documentation
- After making architectural decisions during implementation

## Execution Steps

### 1. Identify Scope

Which documents are affected?
- Which **chapters** relate to the work completed?
- Any **major decisions** for MASTER.md?
- Did the **roadmap** change?

### 2. Read Current Documentation

Read affected files. Don't duplicate existing content.

### 3. Identify Gaps

For each chapter, check:

| Section | Update Needed? |
|---------|---------------|
| Key Files | Were new files created? |
| Architecture | Did the design change? |
| Implementation | New patterns or code examples? |
| Key Decisions | Were decisions made? |
| Learnings & Gotchas | Problems hit? Solutions found? |
| Open Questions | Questions answered? New ones discovered? |

### 4. Draft Updates

#### Write for Future Sessions

Assume the reader has never seen this codebase and doesn't know why decisions were made.

#### Capture the WHY

**Bad**: "We use QStash for background jobs"
**Good**: "We use QStash for background jobs because Vercel serverless functions have timeout limits. We evaluated Bull/Redis (needs server) and Inngest (less proven). QStash fits serverless and includes retries."

#### Document Negative Knowledge

```markdown
### {Problem Title} ({YYYY-MM})

**Problem**: {What we were trying to do}
**Approach tried**: {What we attempted}
**Why it failed**: {Root cause}
**Solution**: {What we did instead}
**Prevention**: {How to avoid in future}
```

### 5. Present Changes

Show what you plan to update. Wait for approval on non-obvious changes.

### 6. Apply Updates

- Update `last_updated` frontmatter
- Add major decisions to MASTER.md table
- Update ROADMAP.md if scope changed

### 7. Verify Consistency

- MASTER.md chapter index status is accurate
- Cross-references between chapters make sense
- No contradictions between chapters

## Rules

- **Don't skip this step.** Documentation is continuity across sessions.
- **Don't duplicate** — link instead of copy.
- **Delete stale info** — remove, don't accumulate.
- **Keep it practical** — real file paths, real decisions, real code examples.
- Always update the `last_updated` frontmatter.
