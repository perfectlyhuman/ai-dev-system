# Project Name — agent working contract

This repository uses **AI Dev System** with **Cursor Agent** (and the same skills in other agents that read `.agents/skills/`).

## How we build

Early-stage product work: optimize for **speed, simplicity, and reversibility**. Build what we need now; do not add process, abstraction, or infrastructure for a larger organization we might become.

- Prefer the **smallest coherent change** that solves the current requirement.
- Use **existing patterns** before introducing new layers.
- Do not refactor unrelated code, expand scope, or add ceremonial tests or docs unless they reduce real risk for this task.
- Ask before implementing only when ambiguity would materially change **user-visible behavior**, **data shape**, **architecture with switching cost**, or a **hard-to-reverse** decision. Otherwise make the simplest reasonable assumption and continue.

Spend extra care on **authentication, authorization, payments, destructive operations, database migrations, privacy/security boundaries, and production infrastructure**.

## Session lifecycle

Repository skills under `.agents/skills/`:

| Skill | When |
| --- | --- |
| `kickoff` | New product or no trustworthy `documentation/` foundation yet |
| `start` | Beginning a session — restore context, recommend one next action |
| `access` | GitHub, Vercel, Supabase, Cloudflare, email, monitoring, analytics, credentials |
| `update-docs` | After substantial work or drift (optional mid-session) |
| `finish` | End of substantive work — **includes mandatory `update-docs`**, verify, commit, deliver per `.ai-dev/project.yaml` |

Ordinary feature work does **not** require a lifecycle skill — implement directly unless you need orientation or closure.

Do not create handoff files. Canonical `documentation/`, Git, deployments, and configured integrations are the memory system.

## Canonical memory

- Product orientation: `documentation/PROJECT.md`
- Execution direction: `documentation/ROADMAP.md`
- Depth: `documentation/chapters/`, `documentation/decisions/`, `documentation/lessons/`

Read `.ai-dev/project.yaml` for stage, delivery authorization, and paths.

## Global preferences

Cross-project behavior lives in `~/.ai-dev-system/RILEY.md` (loaded during `start` when relevant).
