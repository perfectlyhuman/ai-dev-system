---
description: "Use after a Phase plan has been brainstormed, written, and approved — runs the whole Phase autonomously via OMC orchestration with superpowers running inside each task. Long autonomous run, batched discipline upfront, minimal mid-run interruptions."
user_invocable: true
---

# /grind-phase — Run an entire Phase autonomously

**Announce at start:** "I'm using the /grind-phase skill to execute Phase {{name}} end-to-end."

## When to use

- A Phase from `documentation/ROADMAP.md` has been planned in detail via `superpowers:writing-plans`.
- The plan lists every task with acceptance criteria.
- Riley has explicitly approved the plan.
- The repo is in a clean state (no uncommitted changes).

**Do NOT use** if any of the above is false. `/grind-phase` is the autonomous execution step — it does no planning of its own.

## Why this skill exists

Without `/grind-phase`, autonomous work happens at the task level: superpowers' `subagent-driven-development` runs a task, returns to the human, runs the next task. Between every task is a rubber-stamp moment. `/grind-phase` is the higher-altitude wrapper that drives the task loop using OMC's `team` orchestration, so Riley spends one large block on planning and gets a completed Phase back instead of a stream of approval requests.

## Iron Laws

- **NO PHASE RUN STARTS WITHOUT A WRITTEN, APPROVED PHASE PLAN.** Verbal "yeah do it" doesn't count — there must be a plan document with tasks and acceptance criteria, and Riley must have OK'd it.
- **NO TASK COMPLETES WITHOUT `/update-docs` RUNNING ON IT.** Chapter writes happen per task, not at phase boundary. If the run is interrupted, chapters are still current up to the last completed task.
- **NO SURFACE-CONDITION TRIGGER IS BYPASSED.** See `documentation/workflows/autonomy-surface-conditions.md`. The list is exhaustive; if it fires, you stop.
- **NO PHASE RUN PUSHES, MERGES, OPENS A PR, OR CLOSES AN ISSUE.** `/ship` is human-gated and is invoked manually after the phase completes.

Violating the letter of these laws is violating the spirit of them.

## Execution Steps

### 1. Load configuration

Read `.claude/project.json`. Confirm:
- `launch.status` — if `"live"`, double-check that the phase plan accounts for the 3-tier branch pipeline.
- `documentation.root`, `documentation.chapters` — for chapter access.
- `testing.quick` — the verification command to run per task.

### 2. Resolve the Phase

The first argument to `/grind-phase` is the Phase identifier (e.g. `p1.5`, `content-pipeline`, `P2-003`). Find the plan document by searching in this order:

1. `documentation/specs/*.md` (ai-dev-system spec convention — most likely location)
2. `documentation/plans/*.md` (alternate spec dir)
3. `docs/superpowers/plans/*.md` (superpowers default)
4. `docs/*.md` (top-level docs fallback)

**Matching rules** (apply across all dirs):
- Frontmatter `id:` field exact match (case-insensitive)
- Filename substring match (e.g. `p1.5` matches `2026-05-18-p1.5-cleanup-design.md`)
- For multiple matches, pick the one with the most recent `date:` frontmatter field

Also check `documentation/ROADMAP.md` for a matching `## Phase {{name}}` heading — confirms the phase exists in the roadmap even if the plan lives elsewhere.

If no plan document is found, STOP. Surface: "No plan found for Phase X. Searched `documentation/specs/`, `documentation/plans/`, `docs/superpowers/plans/`, `docs/`. Write one via `superpowers:writing-plans` first."

### 3. Pre-flight checks

<VERIFICATION-GATE>

- [ ] Repo is clean. `git status --short` returns nothing.
- [ ] Phase plan is locked. The plan document exists and is not labeled "draft" or "WIP".
- [ ] Every task in the plan has acceptance criteria. If any task says "TBD" or "figure out," STOP — the plan is incomplete.
- [ ] Chapter survey complete. For each task in the phase, grep `documentation/chapters/` for terms relevant to the task. If any task's proposed approach contradicts an existing Key Decision, surface (chapter-contradiction surface condition).
- [ ] Budget caps configured. If `.claude/project.json` has no `autonomy.budget` block, use defaults: 5 ralph iterations per failing test, 60-minute wall-clock cap per phase.

If any check fails, STOP and report which one.

</VERIFICATION-GATE>

### 4. Hand off to OMC's team mode

