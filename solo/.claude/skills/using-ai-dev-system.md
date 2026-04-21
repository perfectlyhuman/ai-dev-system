---
description: "Auto-loaded at session start. Establishes the two-system architecture (ai-dev-system + superpowers), the project-wide Iron Laws, and which slash commands exist."
---

# Using ai-dev-system + superpowers

This project uses **two complementary systems**:

- **ai-dev-system** is the **outer shell** — project lifecycle, orientation, documentation memory, deployment, scaffolding. You invoke it via slash commands at discrete moments.
- **superpowers** is the **inner loop** — per-feature build quality (brainstorming, written plans, fresh-subagent-per-task with two-stage review, TDD, root-cause debugging). It fires automatically based on natural-language requests.

You don't think about which system is running. Use slash commands for discrete operations; describe what you want to build in natural language for everything else.

## Slash Commands (ai-dev-system, invoked explicitly)

| Command | When |
|---|---|
| `/sync` | Start of a work session. Orient on state, surface tasks, learnings, intake. |
| `/vision` | Periodic strategic planning. |
| `/update-docs` | After completing work, before declaring it done. Capture decisions and learnings into chapters. |
| `/ship` | When ready to deploy. Pipeline depends on `launch.status` in `project.json`. |
| `/kickoff` | Day 1 of a brand-new project. Guided product discovery → populated docs. |
| `/go-live` | One-time cutover from pre-launch to live mode. |
| `/setup-makerkit`, `/setup-nativeexpress` | Set up a fresh project from a template. |

## Natural Language → superpowers

When the user describes building, fixing, refactoring, or designing in natural language, route through superpowers. The expected chain:

```
brainstorming  →  writing-plans  →  using-git-worktrees
              →  subagent-driven-development (per-task implementer + spec-reviewer + quality-reviewer)
              →  test-driven-development (inside each task)
              →  finishing-a-development-branch (or hand back to ai-dev-system /ship)
```

For debugging, route to superpowers' `systematic-debugging` (4-phase root-cause process; "3+ failed fixes = question architecture" escalation).

Do not re-implement these flows in shell logic. Trust superpowers — it's been pressure-tested.

## Project-Wide Iron Laws

These apply to **every** skill and **every** natural-language interaction in this project, regardless of which system is running. They are how ai-dev-system's documentation discipline survives the handoff to superpowers.

- **NO APPROACH PROPOSAL WITHOUT FIRST CHECKING `documentation/chapters/` FOR PRIOR DECISIONS AND LEARNINGS.** Grep for terms relevant to the task. Read matching Key Decisions and Learnings & Gotchas in full. If the proposed approach contradicts a documented decision, flag it explicitly — never silently override.

- **NO DEBUGGING WITHOUT FIRST CHECKING THE RELEVANT CHAPTER'S LEARNINGS & GOTCHAS.** Past sessions may have already solved this. Skip ahead if the pattern matches.

- **NO IMPLEMENTATION WORK MARKED COMPLETE WITHOUT INVOKING `/update-docs`.** Decisions, learnings, and chapter updates close the loop. Skipping it guarantees re-discovery in 6 weeks.

- **NO DEPLOY WITHOUT FRESH TEST OUTPUT IN THE SAME MESSAGE AS THE DEPLOY ACTION.** "Tests should pass" / "ran them earlier" do not count. Run, paste, then push.

- **NO PUSH, MERGE, PR, OR ISSUE-CLOSE WITHOUT EXPLICIT USER AUTHORIZATION** in the moment. Slash commands or a natural-language "yes, ship it" both count. Silent autonomy on shared-state actions does not.

Violating the letter of these laws is violating the spirit of them.

## Branch Strategy by `launch.status`

Read `.claude/project.json` `launch.status`:

- **`"pre-launch"`** (no active users) → commit to main directly, push to main directly. No feature branches, no preview, no PRs. Blast radius is zero pre-launch.
- **`"live"`** (real users) → feature branches, 3-tier pipeline (feature → preview → main). `/ship` enforces this.

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

If you haven't oriented on this project yet this session, start with `/sync`.
