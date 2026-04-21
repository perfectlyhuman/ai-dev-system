# ai-dev-system Upgrade Plan — 2026-04-21

This document captures the upgrade session applying superpowers-derived patterns and other improvements to the solo mode of ai-dev-system.

## Motivation

Superpowers noticeably up-levels Claude's output quality. The goal of this session is not to merge superpowers into ai-dev-system — they remain separate — but to identify the transferable patterns and apply them to ai-dev-system's weak points.

Separately, this session also addresses:
- Chapters' WHY-capture purpose (currently underweighted in skill guidance)
- Pre-launch vs live project stages (current 3-tier branch strategy is overkill pre-launch)
- Slack-driven intake for bugs/features (GitHub Issues chosen over Linear and custom hosted)

## Sequence

Executed in order: **1 → 2 → 3 → 4 → 5** (chapters first, then Tier 1 rewrites, then pre-launch split, then intake, then hook).

### 1. Chapters hardening

The audit identified seven leaks in how chapters are read and written. The biggest:

- **No "check prior decisions before proposing an approach" step.** Fresh Opus reaches for best-practice answers that contradict documented decisions.
- **Learnings & Gotchas is after-only** — captured when solving, never consulted when re-approaching.
- **"Capture the WHY" is a soft rule.** Easy to skip under time pressure.
- **Key Decisions is a one-line table.** Too thin for non-trivial decisions.
- **No "conflict with prior decision" escalation.** Agent silently overrides or silently reinvents.
- **Chapters drift silently.** `last_updated` frontmatter exists but nothing uses it.

Fixes:
- TEMPLATE.md: promote Key Decisions to micro-ADR format with Context / Options / Decision / Why / Consequences / **Revisit if** fields.
- `/dev` Phase 2: new mandatory step — survey chapters for prior decisions and learnings that bear on the task. Iron Law: NO APPROACH PROPOSAL WITHOUT FIRST SURVEYING RELEVANT CHAPTER DECISIONS. HARD-GATE when proposed approach conflicts.
- `/update-docs`: completion gate on WHY-capture self-check. Red Flags + rationalization tables.
- `/sync`: surface Learnings from chapters tied to Ready-to-Pick-Up tasks. Flag stale chapters.
- `/check-assumptions`: read Learnings first. Adopt the "3+ failed fixes = question architecture" escalation.
- MASTER.md: explicit chapter-purpose preamble.

### 2. Tier 1 rewrites across all skills (superpowers patterns)

Cheap mechanical changes that tighten behavior:

- Every description rewritten to "Use when..." triggers only, no workflow summary.
- Every skill opens with "I'm using the X skill to Y" announce.
- Iron Laws added to discipline-heavy skills with "violating the letter = violating the spirit" framing.
- Verification-before-completion gates at all completion points (test output required in the same message as the claim).
- Red Flags lists + rationalization counter-tables in `/dev`, `/ship`, `/test`, `/check-assumptions`, `/update-docs`.

### 3. Pre-launch vs live branch split

- `project.json` gets a `launch` section: `status` (`"pre-launch"` | `"live"`), `activeUsers`, `wentLiveAt`.
- `/sync` displays current phase prominently.
- `/dev` Phase 1 branches conditionally: pre-launch → main directly, live → feature branch.
- `/ship` pipeline is conditional: pre-launch → test + commit + push main, live → 3-tier.
- MASTER.md Git Workflow describes both modes.
- New `/go-live` skill for the cutover moment.

### 4. GitHub Issues intake

Chosen over Linear (overkill for current stage) and a custom hosted roadmap (too much infrastructure for the problem being solved).

- `project.json` gets `intake` section: `provider` (`"github"` | `"none"`), `repo`.
- `/sync` gains a "Check external intake" step that lists open GitHub issues and cross-references with ROADMAP.md.
- `/ship` closes corresponding issues referenced in commits.
- New `workflows/intake.md` documents the Slack → GitHub Issues → ROADMAP.md flow.

**Mental model:** GitHub Issues is the inbox. ROADMAP.md is the prioritized working tracker. One-way flow from intake → roadmap during `/sync`; one-way flow back from roadmap → issue-close during `/ship`.

### 5. SessionStart hook

Superpowers' biggest invisible force multiplier: the hook auto-injects `using-superpowers` into every session, so Claude always knows the skills exist. ai-dev-system gets the equivalent:

