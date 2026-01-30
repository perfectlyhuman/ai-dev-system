---
last_updated: [YYYY-MM-DD]
updated_by: [human/agent]
---

# [Project Name] Documentation

## What is [Project Name]?

[One paragraph explaining what this project does, who it's for, and the core value proposition.]

## Quick Start for AI Agents

1. **Read this MASTER.md** for high-level context and project principles
2. **Find the relevant chapter** below for your task domain
3. **Use AGENTS.md files** in specific directories for code patterns and imports

### Key Entry Points

| Task | Start Here |
|------|------------|
| [Domain] features | [chapter.md](chapters/chapter.md) + `path/to/code/` |
| [Domain] features | [chapter.md](chapters/chapter.md) + `path/to/code/` |
| Database changes | [database.md](chapters/database.md) + `path/to/migrations/` |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         [Project Name]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐ │
│  │  [Layer]  │───▶│  [Layer]  │───▶│  [Layer]  │───▶│ [Layer] │ │
│  └───────────┘    └───────────┘    └───────────┘    └─────────┘ │
│        │                │                │                │      │
│        ▼                ▼                ▼                ▼      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      [Data Layer]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

External Services:
- [Service] → [What it does]
- [Service] → [What it does]
```

### Tech Stack

- **Framework:** [e.g., Next.js 15]
- **Database:** [e.g., PostgreSQL via Supabase]
- **Auth:** [e.g., Supabase Auth]
- **Styling:** [e.g., Tailwind CSS + Shadcn UI]
- **Deployment:** [e.g., Vercel]

## Chapter Index

| Chapter | Domain | When to Read |
|---------|--------|--------------|
| [architecture.md](chapters/architecture.md) | System design | Understanding overall structure |
| [domain.md](chapters/domain.md) | [Domain] | Working on [domain] features |
| [database.md](chapters/database.md) | Data layer | Schema changes, migrations |

## Project Principles

These core principles guide all development:

### 1. [Principle Name]
[Explanation of the principle and why it matters]

### 2. [Principle Name]
[Explanation]

### 3. [Principle Name]
[Explanation]

## Key Directories

```
project/
├── src/                    # [Description]
│   ├── [dir]/              # [Description]
│   └── [dir]/              # [Description]
├── lib/                    # [Description]
│   ├── [dir]/              # [Description]
│   └── [dir]/              # [Description]
├── components/             # [Description]
└── docs/                   # This documentation system
```

## Recent Major Decisions

| Date | Decision | Rationale | Chapter |
|------|----------|-----------|---------|
| [Date] | [Decision] | [Why] | [chapter.md](chapters/chapter.md) |

## Maintenance

### When to Update Documentation

1. **After major debugging sessions** - Capture learnings in "Learnings & Gotchas"
2. **After architectural decisions** - Document rationale in "Key Decisions"
3. **After discovering gotchas** - Add to relevant chapter
4. **After completing features** - Document patterns used

### Documentation Structure

- **MASTER.md** (this file): Executive summary, chapter index, principles
- **chapters/*.md**: Domain-specific deep dives
- **AGENTS.md** (in directories): Quick-reference for code patterns
- **archived/**: Completed plans and deprecated approaches

## Related

- [Link to other relevant docs]
- [Link to external resources]
