# AI-Integrated Development System

A complete system for AI-assisted software development that weaves together strategic planning, project management, and code implementation through a unified Claude Code interface.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [The Three Pillars](#the-three-pillars)
3. [The Integration Layer](#the-integration-layer)
4. [Skills Reference](#skills-reference)
5. [Workflows](#workflows)
6. [Setup Guide](#setup-guide)
7. [Troubleshooting](#troubleshooting)

---

## Philosophy

### The Problem

Traditional development suffers from fragmentation:
- **Vision lives in docs** that get stale and disconnected from reality
- **Project management** (Jira, Linear) becomes a graveyard of outdated tickets
- **Code knowledge** exists only in developers' heads or scattered comments
- **AI assistants** start fresh every session, lacking project context

### The Solution

This system creates a **single source of truth** across three synchronized layers, with AI as the orchestration layer that keeps everything aligned.

### Core Principles

1. **Everything is Connected** - Roadmap drives Linear, Linear drives code, code informs documentation, documentation shapes the next roadmap cycle

2. **AI is the Integration Layer** - Claude Code has MCP connections to all systems, can read/write across boundaries, and maintains consistency

3. **Humans Set Direction, AI Executes** - Strategic decisions happen in vision sessions; AI handles the mechanics of keeping systems synchronized

4. **Documentation is Living** - Updated continuously as code changes, not written once and forgotten

5. **Session Bookends** - `/start` opens every session by reading the prior HANDOFF + diffing git state. `/finish` closes by writing the next HANDOFF. The bridge is never dependent on user memory — durable context survives across context-clears.

---

## Three-Layer Architecture (with OMC + superpowers)

ai-dev-system is the **top layer** of a three-layer stack when OMC and superpowers are also installed. Each layer owns a distinct concern and operates at a distinct altitude:

```
┌──────────────────────────────────────────────────────────┐
│ TOP — ai-dev-system                                      │
│   Session frame: /start, /finish                         │
│   Canonical memory: documentation/chapters/              │
│   Promotion ceremony: /update-docs                       │
│   Project lifecycle: project.json (launch.status, intake)│
│   Phase orchestration: /grind-phase                      │
├──────────────────────────────────────────────────────────┤
│ MIDDLE — superpowers (per-task discipline)               │
│   Planning: brainstorming → writing-plans                │
│   Execution: subagent-driven-development                 │
│   Testing: test-driven-development                       │
│   Debugging: systematic-debugging                        │
│   Quality: verification-before-completion                │
├──────────────────────────────────────────────────────────┤
│ BASE — OMC (autonomy engine, opt-in per project)         │
│   Orchestration: team, ralph                             │
│   Working memory: wiki (feeds /update-docs)              │
│   Optional: HUD, cost tracking, multi-provider routing   │
└──────────────────────────────────────────────────────────┘
```

### Which layer owns what

| Concern | Layer | Mechanism |
|---------|-------|-----------|
| Session open / close | ai-dev-system | `/start`, `/finish` |
| Decision capture | ai-dev-system | chapters' micro-ADR |
| Learning capture | ai-dev-system | chapters' Learnings & Gotchas |
| Approach surveying | ai-dev-system | Iron Law: check chapters first |
| Intent exploration | superpowers | `brainstorming` |
| Plan writing | superpowers | `writing-plans` |
| Per-task TDD | superpowers | `test-driven-development` |
| Subagent dispatch | superpowers | `subagent-driven-development` |
| Verification gate | superpowers | `verification-before-completion` |
| Phase orchestration | ai-dev-system + OMC | `/grind-phase` invokes OMC's `team` |
| Verify-fix loops | OMC | `ralph` (capped by surface conditions) |
| Working memory (ephemeral) | OMC | `wiki` |
| Surface-condition policy | ai-dev-system | `documentation/workflows/autonomy-surface-conditions.md` |

### What's installed where

- **ai-dev-system** — copy of `solo/` per project, customized for that project's `project.json`.
- **superpowers** — installed at user level (`~/.claude/plugins/`), available in every project.
- **OMC** — installed at user level, but **active only in projects whose `.claude/settings.local.json` enables it**. Default state: dormant. See `docs/omc-integration-plan-2026-05-18.md`.

### When OMC is NOT installed

ai-dev-system + superpowers function exactly as they did before. `/update-docs` skips its wiki-pre-scan step silently. `/grind-phase` reports "OMC not active in this project, falling back to per-task superpowers execution" (or is simply not available, depending on project config).

This is the rollback guarantee: removing OMC reverts behavior to pre-integration.

---

## The Three Pillars

### 1. Google Drive Roadmap Document

**Purpose:** Strategic vision, high-level planning, and decision history

The Roadmap is the **strategic source of truth**. It answers:
- What are we building and why?
- What's the priority order?
- What decisions have we made?

**Structure:**
```
# [Project] Roadmap

## Vision Statement
[What and why]

## Current Initiative: [Name]
Timeline: [dates]
Goal: [measurable outcome]

## Projects (Priority Order)
### 1. [Project Name]
- Status, Timeline, Success Criteria
- Why this order (strategic rationale)
- Key Decisions made

## Decisions Log
[Chronological record with context and rationale]

## Open Questions
[Unresolved strategic questions]
```

**Why Google Docs:**
- Collaborative editing with stakeholders
- Version history built-in
- AI can read AND write via MCP
- Familiar interface for non-technical team members

---

### 2. Linear for Project/Issue Management

**Purpose:** Operational execution - what's being worked on, by whom, status

Linear is the **tactical source of truth**. It answers:
- What are we working on right now?
- Who's doing what?
- What's blocked?

**Hierarchy:**
```
Workspace
└── Team (one per product)
    └── Initiative (roadmap initiative, ~1 month)
        └── Projects (roadmap projects, ~1 week each)
            └── Issues (individual tasks, ~1 day each)
```

**Issue Lifecycle:**
```
Shaping → Todo → In Progress → In Review → Done
```

**What Goes Where:**

| Roadmap | Linear |
|---------|--------|
| Why we're doing this | What needs to be done |
| Success criteria | Acceptance criteria |
| Strategic decisions | Technical decisions |
| Timeline goals | Actual progress |

---

### 3. Internal Documentation System

**Purpose:** Persistent codebase knowledge that survives across AI sessions

Documentation is the **implementation source of truth**. It answers:
- How does this code work?
- What patterns should I follow?
- What gotchas should I know about?

**Structure:**
```
docs/
├── MASTER.md           # Executive summary, entry point
├── chapters/           # Domain-specific deep dives
│   ├── architecture.md
│   ├── [domain].md
│   └── database.md
├── workflows/          # Step-by-step procedures
└── archived/           # Completed plans, deprecated approaches
```

**MASTER.md** is the entry point - AI reads this first to understand the project.

**Chapters** contain deep dives on specific domains with:
- Key concepts and architecture
- Important files and their purposes
- Common patterns to follow
- Decisions made and why
- Gotchas and learnings

---

## The Integration Layer

### Configuration: `.claude/project.json`

This file tells Claude Code how to connect all the pieces:

```json
{
  "name": "ProjectName",
  "description": "One-line description",

  "linear": {
    "team": "TeamName",
    "teamId": "uuid",
    "currentInitiative": "Initiative Name",
    "initiativeId": "uuid"
  },

  "roadmap": {
    "source": "file"
  },

  "drive": {
    "roadmapDocId": "google-doc-id",
    "roadmapDocName": "Human-readable name"
  },

  "documentation": {
    "root": "docs",
    "master": "docs/MASTER.md",
    "chapters": "docs/chapters"
  },

  "testing": {
    "full": "npm run test",
    "typecheck": "npm run typecheck",
    "lint": "npm run lint"
  },

  "git": {
    "mainBranch": "main",
    "branchPrefix": "dev/"
  }
}
```

**`roadmap.source` — where the roadmap lives (`"file"` default, or `"linear"`):**

- **`"file"` (default):** the roadmap lives in `documentation/ROADMAP.md`. Right for **solo** projects — no external tool, no team to sync with. `/start` reads the file.
- **`"linear"`:** the roadmap lives in **Linear** (`linear.team`/`linear.teamId`). Choose this for **team-facing** projects where cofounders/teammates need to see progress, comment, and reprioritize. `/start` reads current projects/issues from Linear; `documentation/ROADMAP.md` becomes a permanent pointer stub (never maintained — Linear is the single source of truth, avoiding two-roadmaps drift). The rest of `documentation/` (decisions, lessons, HANDOFF) is unchanged. Set at scaffold time by `/setup-web`/`/setup-mobile`, or flip an existing project by setting the flag + stubbing `ROADMAP.md`.

### MCP Server Connections

Claude Code needs these MCP servers:

**Google Drive** - Read/write roadmap doc
```json
{
  "google-drive": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-google-drive"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
    }
  }
}
```

**Linear** - Full CRUD on issues, projects, cycles
```json
{
  "linear": {
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-linear"],
    "env": {
      "LINEAR_API_KEY": "lin_api_xxxxx"
    }
  }
}
```

---

## Skills Reference

### /start - Session Open (replaces the older /sync)

**When:** Start of every work session.

**What it does:**
1. Reads `documentation/HANDOFF.md` (the bridge from last session).
2. `git log --since=<handoff date>` — surfaces commits that landed without making it into the handoff (auto-deploys, crons, your pushes from another machine).
3. Runs any verifications the handoff queued (SQL probes, `gh` checks, log scans).
4. Surfaces in-progress tasks from TaskList.
5. Orients on roadmap state (current phase, ready-to-pick-up tasks, blocked items).
6. Brief report → recommends next action → awaits direction.

**Why:** The HANDOFF is only useful if it gets read. `/start` makes that automatic, and it self-heals when handoffs get skipped (stale-handoff detection + git-gap surfacing).

---

### /finish - Session Close (paired with /start)

**When:** End of every work session.

**What it does:**
1. Computes session richness (commits since last handoff, completed tasks, diff size).
2. **HIGH signal** (commits + tasks + meaningful diff) → writes a full handoff.
3. **MEDIUM signal** (one of the above) → writes a focused handoff.
4. **LOW signal** (mostly Q&A) → ASKS before writing. Never silently skips.
5. Archives the prior `HANDOFF.md` to `documentation/handoffs/YYYY-MM-DD.md`.
6. Writes fresh `HANDOFF.md` as the bridge to the next session.
7. Reminds about uncommitted work or staleness in ROADMAP, but does NOT auto-trigger `/update-docs` (different concern).

**Why:** The HANDOFF bridge only works if it gets written. `/finish` makes the ceremony cheap and protects against both "trivial-skip loses context" and "noise from empty sessions."

---

### /vision - Strategic Planning

**When:** Weekly planning, major pivots, new initiatives

**What it does:**
1. Reads current roadmap and Linear state
2. Facilitates strategic discussion
3. Updates roadmap doc with decisions
4. Suggests running /align to sync Linear

**Why:** Humans make strategic decisions; AI captures and propagates them.

---

### /align - Linear Sync

**When:** After /vision, when systems drift, weekly maintenance

**What it does:**
1. Compares Roadmap vs Linear vs Code
2. Identifies mismatches
3. Proposes corrections
4. Executes approved changes

**Why:** Keeps the tactical layer (Linear) aligned with strategic (Roadmap) and implementation (Code) reality.

---

### /dev [ID] - Implementation

**When:** Working on a specific Linear issue

**What it does:**
1. Fetches issue details, creates branch
2. Reads relevant documentation
3. Implements the feature
4. Runs tests
5. Updates Linear status
6. Updates docs if needed

**Why:** Issue-driven development with full traceability.

---

### /test - Comprehensive Testing

**When:** Before PR, before deployment, after major changes

**What it does:**
1. Runs typecheck, lint, format
2. Runs full test suite
3. Runs e2e tests if applicable
4. Reports results

**Why:** Evidence-based confidence that code works.

---

### /update-docs - Documentation Update

**When:** After completing features, after debugging sessions

**What it does:**
1. Identifies affected documentation
2. Updates chapters with patterns/decisions/gotchas
3. Updates MASTER.md if needed

**Why:** Documentation updated at point of maximum knowledge.

---

### /check-assumptions - Debug Reflection

**When:** Stuck on a problem, going in circles

**What it does:**
1. Catalogs what's been tried
2. Extracts underlying assumptions
3. Prioritizes assumptions to test
4. Guides systematic debugging

**Why:** Breaks out of unproductive loops by questioning beliefs.

---

### /branch [ID] - Create Branch

**When:** Starting work on an issue

**What it does:**
1. Verifies clean state
2. Syncs with main
3. Creates branch with Linear's suggested name

**Why:** Clean starting point with consistent naming.

---

### /ship - Push and Close

**When:** Work is complete and tested

**What it does:**
1. Runs final tests
2. Pushes branch
3. Creates PR if requested
4. Updates Linear to Done
5. Cleans up local branch

**Why:** Complete the loop - code shipped, Linear updated.

---

## Workflows

### Daily Development

```
/start                   # Open session — read HANDOFF, diff git, run verifications
/dev INT-XX              # Work on issue
  [implement]
  /test                  # Verify
  /update-docs           # Capture learnings (persistent project record)
  /ship                  # Push and close
/dev INT-YY              # Next issue
/finish                  # Close session — write fresh HANDOFF, archive prior
```

### Weekly Planning

```
/start                   # Current state + handoff context
/vision                  # Strategic discussion
  [discuss priorities]
  [update roadmap]
/align                   # Sync to Linear
```

### When Stuck

```
/check-assumptions       # Systematic debugging
  [identify what you believe]
  [test assumptions]
  [find the false belief]
```

---

## Setup Guide

### Prerequisites

- Claude Code CLI installed
- Linear account with API key
- Google Cloud service account with Drive API access
- Node.js 18+

### Installation

```bash
# From your project root
npx degit yourusername/ai-dev-system .claude --force

# Run setup
node .claude/init.js
```

### Post-Setup

1. **Configure MCP servers** in Claude Code settings
2. **Create Roadmap doc** using template, share with service account
3. **Set up Linear** - team, initiative, projects
4. **Run `/sync`** to verify everything connects

---

## Troubleshooting

### "Claude doesn't have context"
- Run `/sync` first
- Check project.json paths
- Verify MCP connections

### "Linear and Roadmap don't match"
- Run `/align`
- Review and approve corrections
- Investigate root cause

### "Documentation is stale"
- Run `/update-docs` after each feature
- Add to PR checklist
- Schedule regular audits

### "MCP connection failed"
- Check API keys are valid
- Verify service account permissions
- Ensure npx can run MCP packages

---

## Why This Works

### The Multiplier Effect

Each piece makes the others more valuable:
- Roadmap without Linear = plans without execution
- Linear without docs = tasks without context
- Docs without AI integration = knowledge without leverage
- AI without all three = starting fresh every time

Together: **Strategic alignment → Operational clarity → Efficient execution → Captured learning → Better strategy**

### For Solo Developers
- AI remembers everything you'd forget between sessions
- No context-switching between planning/coding tools
- Decisions documented automatically

### For Teams
- New team members onboard via documentation
- AI assistance is consistent regardless of who's working
- Strategic decisions visible to everyone

### For AI Assistants
- Full project context in seconds
- Clear hierarchy: Roadmap → Linear → Code
- Documented patterns prevent reinventing wheels
- Decision history prevents re-debating settled questions
