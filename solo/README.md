# Solo Dev System

A self-contained documentation and project management system for solopreneur projects. Everything lives inside your repo — no external tools required (no Linear, no Google Drive).

Designed for **one developer + Claude Code** working together to ship products fast.

## What You Get

- **`/kickoff`** - Day 1 guided product discovery: idea → research → ICP → architecture → roadmap → populated docs
- **MASTER.md** - Project hub: overview, principles, chapter index, decisions log
- **ROADMAP.md** - Living project tracker (replaces Linear): phases, tasks, statuses, open questions
- **Chapters** - Domain-specific documentation that captures WHAT you built, HOW, and most importantly WHY
- **8 Claude skills** for the full lifecycle:

| Skill | Purpose | When |
|-------|---------|------|
| `/kickoff` | Guided product discovery + project bootstrap | Day 1 |
| `/sync` | Morning orientation | Start of session |
| `/dev` | Implementation session (task → build → test → document) | Daily work |
| `/vision` | Strategic planning, update direction | Weekly / as needed |
| `/test` | Comprehensive testing | Before shipping |
| `/update-docs` | Capture learnings after implementation | After completing work |
| `/ship` | Deploy to staging or production | When ready to deploy |
| `/check-assumptions` | Systematic debugging when stuck | When blocked |

## The Full Lifecycle

```
Day 1:     /kickoff    → Idea → Research → Define → Architecture → Roadmap → Docs
           ┌───────────────────────────────────────────────────────────────────┐
           │                                                                   │
           ▼                                                                   │
Daily:     /sync → /dev → /test → /update-docs → /ship                       │
           │                                                                   │
           └──── /vision (reflect, reprioritize, course correct) ─────────────┘
```

Documentation IS the project management. Claude reads ROADMAP.md to know what to work on, reads chapters to understand context, and updates both as work progresses. Nothing gets lost between sessions.

## Getting Started

### 1. Install into your project

```bash
# From your project root (empty dir, cloned template, whatever you have):
npx create-ai-dev --solo
```

Or with pnpm:
```bash
pnpm create ai-dev --solo
```

This copies `.claude/` (skills + config) and `documentation/` (templates) into your project.

<details>
<summary>Alternative: install without npm</summary>

```bash
npx degit perfectlyhuman/ai-dev-system _ai-setup --force && node _ai-setup/setup.js --solo
```
</details>

### 2. Run /kickoff

```
/kickoff
```

This is a guided conversation where Claude acts as your co-founder and helps you:

1. **Explore the idea** — What are you building? Who's it for? Why now?
2. **Research the market** — Real web searches for competitors, pricing, demand signals
3. **Define the product** — Sharpen ICP, value prop, business model, MVP scope
4. **Design architecture** — Tech stack, services, key decisions
5. **Build the roadmap** — Phases, tasks, dependencies, open questions
6. **Generate documentation** — All files populated with real content, ready to build

By the end, you have a fully populated documentation system. No templates, no placeholders — real project documentation based on your actual product.

### 3. Start building

```
/sync          # See current state and first tasks
/dev P1-001    # Pick up the first task
```

## Daily Workflow

```
Start of session:  /sync                → Orient, pick next task
Working:           /dev [task-id]       → Implement, test, document
Stuck:             /check-assumptions   → Systematic debugging
Done building:     /update-docs         → Capture learnings
Shipping:          /ship                → Deploy to preview/main
Planning:          /vision              → Discuss direction, update roadmap
```

## File Structure

```
your-project/
├── .claude/
│   ├── project.json             # Project configuration
│   └── skills/
│       ├── kickoff.md           # /kickoff - Day 1 bootstrap
│       ├── sync.md              # /sync skill
│       ├── dev.md               # /dev skill
│       ├── vision.md            # /vision skill
│       ├── test.md              # /test skill
│       ├── update-docs.md       # /update-docs skill
│       ├── ship.md              # /ship skill
│       └── check-assumptions.md # /check-assumptions skill
│
└── documentation/
    ├── MASTER.md                # Project hub (populated by /kickoff)
    ├── ROADMAP.md               # Task tracker (populated by /kickoff)
    ├── chapters/                # Domain docs (initial set from /kickoff, grows as you build)
    │   └── TEMPLATE.md          # Template for new chapters
    ├── workflows/
    │   ├── git-workflow.md      # Three-tier branch strategy
    │   └── development-cycle.md # How the development cycle works
    └── archived/                # Deprecated docs
```

## Key Principles

1. **Start with /kickoff**: Don't skip the product discovery. 30 minutes of structured thinking saves weeks of building the wrong thing.
2. **Documentation-driven**: Every feature starts in ROADMAP.md, gets built, then learnings flow back into chapters.
3. **Write for future sessions**: Claude starts fresh each time. Documents must explain WHY, not just WHAT.
4. **Document negative knowledge**: "We tried X and it failed because Y" prevents repeating mistakes.
5. **Chapters grow with the project**: Start with 2-3 from /kickoff, add more as you build each domain.
6. **ROADMAP.md is your task tracker**: Simple markdown tables with status markers, not a separate tool.

## Compared to Team Mode

This solo system is a lighter alternative to the full ai-dev-system (which integrates Linear + Google Drive). Use solo mode when:
- You're the only developer
- You want everything in one repo
- You don't need external project management tools
- You want to move fast with minimal overhead

Graduate to team mode if you hire developers or need stakeholder visibility via Linear/Drive.
