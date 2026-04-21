---
description: "Use when starting a new work session, picking up after a break, re-orienting after a context switch, or whenever you need to know 'where are we?'"
---

# /sync - Morning Check-In

**Announce at start:** "I'm using the /sync skill to orient on project state."

Read-only orientation check. Goal: understand the current project state and recommend what to work on next.

## Execution Steps

### 1. Load Project Configuration

Read `.claude/project.json`. Note especially:
- `launch.status` — "pre-launch" or "live" (determines branch strategy and ceremony level).
- `intake.provider` — whether external issue-tracking intake is configured.
- `documentation.root`, `documentation.master`, `documentation.chapters` — paths.

### 2. Load Project State

Read these in parallel:
- `documentation/ROADMAP.md` — current focus, active sprint, open questions.
- `documentation/MASTER.md` — recent major decisions, project principles.

### 3. Check Git State

- `git status` — uncommitted changes? current branch?
- `git log --oneline -10` — recent session activity.
- `git branch -a` — open feature branches?

### 4. Check External Intake (if configured)

**If `intake.provider == "github"`:**

```bash
gh issue list --repo {intake.repo} --state open --json number,title,labels,createdAt,author
```

Cross-reference against ROADMAP.md — which issues are new (not yet in any phase)? Which issues correspond to existing tasks?

**If `intake.provider == "none"` or unset:** Skip this step.

### 5. Identify Current State

From ROADMAP.md:
- **Current phase** and focus area.
- **In-progress tasks** (🔄) — are any stale? (No recent commits touching related code?)
- **Next tasks** ready to pick up (⬜ with no unresolved dependencies).
- **Blocked tasks** (🚧) — what's blocking them?
- **Open questions** that block upcoming work.

### 6. Surface Chapter Learnings Relevant to Ready-to-Pick-Up Tasks

For each task in "Ready to Pick Up," scan the linked chapter's **Learnings & Gotchas** section. If any entries look relevant to the task, surface them so they're visible before `/dev` starts. This is the system working as intended — prior pain becomes future leverage.

### 7. Check for Inconsistencies

- Feature branches with no corresponding ROADMAP task?
- Tasks marked 🔄 in-progress but no recent commits?
- Completed tasks (✅) not yet documented in their chapter?
- Chapters with `last_updated > 30 days` while the related code has had commits since? (Probably stale — flag for review.)

### 8. Present Summary

```
## Project Status

**Phase:** {current ROADMAP phase}
**Mode:** {pre-launch or live}   ← prominent
**Focus:** {focus description}
**Branch:** {current git branch}

### In Progress
- {task ID}: {description} — {notes}

### Ready to Pick Up
- {task ID}: {description} — [chapter link]
  **Relevant Learnings:** {brief summary, if any — "See chapter/foo.md#YYYY-MM-some-gotcha"}

### Blocked
- {task ID}: {description} — blocked by {blocker}

### Open Questions
- {Q-ID}: {question summary}

### External Intake (if configured)
- #{issue-num}: {title} — {NEW, not yet in roadmap | matches {task-id}}

### Stale Chapters (if any)
- `chapters/{name}.md` — last updated {date}, {N} commits since in related code

### Recommended Next Action
{What to work on and why}
```

## Rules

- This is READ-ONLY. Do not modify any files.
- Don't assume what the user wants to work on — present options and recommend.
- If ROADMAP.md hasn't been updated in >3 days, flag it prominently.
- If there are uncommitted changes, mention them at the top.
- When surfacing Learnings, keep them brief — one-line teasers with chapter links. The user can drill in if curious.
