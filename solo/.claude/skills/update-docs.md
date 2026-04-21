---
description: "Use after completing implementation work, after debugging sessions, after architectural decisions made in-flight, or when you notice stale/incomplete chapter content"
user_invocable: true
---

# /update-docs - Documentation Update

**Announce at start:** "I'm using the /update-docs skill to capture learnings from this work."

## Why This Skill Matters

Chapters are how we avoid paying for the same lesson twice. They serve two goals:

1. **Index** — what was built in this domain and where to find it.
2. **WHY** — the decisions made, the alternatives ruled out, the wrong assumptions that cost us time. This is the more important of the two.

When a fresh Claude session reads a chapter, it should come away knowing not just *what* exists but *why*. If you only capture *what*, the chapter is half-built.

## The Iron Laws

- **NO CHAPTER UPDATE MARKED COMPLETE WITHOUT A WHY SENTENCE BEHIND EVERY WHAT.**
- **NO DECISION RECORDED WITHOUT RATIONALE AND ALTERNATIVES CONSIDERED.**
- **NO DEBUGGING SESSION CLOSED WITHOUT A LEARNINGS & GOTCHAS ENTRY** (Problem / Wrong Assumption / Reality / Solution / Prevention).

Violating the letter of these laws is violating the spirit of them.

## When to Use

- After completing an implementation task (from `/dev`).
- After a debugging session (especially if `/check-assumptions` was involved).
- After making architectural decisions in-flight that weren't in the original task spec.
- After discovering stale or incomplete documentation.

## Execution Steps

### 1. Identify Scope

Which documents are affected?
- Which **chapters** relate to the work?
- Any **major decisions** for MASTER.md?
- Did the **roadmap** change?

### 2. Read Current Documentation

Read affected files before editing. Don't duplicate existing content — add, replace, or refine.

### 3. Identify Gaps

For each chapter, run through this grid:

| Section | Update Needed? |
|---------|----------------|
| Key Files | Were new files created? |
| Architecture | Did the design change? |
| Implementation | New patterns or code examples? |
| Key Decisions | Were decisions made with real trade-offs? |
| Learnings & Gotchas | Problems hit? Wrong assumptions found? |
| Open Questions | Questions answered? New ones surfaced? |

### 4. Draft Updates

#### Write for Future Sessions

The reader is a fresh Claude with zero context. Write accordingly.

#### Capture the WHY

**Bad:** "We use QStash for background jobs."

**Good:** "We use QStash for background jobs because Vercel serverless functions have timeout limits. We evaluated Bull/Redis (needs an always-on server, adds infra) and Inngest (newer, less proven API, harder to self-host later). QStash's serverless model fits Vercel, includes retries, and costs nothing at our volume. Revisit if we outgrow the free tier or need pub/sub semantics."

#### For Non-Trivial Decisions, Use the Full Micro-ADR Format

```markdown
### YYYY-MM {{Decision title}}

**Context:** {What constraints forced this decision?}
**Options considered:** {All of them, even the quick-rejects.}
**Decision:** {What we chose.}
**Why:** {The actual reasoning.}
**Consequences:** {What does this foreclose? What pain does it introduce?}
**Revisit if:** {The specific conditions that should reopen this.}
```

The **Revisit if** line is the secret sauce — it tells future sessions whether the decision is still load-bearing.

#### Document Negative Knowledge

Every bug fixed or wrong assumption found becomes a future gift:

```markdown
### {Problem Title} ({YYYY-MM})

**Problem:** {What we were trying to do.}
**Wrong assumption:** {What we believed that turned out to be false.}
**Reality:** {What was actually true.}
**Solution:** {What fixed it.}
**Prevention:** {How to catch this earlier — a check, pattern, docs change.}
```

### 5. Present Changes

Show what you plan to update before editing. Wait for approval on non-obvious changes.

### 6. Apply Updates

- Update the `last_updated` frontmatter on every modified file.
- Add major decisions to MASTER.md's "Recent Major Decisions" table.
- Update ROADMAP.md if scope or dependencies changed.

### 7. Completion Self-Check

<VERIFICATION-GATE>
Before claiming "done," run through this checklist out loud:

- [ ] Every new **decision** has both Rationale AND Alternatives Considered.
- [ ] Every non-trivial decision has a **Revisit if** line.
- [ ] Every debugging session has a **Learnings & Gotchas** entry with all five fields (Problem / Wrong Assumption / Reality / Solution / Prevention).
- [ ] Every "what" statement has a "why" sentence nearby.
- [ ] The `last_updated` frontmatter is bumped on every modified file.
- [ ] Cross-references to other chapters are added where decisions in this domain affect others.

If any box can't be ticked honestly, return to step 4 and fix it.
</VERIFICATION-GATE>

## Red Flags — STOP

- "The code is self-explanatory"
- "The decision was obvious, no need to write it up"
- "I'll capture the learning later"
- "Only captured what changed, didn't explain why"
- "Chapter is getting long, I'll skip this addition"
- About to commit with only the `last_updated` date bumped and no substance added

All of these mean: return to step 4.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "The code is self-explanatory" | You'll be a stranger to it in 3 weeks. A fresh Claude is *always* a stranger. |
| "The decision was obvious" | Obvious to you now. A fresh agent will propose the alternative you already ruled out. Write the WHY. |
| "I'll document later" | You won't. Later is when you've lost the context that made the WHY clear. |
| "Capturing WHY takes too long" | Typing 3 sentences now beats re-debugging the same problem in 6 weeks. |
| "No one will read this" | A future session will. That's the whole point. |
| "I can't remember the alternatives we considered" | Then you're already losing context. Document what you can remember now; it'll be zero in a week. |
| "It's just a small fix, doesn't need docs" | Small fixes that accumulate silently become the bugs nobody can trace. |

## Rules

- **Documentation is continuity across sessions.** Don't skip it.
- **Don't duplicate** — link instead of copy.
- **Delete stale info** — remove outdated content, don't accumulate.
- **Keep it practical** — real file paths, real decisions, real code examples.
- Always update `last_updated` on modified files.
