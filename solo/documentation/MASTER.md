---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# {{PROJECT_NAME}} Project Documentation

## What is {{PROJECT_NAME}}?

{{PROJECT_DESCRIPTION — Write 2-3 sentences describing the product, who it's for, and what problem it solves. Fill this in during your first /vision session.}}

## Quick Start for Claude

1. **Read this MASTER.md** for context, principles, and project structure
2. **Check [ROADMAP.md](ROADMAP.md)** for current focus and what to work on next
3. **Find the relevant chapter** below for your task domain
4. **Use AGENTS.md files** in code directories for framework patterns and imports

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

**Three-tier branch strategy. Never skip the preview step for non-trivial changes.**

```
Feature branches (riley/*) → preview → main
                                ↓          ↓
                         Vercel Preview  Production
                           (staging)
```

| Step | Action | Result |
|------|--------|--------|
| 1. Create feature branch | `git checkout main && git pull && git checkout -b riley/feature-name` | Branch from up-to-date main |
| 2. Develop & test locally | `pnpm typecheck && pnpm lint:fix && pnpm format:fix` | Local validation |
| 3. Push & deploy to staging | Push branch, merge to `preview` | Triggers Vercel preview build |
| 4. Test on staging | Manual testing on preview URL | Verify in real environment |
| 5. Deploy to production | Merge `preview` to `main` | Triggers production build |
| 6. Cleanup | Delete feature branch | Keep branches tidy |

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
1. After debugging sessions - Capture in "Learnings & Gotchas"
2. After architectural decisions - Document in "Key Decisions" + this table
3. After discovering gotchas - Add to relevant chapter
4. After completing features - Document patterns used
5. After changing direction - Update vision/roadmap

### Source of Truth Hierarchy
```
MASTER.md (hub) → ROADMAP.md (what's next) → Chapters (deep knowledge) → Code (implementation)
```

### Writing Principles
- **Write for future Claude sessions** that have zero context about this project
- **Capture the WHY**, not just the what
- **Document negative knowledge** — "we tried X and it failed because Y"
- **Don't duplicate** — link to other chapters instead of copying
- **Keep it current** — delete outdated information rather than accumulating
