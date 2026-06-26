---
description: "Use anytime mid-conversation to reflect on what THIS session has taught us and recommend what's worth keeping. Advisory and recommendation-first — it proposes, you approve, then it routes the learnings. The thinking half; /update-docs is the writing half."
user_invocable: true
---

# /reflect — reflect on learnings and recommend what to keep

**Announce at start:** "I'm using the /reflect skill to reflect on what we've learned and recommend what to capture."

`/reflect` is the lightweight, anytime companion to `/update-docs`. It does NOT require a completed unit of work and it does NOT write anything on its own. It **looks back over the current conversation**, decides what's genuinely worth remembering, and presents a **recommendation** for your approval. On your yes, it routes each item to its right home (project-local learnings via `/update-docs`; cross-project behavioral learnings to your global config).

## Why this skill exists

The highest-value learnings — a correction, a confirmed approach, a gotcha that cost an hour — evaporate between sessions if nothing forces a look-back. `/update-docs` captures learnings scoped to *finished work*; a lot of insight happens *outside* that boundary (mid-debug, mid-discussion, in a course-correction). `/reflect` catches those, recommendation-first so it's never noisy.

## Execution Steps

### 1. Review the conversation so far

Read back over THIS session: what was done, decided, corrected, discovered, or course-corrected. Distinguish durable insight from incidental chatter. You are looking for two kinds:

- **Project-local learnings** — technical gotchas, decisions with real trade-offs, patterns, answered/opened questions. Route precisely: decisions → `documentation/decisions/`, lessons/gotchas → `documentation/lessons/`, domain narrative updates → `documentation/chapters/`.
- **Cross-project behavioral learnings** — how Riley wants the work done (corrections, confirmed approaches, preferences, principles). These apply to *every* project, so they belong in `~/.claude/CLAUDE.md` and/or user-memory, NOT this repo.

### 2. Present the recommendation

Output a single, scannable recommendation. For each candidate:

```
- [project | global] <one-line learning>
  → home: <chapter / decisions / lessons file>  OR  <~/.claude/CLAUDE.md / user-memory>
  → why it's worth keeping: <one line>
```

Lead with your honest assessment of how many are genuinely worth it (it's fine to recommend keeping zero). Do not pad.

### 3. Route on approval

After Riley picks which to keep:

- **Project-local** items → invoke `/update-docs` to write them properly (micro-ADR for decisions, Learning format for gotchas). `/reflect` is the thinking half; `/update-docs` is the disciplined writer.
- **Cross-project behavioral** items → propose the exact text to add to `~/.claude/CLAUDE.md` or the memory entry, and apply it after Riley confirms (sensitive/inferred claims always get a confirm).

## Rules

- **Recommendation-first. Never writes before approval.** The whole value is the curated look-back.
- **Match effort to stakes.** Recommend keeping genuinely-durable knowledge concisely; don't manufacture learnings to look thorough.
- **No life-os layer.** Cross-project learnings go to global config + memory directly — there is no meta-repo in between.
- `/reflect` can run any number of times in a session; `/closeout` reuses this same look-back at session scope.

## Related

- `/update-docs` — the writing half; `/reflect` hands project-local items to it.
- `/closeout` — session-level report that reuses this look-back plus state + next-steps.
