---
description: "Auto-loaded at session start. Establishes the two-system architecture (ai-dev-system + superpowers), the project-wide Iron Laws, and which slash commands exist."
---

# Using ai-dev-system + superpowers

This project uses the **ai-dev-system (v2, autonomous)**: one documentation-driven dev
system where **two executors pull from the same `ROADMAP` and obey the same rulebook** —

- **You**, working locally in Claude Code (with the superpowers inner loop for build quality).
- **The cloud agent** (Gilfoyle), draining agent-eligible ROADMAP tasks in the background.

The `ROADMAP` `Owner` column routes each task: `Owner: riley` = you (design/judgment);
`Owner: agent` + `Gate: —` = the cloud agent, autonomously. Both write the same chapters and
pass the same gate. The full policy is the [rulebook](../../documentation/workflows/rulebook.md).

New project? The full install→register→arm flow is in [onboarding.md](../../documentation/workflows/onboarding.md).

## Slash Commands (ai-dev-system, invoked explicitly)

| Command | When |
|---|---|
| `/start` | Start of a work session. Orient on state, parked cloud-agent items, tasks. |
| `/reflect` | Anytime. Reflect on what the session taught us; recommend what to keep. |
| `/vision` | Periodic strategic planning. |
| `/kickoff` | Day 1 of a brand-new project. Guided discovery → populated docs. |
| `/update-docs` | After completing work, before declaring it done. Capture decisions + learnings. |
| `/closeout` | When tempted to finish — report state + recommend finish-or-keep-going. |
| `/finish` | Session close. Write the handoff bridge to the next session. |
| `/promote` | Production promotion: gate preview, merge preview→main, watch deploy. |
| `/setup`, `/setup-nativeexpress` | Set up a fresh project (web / mobile) from a template. |

## Natural Language → superpowers

When the user describes building, fixing, refactoring, or designing in natural language, route through superpowers. The expected chain:

```
brainstorming  →  writing-plans  →  using-git-worktrees
              →  subagent-driven-development (per-task implementer + spec-reviewer + quality-reviewer)
              →  test-driven-development (inside each task)
              →  finishing-a-development-branch (or hand back to ai-dev-system /promote)
```

For debugging, route to superpowers' `systematic-debugging` (4-phase root-cause process; "3+ failed fixes = question architecture" escalation).

Do not re-implement these flows in shell logic. Trust superpowers — it's been pressure-tested.

## Project-Wide Iron Laws

These Iron Laws (and the full Owner/Gate + surface-condition policy) are canonical in the
[rulebook](../../documentation/workflows/rulebook.md). They apply to **both** executors.

- **NO APPROACH PROPOSAL WITHOUT FIRST CHECKING `documentation/chapters/` FOR PRIOR DECISIONS AND LEARNINGS.** Grep for terms relevant to the task. Read matching Key Decisions and Learnings & Gotchas in full. If the proposed approach contradicts a documented decision, flag it explicitly — never silently override.

- **NO DEBUGGING WITHOUT FIRST CHECKING THE RELEVANT CHAPTER'S LEARNINGS & GOTCHAS.** Past sessions may have already solved this. Skip ahead if the pattern matches.

- **NO IMPLEMENTATION WORK MARKED COMPLETE WITHOUT INVOKING `/update-docs`.** Decisions, learnings, and chapter updates close the loop. Skipping it guarantees re-discovery in 6 weeks.

- **NO DEPLOY WITHOUT FRESH TEST OUTPUT IN THE SAME MESSAGE AS THE DEPLOY ACTION.** "Tests should pass" / "ran them earlier" do not count. Run, paste, then push.

- **NO PUSH, MERGE, PR, OR ISSUE-CLOSE WITHOUT EXPLICIT USER AUTHORIZATION** in the moment. Slash commands or a natural-language "yes, ship it" both count. Silent autonomy on shared-state actions does not.

Violating the letter of these laws is violating the spirit of them.

## Branch Strategy

The pipeline is always **feature → preview**, with `/promote` for preview → main (production). `main` is production (Vercel auto-deploys it) and is branch-protected — the cloud agent never reaches it.

`launch.status` is informational only — it flags "do we have real users" for caution level, nothing more. It no longer drives pipeline branching.

When unsure, ask. Never assume.

## Chapters Carry the WHY

Chapters in `documentation/chapters/` are this project's institutional memory. Two purposes, both mandatory:

1. **Index** — what was built in each domain and where.
2. **WHY-capture** (more important) — the decisions made, alternatives ruled out, wrong assumptions found. Captured in micro-ADR format (Context / Options / Decision / Why / Consequences / **Revisit if**) and Learnings & Gotchas (Problem / Wrong Assumption / Reality / Solution / Prevention).

When `/update-docs` runs after work, this is what it's writing. When the survey-chapters Iron Law fires before approach proposals, this is what's being read.

## Where to Find Things

- `documentation/MASTER.md` — project hub, principles, decisions index, git workflow.
- `documentation/ROADMAP.md` — phases, active sprint, open questions.
- `documentation/chapters/*.md` — domain knowledge (the WHY).
- `documentation/workflows/*.md` — git workflow, intake flow, dev cycle.
- `.claude/project.json` — config (launch status, intake, paths, testing commands).
- `.claude/skills/*.md` — slash command definitions.

If you haven't oriented on this project yet this session, start with `/start`.
