# Solo Dev System

A documentation-driven project shell for solopreneur projects, designed to compose with the [superpowers](https://github.com/obra/superpowers) plugin for actual building work.

Designed for **one developer + Claude Code** working together to ship products fast.

## The Two-System Architecture

This system is intentionally narrow. It does not try to do feature development itself — it provides the **outer shell** that frames Claude's work:

- **ai-dev-system (this repo) — the outer shell.** Project lifecycle, orientation, documentation memory, deployment, scaffolding. You invoke it via slash commands at discrete moments.
- **superpowers (separate plugin) — the inner loop.** Per-feature build quality. Brainstorming, written plans, fresh-subagent-per-task with two-stage review, TDD, root-cause debugging. Fires automatically based on natural-language requests.

You don't think about which system is running. Use slash commands for discrete operations; describe what you want to build in natural language for everything else. The SessionStart hook injects a preamble that tells Claude how the two compose.

> **Recommended:** install superpowers globally so it's available across all your projects:
> ```
> /plugin install superpowers@claude-plugins-official
> ```

## What You Get

- **`/kickoff`** — Day 1 guided product discovery: idea → research → ICP → architecture → roadmap → populated docs.
- **MASTER.md** — Project hub: overview, principles, chapter index, decisions log, git workflow.
- **ROADMAP.md** — Living project tracker (replaces Linear): phases, tasks, statuses, open questions.
- **Chapters** — Domain documentation that captures what you built, how, and most importantly **WHY** — decisions, alternatives ruled out, learnings from past mistakes. The point is to prevent re-discovering the same answers in a different guise six weeks later.
- **Pre-launch vs live modes** — ship fast with no ceremony pre-launch; graduate to feature branches + preview pipeline when real users depend on production.
- **GitHub Issues intake** — capture bugs/features from Slack via the GitHub app; `/sync` surfaces them, `/ship` closes them.
- **SessionStart hook** — every new session auto-loads the ai-dev-system preamble so Claude knows the skill set and the project-wide Iron Laws without you telling it.

## Slash Commands (the outer shell)

| Command | When |
|---|---|
| `/sync` | Start of a work session. Orient on state, surface tasks, learnings, intake. |
| `/vision` | Periodic strategic planning. |
| `/update-docs` | After completing work, before declaring it done. Captures decisions and learnings into chapters. |
| `/ship` | When ready to deploy. Pipeline depends on `launch.status` in `project.json`. |
| `/kickoff` | Day 1 of a new project. Guided product discovery → populated docs. |
| `/go-live` | One-time cutover from pre-launch to live mode. |
| `/setup-makerkit`, `/setup-nativeexpress` | Set up a fresh project from a template. |

For *building* features, fixing bugs, or refactoring — describe what you want in natural language. Superpowers' chain takes over: brainstorming → writing-plans → subagent-driven-development → TDD → review.

For *debugging when stuck* — say "I'm stuck on X" or similar. Superpowers' `systematic-debugging` skill fires.

## The Full Lifecycle

```
Day 1:     /kickoff         → Idea → Research → Define → Architecture → Roadmap → Docs
           ┌──────────────────────────────────────────────────────────────────────────┐
           │                                                                          │
           ▼                                                                          │
Daily:     /sync  →  natural-language work  →  /update-docs  →  /ship                │
           │         (superpowers handles the build)                                  │
           │                                                                          │
           └──── /vision (reflect, reprioritize, course correct) ────────────────────┘
```

Documentation IS the project management. Claude reads ROADMAP.md to know what to work on, reads chapters to understand context, and updates both as work progresses. Nothing gets lost between sessions.

## Getting Started

### 1. Install superpowers (once, globally)

```
/plugin install superpowers@claude-plugins-official
```

### 2. Install ai-dev-system into your project

```bash
# From your project root
npx create-ai-dev --solo
```

Or with pnpm:
```bash
pnpm create ai-dev --solo
```

This copies `.claude/` (skills + config + hook) and `documentation/` (templates) into your project.

<details>
<summary>Alternative: install without npm</summary>

```bash
npx degit perfectlyhuman/ai-dev-system _ai-setup --force && node _ai-setup/setup.js --solo
```
</details>

### 3. Run /kickoff

```
/kickoff
```

This is a guided conversation where Claude acts as your co-founder and helps you:

1. **Explore the idea** — What are you building? Who's it for? Why now?
2. **Research the market** — Real web searches for competitors, pricing, demand signals.
3. **Define the product** — Sharpen ICP, value prop, business model, MVP scope.
4. **Design architecture** — Tech stack, services, key decisions.
5. **Build the roadmap** — Phases, tasks, dependencies, open questions.
6. **Generate documentation** — All files populated with real content, ready to build.

By the end, you have a fully populated documentation system. No templates, no placeholders — real project documentation based on your actual product.

### 4. Start building

```
/sync
```
Then describe what you want to work on in natural language. Superpowers takes the wheel for the implementation; Claude will surface ROADMAP tasks and propose what to tackle.

## Daily Workflow

```
Start of session:   /sync                          → orient, pick next task, check intake
Working:            "let's build X" / "fix Y"      → superpowers chain handles it
Stuck:              "I'm stuck on Z"               → systematic-debugging fires
Done building:      /update-docs                    → capture learnings/decisions in chapters
Shipping:           /ship                          → deploy (pipeline depends on launch.status)
Strategic check:    /vision                        → discuss direction, update roadmap
```

You don't need to memorize when each slash command fires. The SessionStart preamble teaches Claude to *offer* the right slash command at the right moment — you just say "yes" to authorize.

## File Structure

```
your-project/
├── .claude/
│   ├── project.json              # Project configuration (launch.status, intake, paths)
│   ├── settings.json             # SessionStart hook config
│   ├── hooks/
│   │   ├── session-start         # Bash hook script (runs every session)
│   │   └── run-hook.cmd          # Windows polyglot wrapper
│   ├── skills/                   # Skills with `user_invocable: true`
│   │   ├── using-ai-dev-system.md  # Auto-loaded preamble (the seam between systems)
│   │   ├── kickoff.md
│   │   ├── sync.md
│   │   ├── vision.md
│   │   ├── update-docs.md
│   │   ├── ship.md
│   │   └── go-live.md
│   └── commands/                 # Mirror of skills/ for slash command invocation
│
└── documentation/
    ├── MASTER.md                 # Project hub (populated by /kickoff)
    ├── ROADMAP.md                # Task tracker (populated by /kickoff)
    ├── chapters/                 # Domain docs (the WHY-capture)
    │   └── TEMPLATE.md           # Template with micro-ADR + Learnings format
    ├── workflows/
    │   ├── git-workflow.md       # Pre-launch vs live branch strategies
    │   ├── development-cycle.md  # How the development cycle works
    │   └── intake.md             # GitHub Issues intake flow
    └── archived/                 # Deprecated docs
```

## Key Principles

1. **Start with /kickoff.** Don't skip product discovery. 30 minutes of structured thinking saves weeks of building the wrong thing.
2. **Documentation-driven.** Every feature starts in ROADMAP.md, gets built (by superpowers), then learnings flow back into chapters via `/update-docs`.
3. **Write for future sessions.** Claude starts fresh each time. Documents must explain WHY, not just WHAT.
4. **Document negative knowledge.** "We tried X and it failed because Y" prevents repeating mistakes.
5. **Chapters carry the WHY.** Key Decisions use micro-ADR format with a "Revisit if" line. Learnings & Gotchas use Problem/Wrong-Assumption/Reality/Solution/Prevention.
6. **ROADMAP.md is your task tracker.** Simple markdown tables with status markers, not a separate tool.
7. **Pre-launch is for shipping fast; live is for protecting users.** `/ship` automatically applies the right ceremony based on `launch.status`. Use `/go-live` to flip.
8. **Slash commands for discrete operations; natural language for building.** Don't memorize which is which — Claude will offer the right slash command and you authorize.

## Pre-launch vs Live

New projects start in **pre-launch** mode (set automatically by `/kickoff`). While `launch.status` is `"pre-launch"`:

- Code is committed directly to main — no feature branches.
- `/ship` is just: run quick tests → commit → push main.
- No preview branch, no PRs, no ceremony. Blast radius of a broken deploy is zero.

When real users are about to depend on production, run `/go-live`. It sets `launch.status` to `"live"`, ensures the preview branch exists, and records the cutover as a Decision in MASTER.md. After the flip:

- Feature branches required.
- `/ship` uses the 3-tier pipeline: feature → preview → main.
- Pre-production validation ladder runs before merging to main.
- Broken deploys get caught at the preview stage before touching production.

The transition is a one-way door (operationally). It deserves the explicit ceremony.

## Project-Wide Iron Laws

These apply automatically (via the SessionStart preamble) to every Claude session in the project:

- No approach proposal without first checking `documentation/chapters/` for prior decisions and learnings.
- No debugging without first checking the relevant chapter's Learnings & Gotchas.
- No implementation work marked complete without invoking `/update-docs`.
- No deploy without fresh test output in the same message as the deploy action.
- No push, merge, PR, or issue-close without explicit user authorization.

These survive across the ai-dev-system / superpowers handoff — superpowers does the building, but the project's documentation discipline is still enforced.

## GitHub Issues Intake (Optional)

If your cofounder or teammates want to drop bugs/features from Slack:

1. Set `intake.provider: "github"` and `intake.repo: "owner/name"` in `.claude/project.json`.
2. Add the GitHub Slack app to your workspace (<https://slack.github.com/>) and run `/github subscribe owner/repo issues` in your product channel.
3. Any `/github open owner/repo <title>` from Slack creates an issue.
4. `/sync` surfaces new issues and asks whether to promote to ROADMAP.md.
5. `/ship` closes corresponding issues when their task ships.

See [documentation/workflows/intake.md](documentation/workflows/intake.md) for full details. If you don't configure intake, `/sync` and `/ship` simply skip the external step.

## Compared to Team Mode

This solo system is a lighter alternative to the full ai-dev-system (which integrates Linear + Google Drive). Use solo mode when:
- You're the only developer.
- You want everything in one repo.
- You don't need external project management tools beyond GitHub Issues.
- You want to move fast with minimal overhead.

Graduate to team mode if you hire developers or need stakeholder visibility via Linear/Drive.