- `solo/.claude/skills/using-ai-dev-system.md` — concise preamble (under 300 words).
- `solo/.claude/hooks/session-start` — bash script that reads the preamble and outputs the JSON Claude Code expects.
- `solo/.claude/hooks/run-hook.cmd` — Windows polyglot wrapper (mirrors superpowers' pattern).
- `solo/.claude/settings.json` — SessionStart hook wired up.

## Decisions made along the way

### "Your human partner" vs "the user"

Kept ai-dev-system's existing "the user" terminology. Swapping would cause high-noise diffs with no behavioral upside; the user did not request this change.

### TDD integration

Left `/dev`'s test-after-implement flow alone. Added verification-before-completion gates instead. Full TDD adoption is a bigger shift that deserves its own conversation.

### commands/ vs skills/ duplication

The two directories contain identical skill bodies, differing only in frontmatter (`user_invocable: true` in skills/). Both get copied into the target project by `setup.js`. Updates apply to both in lockstep.

### Scope: solo mode only

Team mode (Linear + Google Drive) skills at the repo root are out of scope for this session. Patterns can be ported in a follow-up.

## Out of scope

- Subagent-per-task for `/dev`
- Worktree isolation
- Pressure-testing the new skills with baseline subagent scenarios
- Porting to team mode
- Public hosted roadmap view

## Verification plan

After all phases complete:
- All 10 solo skills + `/go-live` present in both `commands/` and `skills/`.
- `project.json` template valid JSON with `launch` and `intake` sections.
- SessionStart hook outputs valid JSON when run standalone.
- README.md reflects new skills and modes.

---

## Addendum — Cleanup Round (same day)

After completing the initial upgrade, deeper analysis surfaced that the `/dev` skill, `/check-assumptions` skill, and `/test` skill all overlap with superpowers' inner-loop skills (`brainstorming` → `writing-plans` → `subagent-driven-development` → `test-driven-development`, and `systematic-debugging`). Superpowers' versions are more rigorous in every dimension that matters for code quality.

User confirmed they almost never invoke `/dev` directly — natural-language requests have been routing to superpowers' chain organically, with good results.

### Architectural decision

Adopt explicit two-system architecture:
- **ai-dev-system** = the **outer shell** (project lifecycle, orientation, documentation memory, deployment, scaffolding). Invoked via slash commands at discrete moments.
- **superpowers** = the **inner loop** (per-feature build quality). Fires automatically based on natural-language requests.

The seam between them is the SessionStart preamble (`using-ai-dev-system.md`), which tells Claude how the two compose and carries the project-wide Iron Laws that survive the handoff.

### Removed

- `solo/.claude/skills/dev.md` and `solo/.claude/commands/dev.md` — superseded by superpowers' brainstorming → writing-plans → subagent-driven-development chain.
- `solo/.claude/skills/check-assumptions.md` and `solo/.claude/commands/check-assumptions.md` — superseded by superpowers' systematic-debugging.
- `solo/.claude/skills/test.md` and `solo/.claude/commands/test.md` — per-feature TDD lives in superpowers; pre-ship validation moved into `/ship`.

### Disciplines that moved into the SessionStart preamble

- "NO APPROACH PROPOSAL WITHOUT FIRST CHECKING `documentation/chapters/` FOR PRIOR DECISIONS AND LEARNINGS." (was in `/dev` Phase 2)
- "NO DEBUGGING WITHOUT FIRST CHECKING THE RELEVANT CHAPTER'S LEARNINGS & GOTCHAS." (was in `/check-assumptions` step 0)
- "NO IMPLEMENTATION WORK MARKED COMPLETE WITHOUT INVOKING `/update-docs`." (was in `/dev` Phase 5)
- "NO DEPLOY WITHOUT FRESH TEST OUTPUT." (was in `/dev`, `/test`, `/ship`)
- "NO PUSH/MERGE/PR/ISSUE-CLOSE WITHOUT EXPLICIT USER AUTHORIZATION." (new — codifies the share-state-action rule)

These now apply to **every** session and **every** skill, including superpowers' chain.

### Updated

- `solo/.claude/skills/using-ai-dev-system.md` — fully rewritten to frame the two-system architecture, list the active slash commands, and carry the project-wide Iron Laws.
- `solo/.claude/skills/ship.md` and `solo/.claude/commands/ship.md` — added "Pre-Production Validation Ladder" to live-mode Option B (Ship to Main), since the standalone `/test` skill no longer exists. Levels 1-5 (typecheck/lint/format, build, E2E, db typegen, manual) all run before a production merge.
- `solo/README.md` — restructured around the two-system architecture; updated skill table; explained slash-commands-vs-natural-language pattern.

### Final skill list (7 active, plus the auto-loaded preamble)

Slash commands:
- `/sync` — orient
- `/vision` — strategic planning
- `/update-docs` — capture decisions and learnings
- `/ship` — deploy (pipeline by `launch.status`)
- `/kickoff` — Day 1 product discovery
- `/go-live` — pre-launch → live cutover
- `/setup-makerkit`, `/setup-nativeexpress` — template scaffolding

Auto-loaded:
- `using-ai-dev-system.md` — SessionStart preamble (the seam)

### Framer removed (Round 3)

Same-day follow-up: user confirmed they no longer use Framer for landing pages — they keep Makerkit's built-in marketing route group and build on top of it.

**Removed:**
- `solo/.claude/skills/landing.md` and `solo/.claude/commands/landing.md` — the entire Framer integration skill.
- `framer` section from `solo/.claude/project.json`.
- `/ship` Option C (Framer landing page deploy).
- `setup-makerkit.md` Step 5d (Framer setup) and Step 5e (strip Makerkit marketing pages).
- All Framer references from setup-makerkit.md (gotchas, env vars, DNS guidance).
- `/landing` from the SessionStart preamble's slash command list.

**Domain architecture simplified:** Single domain `{domain}` → Vercel. Makerkit serves marketing at `/`, `/pricing`, etc. and the app at `/home`, `/account`, etc. No subdomain split. Cloudflare DNS becomes one A record (apex → 76.76.21.21) plus optional www CNAME.

**Supabase auth URLs** updated to use `{domain}` instead of `app.{domain}`.

### Why this is the right answer

The chapter system, ROADMAP, MASTER, and lifecycle skills are ai-dev-system's actual contribution — they're the parts that make future Claude sessions cheap. Superpowers' inner loop produces measurably better code than ai-dev-system's `/dev` ever did.

The preamble carries the chapter-survey discipline across the handoff, so superpowers' chain still respects ai-dev-system's documentation memory. The two-system architecture is now explicit rather than accidental.

### Out of scope (still)

- Subagent-per-task is now superpowers' job and superpowers does it.
- Worktree isolation is now superpowers' job.
- Pressure-testing the new preamble would be valuable but wasn't done.
- Team mode (`ai-dev-system/skills/` at repo root) still has the old skills — porting these patterns over is its own session.
- A unified `/setup-template` framework for adding new template scaffolders is a future project.
