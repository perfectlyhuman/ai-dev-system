---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# {{PROJECT_NAME}} Project Documentation

## What is {{PROJECT_NAME}}?

{{PROJECT_DESCRIPTION — Write 2-3 sentences describing the product, who it's for, and what problem it solves. Fill this in during your first /vision session.}}

## Quick Start for Claude

1. **Read this MASTER.md** for context, principles, and project structure.
2. **Check [ROADMAP.md](ROADMAP.md)** for current focus and what to work on next.
3. **Find the relevant chapter** below for your task domain — chapters capture the **WHY** behind our decisions, not just the *what*. Read them before proposing approaches.
4. **Use AGENTS.md files** in code directories for framework patterns and imports.

### Task Routing

| Task | Start Here |
|------|------------|
| What to build next | [ROADMAP.md](ROADMAP.md) |
<!-- Add chapter links as you create them:
| Product vision | [chapters/vision.md](chapters/vision.md) |
| System design | [chapters/architecture.md](chapters/architecture.md) |
| Database schema | [chapters/database.md](chapters/database.md) |
-->

## Git Workflow

**Everything targets `preview`. `/promote` ships to production.**

All work (yours and the cloud agent's) targets feature branches that merge into `preview`. `main` is branch-protected — no direct pushes.

```
feature/{name} → preview → main (via /promote)
                     ↓          ↓
              Vercel Preview  Production
               (staging)
```

| Step | Action | Result |
|------|--------|--------|
| 1. Pull latest | `git checkout preview && git pull` | Start from up-to-date preview |
| 2. Create feature branch | `git checkout -b {branch-prefix}feature-name` | Branch from preview |
| 3. Develop & test locally | `pnpm typecheck && pnpm lint:fix && pnpm format:fix` | Local validation |
| 4. Push & merge to preview | Push branch, merge to `preview` | Triggers Vercel preview build |
| 5. Validate on preview | Check preview URL, watch for errors | Verify in real environment |
| 6. Ship to production | Run `/promote` | Gates preview → merges preview→main → watches deploy |
| 7. Cleanup | Delete feature branch | Keep branches tidy |

`launch.status` in `.claude/project.json` is **informational only** — it flags whether real users are on production (affects caution level), but does not switch pipelines.

See [workflows/git-workflow.md](workflows/git-workflow.md) for full details.

## Architecture Overview

<!-- Replace with your project's architecture diagram -->
```
┌─────────────────────────────────────────┐
│             {{PROJECT_NAME}}            │
├─────────────────────────────────────────┤
│                                         │
│  Describe your architecture here.       │
│  Use ASCII diagrams to show:            │
│  - Core components                      │
│  - External services                    │
│  - Data flow                            │
│                                         │
└─────────────────────────────────────────┘
```

## Chapters: Purpose and How to Use Them

Chapters in `chapters/` serve two purposes, both critical:

**1. Index.** A high-level map of what was built in each domain and where to find it.

**2. WHY-capture (more important).** Why we built it the way we did. What alternatives we considered and ruled out. What wrong assumptions we made and what we learned from them. The structured sections — **Key Decisions** (with micro-ADR format) and **Learnings & Gotchas** (with root-cause analysis) — exist to make this capture frictionless.

**For Claude sessions, this is non-negotiable:**
- Before proposing an approach, read the relevant chapter's Key Decisions. If your approach contradicts a documented decision, flag it instead of silently overriding.
- Before debugging, read Learnings & Gotchas. Past-us may have already solved this.
- After every piece of work, update the chapter with the WHY behind what changed.

The cost of these disciplines is a few minutes per task. The cost of *not* doing them is re-debugging the same problems and reinventing the same decisions every few weeks.

## Chapter Index

<!-- Update as you create chapters. Status: Active (written) | Stub (not yet created) -->

| Chapter | Domain | Status | Description |
|---------|--------|--------|-------------|
<!-- Example:
| [vision.md](chapters/vision.md) | Product | Active | Product vision, ICP, value prop |
| [architecture.md](chapters/architecture.md) | Infrastructure | Active | Tech stack, services, config |
| [database.md](chapters/database.md) | Data | Active | Schema design, RLS, migrations |
-->

## Project Principles

<!-- Define 4-6 core principles that guide all development decisions. Examples: -->

### 1. Documentation-Driven Development
Every feature starts in ROADMAP.md, gets planned in the relevant chapter, then gets implemented. Learnings flow back into chapters.

### 2. {{Principle 2}}
{{Description}}

### 3. {{Principle 3}}
{{Description}}

<!-- Add more as needed -->

## Key Directories

<!-- Update with your actual project structure -->
```
{{PROJECT_STRUCTURE}}
```

## Current Status

**See [ROADMAP.md](ROADMAP.md) for active work, backlog, and priorities.**

## Recent Major Decisions

| Date | Decision | Rationale | Chapter |
|------|----------|-----------|---------|
<!-- Decisions are added here as the project evolves. Example:
| 2026-02 | Chose Supabase over Firebase | RLS, Postgres, integrated auth | architecture.md |
-->

## Maintenance

### When to Update Documentation
1. After debugging sessions — capture in "Learnings & Gotchas".
2. After architectural decisions — document in "Key Decisions" + this table.
3. After discovering gotchas — add to relevant chapter.
4. After completing features — document patterns used.
5. After changing direction — update vision/roadmap.

### Source of Truth Hierarchy
```
MASTER.md (hub) → ROADMAP.md (what's next) → Chapters (deep knowledge + WHY) → Code (implementation)
```

### Writing Principles
- **Write for future Claude sessions** that have zero context about this project.
- **Capture the WHY**, not just the what.
- **Document negative knowledge** — "we tried X and it failed because Y".
- **Don't duplicate** — link to other chapters instead of copying.
- **Keep it current** — delete outdated information rather than accumulating.
