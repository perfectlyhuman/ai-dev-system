---
last_updated: {{DATE}}
updated_by: agent
version: v2
---

# Onboarding a new project (install → register → arm)

How a fresh repo goes from clone to "the cloud agent builds for me." Run by the setup command (`/setup-web` for Makerkit web apps, `/setup-mobile` for NativeExpress mobile apps); this doc is the durable explanation.

## The flow

1. **Scaffold (`/setup-web` or `/setup-mobile`).** Installs the v2 bundle: the 8 canonical doc paths the engine validator requires, the v2 command set, `project.json` with the `autonomy` block.
2. **`preview` branch.** From `main`. The agent always opens PRs into `preview`; `main` is your gate (fast-merge `preview → main` pre-launch — zero blast radius).
3. **Register (dormant + shadow).** The setup command opens a PR to `perfectlyhuman/agents` adding this repo to `REPOS` (`drainEnabled:false`, `autoMergeEnabled:false`). You merge it.
4. **Seed the queue.** `/kickoff` or `/vision` populate the ROADMAP. The agent only touches `Owner: agent`, `Gate: —` rows.
5. **Arm.** Flip `drainEnabled:true` → shadow PRs you review. After 5+ clean merges, `autoMergeEnabled:true` → fully autonomous into `preview`. Idles when no task is eligible.

## Why dormant-then-arm (not auto-on)

The engine has no separate readiness gate — it idles when no task is eligible, and the 3-strike SYSTEM HALT catches a broken base. "Arming" = flipping `drainEnabled` once the repo has a green gate + agent-eligible rows. Shadow mode is the bed-in.

## One memory, both executors

You (locally) and Gilfoyle (cloud) share the same substrate: `ROADMAP` (queue), `rulebook` (policy), `chapters/` (domain knowledge), and — critically — the SAME `decisions/` and `lessons/` dirs. A decision you record via `/update-docs` is the decision the agent reads before working. The agent runs the shared prompt (`perfectlyhuman/agents` → `gilfoyle/prompt.md`).

## Related

- [rulebook](rulebook.md) · [development-cycle](development-cycle.md)
- Engine: `perfectlyhuman/agents` `lib/repos.ts` + `gilfoyle/prompt.md`.
