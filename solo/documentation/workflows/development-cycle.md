---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# Development Cycle

## Overview

This document describes how development works as a continuous cycle. The documentation system IS the project management. Every piece of work flows through a connected loop that ensures nothing is lost and the project continuously improves.

## The Cycle

```
    ┌──────────────────────────────────────────────┐
    │                                              │
    ▼                                              │
┌────────┐    ┌──────────┐    ┌──────────┐    ┌───┴──────┐
│ Vision │───▶│ Roadmap  │───▶│ Implement│───▶│ Document │
│        │    │          │    │          │    │ Learnings│
└────────┘    └──────────┘    └──────────┘    └──────────┘
    ▲                                              │
    │              ┌──────────┐                    │
    └──────────────│  Reflect │◀───────────────────┘
                   └──────────┘
```

### 1. Vision (where we want to go)
Strategic decisions about what the product is, who it's for, and where it's going.
**Skill**: `/vision` | **Doc**: `chapters/vision.md`

### 2. Roadmap (what to build next)
Prioritized tasks organized by phase. Claude reads this to know what to work on.
**Skill**: `/start` (read), `/vision` (update) | **Doc**: `ROADMAP.md`

### 3. Implement (build it)
Pick a task, code it, test it, commit it.
**How**: describe the work in natural language (superpowers inner loop) locally, OR let the
cloud agent drain it if it's `Owner: agent`, `Gate: —`. | **Git**: feature branch → (preview if live) → main

### 4. Document Learnings (capture what we learned)
Key decisions, gotchas, patterns, open questions. This prevents repeating mistakes.
**Skill**: `/update-docs`

### 5. Reflect (feed back into vision)
Review learnings, reassess priorities, update direction.
**Skill**: `/vision`

## Daily Workflow

| When | Skill | Purpose |
|------|-------|---------|
| Start of session | `/start` | Orient, see current state + parked cloud-agent items, pick next task |
| Working | natural language | Describe what to build; the superpowers inner loop (brainstorm → plan → TDD → review) fires |
| Stuck | `systematic-debugging` | 4-phase root-cause process |
| Reflecting | `/reflect` | Reflect on learnings mid-session; recommend what to keep |
| Done building | `/update-docs` | Capture learnings in chapters |
| Promoting | `/promote` | Gate preview, merge preview→main (production) |
| Planning | `/vision` | Discuss direction, update roadmap |
| Wrapping up | `/closeout` → `/finish` | Report + decide; then write the handoff |

**The cloud agent** drains `Owner: agent`, `Gate: —` tasks from the same ROADMAP in the
background — same discipline, same gate. You don't invoke it; it runs on the engine.

## What Goes Where

| Information Type | Location |
|-----------------|----------|
| Strategic decisions | vision.md + MASTER.md decisions table |
| Technical decisions | Relevant chapter + MASTER.md decisions table |
| Implementation patterns | Relevant chapter "Implementation" section |
| Problems & solutions | Relevant chapter "Learnings & Gotchas" |
| Task status | ROADMAP.md |
| Open questions | Relevant chapter + ROADMAP.md (if blocking) |
| Code patterns | AGENTS.md files in code directories |

## Writing for Future Sessions

Every documentation update should be written as if the reader:
- Has never seen this codebase
- Doesn't know why decisions were made
- Will encounter the same problems you just solved

**Bad**: "We use QStash for background jobs"
**Good**: "We use QStash for background jobs because Vercel serverless functions have timeout limits. We evaluated Bull/Redis (needs always-on server) and Inngest (newer, less proven). QStash's serverless model fits with Vercel and includes built-in retries."

## Documenting Negative Knowledge

"We tried X and it didn't work because Y" is extremely valuable.

```markdown
### {Problem Title} ({YYYY-MM})

**Problem**: {What we were trying to do}
**Approach tried**: {What we attempted}
**Why it failed**: {Root cause}
**Solution**: {What we did instead}
**Prevention**: {How to avoid this in the future}
```

## Related

- [MASTER.md](../MASTER.md) - Project hub
- [ROADMAP.md](../ROADMAP.md) - Task tracker
- [git-workflow.md](git-workflow.md) - Branch strategy
