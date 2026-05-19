---
last_updated: 2026-05-18
updated_by: agent
version: initial
---

# Autonomy Surface Conditions

> **Purpose.** During a `/grind-phase` run, the orchestrator (OMC) and the per-task subagents (superpowers) operate without per-task human approval. This document defines the *only* conditions under which they must pause and surface to the human. Outside these conditions, "proceed" is the default — the agent's judgment is trusted.
>
> If a condition you encountered isn't on this list and you stopped anyway, the list is wrong, not your behavior — add it via `/update-docs` and explain why.

## MUST surface (pause + ask)

### Intent ambiguity

The task spec is open to multiple reasonable interpretations and your choice would materially change what the feature does. Not "which helper name is better" — that's your call. This is "did Riley want behavior A or B."

### Destructive operations

- Database schema changes (migrations, drops, type changes on populated columns)
- File or directory deletion beyond build artifacts
- `git push --force`, `git reset --hard` on tracked branches, branch deletion
- Dropping or rotating secrets
- Anything affecting external services (API keys, webhook URLs, DNS, billing config)
- Production data writes from a dev environment

### Chapter contradiction (Iron Law gate)

The proposed approach contradicts an existing Key Decision in `documentation/chapters/`. Do not override silently. Surface with: the chapter, the conflicting decision's *Why* and *Revisit if* lines, and what changed that you believe justifies revisiting.

### Plan deviation

You are about to do something not in the approved phase plan. Small refactors discovered mid-task are fine if they support the planned task. Net-new tasks, scope expansion, or skipping a planned task are not.

### External blocker

Missing credential, missing infra (database not provisioned, queue not created), failing third-party service. Surface with the specific error, the missing piece, and what you need from Riley.

### Stalled verification loop

A test or verification has failed and your fix-loop (ralph-style) has iterated N times without convergence. Default cap: 5 iterations per failing assertion. Surface with: what the test asserts, every fix you tried, every error you got, and your current hypothesis about the root cause.

### Budget cap reached

Token spend or wall-clock time for the current phase has crossed the configured cap. Surface with current spend, remaining tasks, and projected total if continued.

## MUST NOT surface (just decide)

### Implementation style choices
- Helper extraction, naming, file organization
- "Approach A or B, both reasonable" with no chapter conflict
- Whether to add a defensive check (default: only at trust boundaries per CLAUDE.md)
- Comment density (default: none per CLAUDE.md)

### Routine completion moments
- Tests pass → commit, don't ask
- Edge case discovered + handled → write a Learning entry, don't ask
- Task complete → move to next task, don't ask

### Tooling micro-decisions
- Test framework configuration tweaks
- Linter rule satisfaction
- Format/whitespace
- Import ordering

## How to surface

When a MUST-surface condition fires:
1. Stop work on the current task — do not partially apply changes.
2. Report: which condition, what triggered it, what you'd do by default, what you need from Riley.
3. Wait. Do not retry or escalate to "best guess."
4. After Riley responds, write a Learning entry if the resolution was non-obvious.

## Iron Laws

- **NO MID-PHASE WORK CONTINUES PAST A MUST-SURFACE CONDITION WITHOUT EXPLICIT HUMAN INPUT.**
- **NO MUST-NOT-SURFACE INTERRUPTION IS ALLOWED.** Asking Riley to rubber-stamp a routine decision is a bug, not a courtesy.
- **NO SURFACE CONDITION IS ADDED OR REMOVED WITHOUT `/update-docs` AND A WHY.**

Violating the letter of these laws is violating the spirit of them.

## Related

- [grind-phase skill](../../.claude/skills/grind-phase.md)
- [update-docs skill](../../.claude/skills/update-docs.md)
- [SYSTEM.md three-layer architecture](../../../SYSTEM.md)
