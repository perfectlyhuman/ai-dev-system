---
description: "Morning check-in: orient on project state, current focus, and next tasks"
user_invocable: true
---

# /sync - Morning Check-In

You are performing a read-only orientation check. Your goal is to understand the current project state and recommend what to work on next.

## Execution Steps

### 1. Load Project State

Read these files in parallel:
- `documentation/ROADMAP.md` — Current focus, active sprint, open questions
- `documentation/MASTER.md` — Recent major decisions, project principles

### 2. Check Git State

Run these commands:
- `git status` — Any uncommitted changes? What branch are we on?
- `git log --oneline -10` — What was done in recent sessions?
- `git branch -a` — Any open feature branches?

### 3. Identify Current State

From ROADMAP.md, determine:
- **Current phase** and focus area
- **In-progress tasks** (🔄) — are any stale?
- **Next tasks** ready to pick up (⬜ with no unresolved dependencies)
- **Blocked tasks** (🚧) — what's blocking them?
- **Open questions** that need answers before proceeding

### 4. Check for Inconsistencies

- Are there feature branches with no corresponding ROADMAP task?
- Are there tasks marked 🔄 in-progress but no recent commits related to them?
- Are there completed tasks (✅) that haven't been documented in their chapter?

### 5. Present Summary

```
## Project Status

**Phase**: {current phase}
**Focus**: {focus description}
**Branch**: {current git branch}

### In Progress
- {task ID}: {description} — {notes}

### Ready to Pick Up
- {task ID}: {description} — {chapter link}

### Blocked
- {task ID}: {description} — blocked by {blocker}

### Open Questions
- {Q-ID}: {question summary}

### Recommended Next Action
{What to work on and why}
```

## Rules

- This is READ-ONLY. Do not modify any files.
- Don't assume what the user wants to work on — present options and recommend.
- If the roadmap seems stale (no updates in >3 days), flag it.
- If there are uncommitted changes, mention them prominently.