**OMC `team` mode is the default orchestration path.** Invoke `oh-my-claudecode:team` with the phase plan as input. This is the load-bearing integration point that `/grind-phase` exists to exercise — without it, we lose the multi-agent fan-out, the verify-fix ralph loop, and the team-pipeline state machine.

The orchestration pattern:

```
team-plan (consumes the existing phase plan, doesn't re-plan)
  → for each task:
      ├─ dispatch via superpowers:subagent-driven-development
      │    (implementer subagent runs TDD, spec-reviewer + quality-reviewer review,
      │     verification-before-completion runs tests)
      ├─ run /update-docs scoped to this task's affected chapters
      ├─ commit with message: "feat({{phase}}): {{task title}}"
      └─ check surface conditions — if any fire, STOP
  → team-verify (run full project test suite, not just per-task)
  → team-fix (ralph loop if anything broke at phase level — capped per Iron Law)
```

**Critical:** the per-task review must use superpowers' agents (spec-reviewer, quality-reviewer) and NOT OMC's `code-reviewer` agent. They look similar; they're not the same. Superpowers' agents enforce TDD + verification-before-completion, which is the discipline we're preserving.

**Do NOT silently fall through to `superpowers:executing-plans` because "tasks are tiny."** That's the pragmatic-judgment trap. If you genuinely believe team-mode overhead isn't worth it for the phase at hand, that's a **plan-deviation surface condition** per `documentation/workflows/autonomy-surface-conditions.md` — STOP, surface your reasoning to Riley, and let him pick. Reasons this matters:
- The whole point of `/grind-phase` is exercising the OMC-team-mode + superpowers-subagent-driven-dev integration. Routing around it means the integration stays untested.
- The plan header may say "subagent-driven-development OR executing-plans" — that flexibility is for the plan-writer to choose at planning time, not for the executor to override at runtime.
- If team-mode overhead really is too much for a particular phase, the right answer is *replanning* the phase to be larger, not bypassing the orchestrator.

The only auto-permitted fall-through is when OMC is genuinely unavailable in the project (no `oh-my-claudecode:team` skill loaded) — in which case surface "OMC not active in this project, falling back to per-task superpowers execution" and proceed with executing-plans.

### 5. Monitor surface conditions throughout

The autonomy-surface-conditions doc is the source of truth. The most common firings during a phase:

- **Chapter contradiction** — a task's proposed approach hits an existing micro-ADR with `Revisit if` conditions not met. Surface.
- **Stalled verify loop** — ralph capped at N iterations without convergence. Surface with full diagnostic context.
- **External blocker** — missing API key or unprovisioned service. Surface with the exact error.

When surfacing: STOP work, do NOT partially commit, report cleanly, wait.

### 6. Phase complete — close out

When the last task in the phase passes its acceptance criteria and the phase-level verify is green:

- [ ] Run a final chapter sweep — every Key Decision made during the run has a `Revisit if` line; every debugging session has a Learning entry.
- [ ] Report: tasks completed, total token spend, total wall-clock, surface-condition firings (if any), chapter writes by domain.
- [ ] Do NOT push. Do NOT open PR. Do NOT close issues. Surface: "Phase X complete. Run `/ship` when ready."

## Red Flags — STOP

- "The plan was 'mostly' complete, I'll fill in the rest as I go" — NO, surface and ask.
- "Token budget is close, I'll just push through" — NO, surface and ask for a cap raise.
- "The chapter says X but I think Y is better now" — NO, surface chapter-contradiction. The `Revisit if` line decides.
- "Tests are flaky, I'll skip and document" — NO, stalled verify loop = surface.
- "User said earlier 'just do it' so I'll skip the surface-condition check" — NO, blanket prior approval doesn't override situational gates.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Surface conditions slow me down" | They fire rarely if the plan is good. If they fire often, the plan was rushed. |
| "I can fix the test flake instead of surfacing" | Maybe. If it's <5 ralph iterations away, fine. Past that, you're guessing — surface. |
| "Riley said 'autonomous' so don't bother him" | Riley said autonomous *within the surface-condition policy*. Outside it, ask. |
| "It's just a small schema change" | Schema changes are MUST-surface, regardless of size. |

## Related

- [autonomy-surface-conditions](../../documentation/workflows/autonomy-surface-conditions.md)
- [update-docs](./update-docs.md)
- [SYSTEM.md](../../../SYSTEM.md)
- superpowers: `subagent-driven-development`, `test-driven-development`, `verification-before-completion`
- OMC: `team`, `ralph`, `verify-deliverables.mjs`
