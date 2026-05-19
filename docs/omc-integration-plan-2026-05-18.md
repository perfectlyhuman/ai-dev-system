# OMC Integration Plan — 2026-05-18

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer Yeachan-Heo/oh-my-claudecode (OMC) underneath ai-dev-system + superpowers as a phase-level autonomy engine, so Riley spends a long block upfront on brainstorming/planning and then an entire roadmap Phase executes autonomously, with high-signal-only surface conditions and a clean rollback path.

**Architecture:** Three layers at different altitudes.
- **TOP — ai-dev-system** owns session boundaries (`/start`, `/finish`), canonical decision/learning memory (`documentation/chapters/`), `/update-docs` promotion ceremony, project lifecycle (`launch.status`, intake).
- **MIDDLE — superpowers** owns per-task discipline: `brainstorming` and `writing-plans` produce the **phase plan** upfront, then `subagent-driven-development` (implementer + spec-reviewer + quality-reviewer) runs inside each task during phase execution, with TDD + `verification-before-completion`.
- **BASE — OMC** owns phase-level orchestration via `team` mode (or `ralph` for verify-fix loops), provides `wiki` working memory that feeds `/update-docs`, optionally exposes HUD/cost tracking.

Mid-run, the only interruptions to Riley are load-bearing surface conditions (intent ambiguity, destructive ops, chapter contradiction, plan deviation, hard blocker, stalled verify loop, budget cap). Default chatter is suppressed.

**Tech Stack:** Claude Code CLI plugins (marketplace install), `~/.claude/settings.json` + per-project `.claude/settings.json` hook overrides, ai-dev-system skill files (markdown with frontmatter), OMC plugin `oh-my-claudecode` (Yeachan-Heo/oh-my-claudecode), superpowers plugin (obra/superpowers, currently installed at v5.1.0).

---

## File Structure

### Files to create

| Path | Responsibility |
|------|----------------|
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\skills\grind-phase.md` | New phase-level orchestration skill (skill body) |
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\commands\grind-phase.md` | Slash-command alias for `grind-phase` |
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\documentation\workflows\autonomy-surface-conditions.md` | Canonical policy: when an autonomous phase run must surface to the human |
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\documentation\workflows\omc-rollback.md` | Exact revert procedure if we kill the experiment |
| `<testbed>\.claude\settings.local.json` | OMC hook surgery (project-scoped overrides) |

### Files to modify

| Path | Change |
|------|--------|
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\skills\update-docs.md` | Add `.omc/wiki/` ingestion pass — promote durable wiki entries into chapters, propose skillify-candidates |
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\commands\update-docs.md` | Mirror the skill change |
| `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\SYSTEM.md` | Add a "Three-layer architecture" section documenting the OMC/superpowers/ai-dev-system stack and which layer owns what |

### Files explicitly NOT touched

- `documentation/chapters/*.md` schema — untouched. The micro-ADR + Learnings format is canonical.
- The legacy `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\skills\*.md` (root-level) — not modified by this plan. `solo/.claude/` is canonical.
- Any production project (`IntentPost`, `Vibeocracy`, `RapportAPI`) — OMC is not installed there in this plan.

---

## Testbed Decision

This plan is two-step on purpose:

**Bootstrap on ai-dev-system itself** (Tasks 1-10): install OMC, write the new skills, do the hook surgery — all in ai-dev-system's repo on a feature branch. Blast radius is just the tooling.

**First real run on Seek** (Tasks 11-13): Seek is pre-launch (`launch.status: "pre-launch"`, no active users — verified in `c:\Users\riley\Cursor\perfectlyhuman\seek\.claude\project.json`), has a real ROADMAP with Phases, and is the project Riley is actively working on. A small 3-5 task phase is the smoke test. If it goes sideways, `git revert` + `/plugin uninstall` cleans it up.

Live projects (IntentPost, etc.) are out of scope until the testbed clears.

---

## Task 1: Pre-flight inventory (rollback baseline)

**Files:**
- Read-only: `~/.claude/settings.json`, `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\settings.json`, `c:\Users\riley\Cursor\perfectlyhuman\seek\.claude\settings.json` (if exists)
- Create snapshot: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\docs\omc-integration-baseline-2026-05-18\` (directory)

- [ ] **Step 1: Create baseline directory + REDACTED plugins/MCP manifest**

**DO NOT copy `~/.claude/settings.json` directly.** That file typically contains embedded credentials: Bash permission patterns with secret values baked in (e.g. `Bash(SERVICE_KEY="eyJ...":*)`), MCP server `env` blocks with API keys, and potentially a GCP service-account private key. Committing it leaks all of those. The `.gitignore` blocks `docs/**/global-settings.json` to prevent accidental future copies.

Instead, create a redacted manifest that captures only the structural information needed for rollback: which plugins are enabled, which MCP servers are configured by name (no env values), and the statusline preset.

```bash
mkdir -p "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18"
```

Read `~/.claude/settings.json` to extract just the `enabledPlugins` array and the names (not values) from `mcpServers`. Write them into `docs/omc-integration-baseline-2026-05-18/plugins-manifest.txt`. See the existing manifest in that directory for the expected format and content sections.

**Verification (mandatory):** before staging the manifest, grep it for credential patterns:
```bash
grep -E "sk-|sk_live_|xai-|eyJ|Bearer |BEGIN PRIVATE KEY|SERVICE_KEY=|SB_KEY=|GOOGLE_APPLICATION" "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/plugins-manifest.txt"
```
Expected: no matches. Any match = a secret escaped redaction. Stop, redact further, re-verify.

- [ ] **Step 2: Snapshot ai-dev-system tree**

Use `git -C` with absolute paths instead of `cd` so commands are self-contained:
```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" status --short > "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/ai-dev-system-status.txt"
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" log -10 --oneline > "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/ai-dev-system-log.txt"
```
Expected: status captured (may be non-empty due to pre-existing unrelated dirty state — that's fine; this baseline records reality at integration start, not a hypothetically-clean tree). Recent commits captured.

- [ ] **Step 3: Snapshot seek tree (testbed target)**

```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/seek" status --short > "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/seek-status.txt"
git -C "c:/Users/riley/Cursor/perfectlyhuman/seek" log -10 --oneline > "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/seek-log.txt"
git -C "c:/Users/riley/Cursor/perfectlyhuman/seek" rev-parse HEAD > "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/seek-head-sha.txt"
```
Expected: seek-status.txt may be empty (seek is clean), HEAD SHA captured for rollback reference.

- [ ] **Step 4: Commit the baseline**

ai-dev-system's default branch is `master` (not `main`). Branch explicitly off master so the base is unambiguous:
```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" checkout -b feat/omc-integration master
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" add docs/omc-integration-baseline-2026-05-18/ docs/omc-integration-plan-2026-05-18.md
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" commit -m "chore(omc): capture pre-integration baseline + plan doc"
```
Expected: commit lands on new branch `feat/omc-integration` based on master.

**Pre-existing dirty state in ai-dev-system** (modified `setup-*.js`, untracked `.claude/`, `.superpowers/`, `skills/landing-page.md`) is unrelated to this work. Carry it forward; do NOT include it in the baseline commit (the `git add` above is explicit-path, so it won't catch the dirty state).

---

## Task 2: Install OMC plugin

**Files:**
- Modify: `~/.claude/settings.json` (plugin install will touch this)

**Context:** OMC ships via the Claude Code plugin marketplace. The install command pattern (per [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) README) is `/plugin marketplace add` followed by `/plugin install oh-my-claudecode`. We install at the user level so the plugin is available everywhere, but we'll restrict its hooks to specific projects via project-scoped settings.

- [ ] **Step 1: Add the OMC marketplace inside Claude Code**

From a Claude Code interactive session, run the slash command:
```
/plugin marketplace add Yeachan-Heo/oh-my-claudecode
```
Expected: marketplace registered. Verify with `/plugin marketplace list`.

- [ ] **Step 2: Install the plugin**

```
/plugin install oh-my-claudecode
```
Expected: plugin installed. Verify with `/plugin list` — should now show `oh-my-claudecode@<version>` alongside `superpowers@5.1.0`.

- [ ] **Step 3: Confirm OMC was added to the plugin list**

There is no full settings snapshot to diff against (baseline is a redacted manifest, not a raw copy). Instead, verify the `enabledPlugins` block in `~/.claude/settings.json` now contains an entry for `oh-my-claudecode`, and confirm the plugin install dropped files under `~/.claude/plugins/`:

```bash
grep -i "oh-my-claudecode" "$HOME/.claude/settings.json"
find "$HOME/.claude/plugins" -type d -iname "*oh-my-claudecode*" 2>/dev/null | head
```
Expected: grep returns at least one match in the `enabledPlugins` array. The `find` returns at least one path like `~/.claude/plugins/cache/.../oh-my-claudecode/<version>/`. Record that path — we need it in Step 4.

- [ ] **Step 4: Locate OMC's hooks.json**

```powershell
Get-ChildItem -Recurse -Path "$env:USERPROFILE\.claude\plugins" -Filter "hooks.json" | Where-Object { $_.FullName -like "*oh-my-claudecode*" }
```
Expected: prints exact path to OMC's `hooks/hooks.json`. Record this — we need it in Task 3.

- [ ] **Step 5: Inspect what OMC registered**

Read the OMC `hooks/hooks.json` and list every hook by event. Cross-check against the expected set from the research (UserPromptSubmit, SessionStart × 2-4, PreToolUse, PermissionRequest, PostToolUse × 3, PostToolUseFailure, SubagentStart, SubagentStop × 2, PreCompact × 3, Stop × 3, SessionEnd × 2).

Hook names to confirm exist:
- `keyword-detector.mjs` and `skill-injector.mjs` on UserPromptSubmit
- `project-memory-session.mjs`, `wiki-session-start.mjs` on SessionStart
- `persistent-mode.mjs` on Stop
- `wiki-session-end.mjs` on SessionEnd
- `project-memory-posttool.mjs` on PostToolUse

If any are missing, OMC's structure has changed since 2026-05-18 — pause the plan and re-survey before continuing.

- [ ] **Step 6: Capture the OMC hook inventory as a NEW baseline file, then commit**

The Task 1 baseline file `plugins-manifest.txt` reflects pre-OMC state and should NOT be modified. Instead, add a new file `omc-hooks-inventory.txt` to the same directory documenting the hooks OMC registered (the 20 hooks across 11 events from Task 2 Step 5).

```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" add docs/omc-integration-baseline-2026-05-18/omc-hooks-inventory.txt
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" commit -m "chore(omc): install OMC plugin + record post-install hooks inventory"
```

---

## Task 3: Apply OMC hook surgery (project-scoped settings)

**Files:**
- Create: `c:\Users\riley\Cursor\perfectlyhuman\seek\.claude\settings.local.json` (testbed only — do NOT propagate to other projects)

**Context:** Claude Code settings cascade: user-global (`~/.claude/settings.json`) → project (`.claude/settings.json`, committed) → local (`.claude/settings.local.json`, gitignored). To keep OMC available globally but trimmed *only* in the Seek testbed, we put hook overrides in Seek's `settings.local.json`. The exact override key for disabling a plugin hook is `hooks.<EventName>.disable` (verify this against Claude Code docs — see Step 1 below).

- [ ] **Step 1: Verify the settings override syntax**

**Verified outcome (2026-05-18, commit `319bbf5` in Seek):** Claude Code does NOT support `{ "hooks": { "<EventName>": { "disable": [...] } } }`. Plugin hooks merge additively. The only platform-level kill-switches are `disableAllHooks: true` (too broad — kills superpowers' hooks too) and `enabledPlugins: { "oh-my-claudecode@omc": false }` (too broad — kills OMC slash commands we want available on explicit invocation).

**Actual mechanism used:** OMC's own `OMC_SKIP_HOOKS` env var, exposed via Claude Code's `env` settings key.

```json
{
  "env": {
    "OMC_SKIP_HOOKS": "keyword-detector,skill-injector,wiki-session-end"
  }
}
```

**Coverage caveat (OMC 4.14.0):** Only `keyword-detector.mjs` honors `OMC_SKIP_HOOKS` at the script-level (verified at `scripts/keyword-detector.mjs:950-955`). `skill-injector.mjs` and `wiki-session-end.mjs` do not check the env var, but are dormant when their respective state dirs (`.omc/skills/`, `.omc/wiki/`) don't exist — declared in the env var anyway so a future OMC version that honors them picks the surgery up automatically. `persistent-mode.mjs` is intentionally left active because we want it when ralph/autopilot is explicitly invoked.

See `seek/.claude/settings.local.json.example` for the full file with `_notes` block documenting the trap.

- [ ] **Step 2: Write `seek/.claude/settings.local.json`**

See `seek/.claude/settings.local.json.example` for the actual committed template. Key shape:

```json
{
  "_notes": ["OMC hook surgery — see ai-dev-system/docs/omc-integration-plan-2026-05-18.md Task 3", "..."],
  "env": {
    "OMC_SKIP_HOOKS": "keyword-detector,skill-injector,wiki-session-end"
  }
}
```

**Status of each surgery target (OMC 4.14.0):**
1. `keyword-detector` — **fully neutralized** via env var (the highest-priority target — the magic-keyword auto-escalator).
2. `skill-injector` — declared in env var; OMC 4.14.0's standalone script doesn't honor it, but dormant in fresh Seek (no learned skills dir). Trap documented.
3. `persistent-mode` — **intentionally left active.** Required for explicit `/ralph` and `/autopilot`. Dormant when no `.omc/state/` files exist.
4. `wiki-session-end` — declared in env var; OMC 4.14.0's standalone script doesn't honor it, but dormant when no `.omc/wiki/` exists. Trap documented.

PostToolUse / SubagentStop verification hooks stay active — they reinforce superpowers' verification gate.

- [ ] **Step 3: Confirm `settings.local.json` is gitignored**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\seek
git check-ignore -v .claude/settings.local.json
```
Expected: output naming `.gitignore` line that matches. If NOT gitignored, add `.claude/settings.local.json` to Seek's `.gitignore` before continuing — never commit these.

- [ ] **Step 4: Smoke test — open a fresh Claude Code session in Seek**

In a new terminal:
```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\seek
claude
```
Then in the session, type the trigger phrase OMC's magic keywords used to catch:
```
build me a small test feature
```
Expected: superpowers' `brainstorming` skill fires, not OMC's autopilot. If OMC still escalates, the disable syntax in Step 1 is wrong — re-verify and patch.

- [ ] **Step 5: Commit the surgery (note: settings.local.json is gitignored)**

The surgery itself isn't committed. Instead, write a `c:\Users\riley\Cursor\perfectlyhuman\seek\.claude\settings.local.json.example` with the same content + a comment block explaining what it does, and commit that. Future-Riley copies the example to `.local.json`.

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\seek
Copy-Item .claude/settings.local.json .claude/settings.local.json.example
git add .claude/settings.local.json.example
git commit -m "chore(omc): document OMC hook surgery via settings.local.json.example"
```

---

## Task 4: Write the surface-conditions policy doc

**Files:**
- Create: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\documentation\workflows\autonomy-surface-conditions.md`

**Context:** Riley's pain point in current superpowers usage is being prompted for low-stakes decisions he treats as rubber-stamp ("approved/yes/proceed"). The whole reason phase-level autonomy is worth the integration cost is that it batches discipline upfront (brainstorming + plan) and reserves interruptions for moments where Riley's judgment is actually load-bearing. This doc is the canonical list.

- [ ] **Step 1: Write the policy file**

Full content to write:

```markdown
---
last_updated: 2026-05-18
updated_by: agent
version: initial
---

# Autonomy Surface Conditions

> **Purpose.** During a `/grind-phase` run, the orchestrator (OMC) and the per-task subagents (superpowers) operate without per-task human approval. This document defines the *only* conditions under which they must pause and surface to the human. Outside these conditions, "proceed" is the default — the agent's judgment is trusted.
>
> If a condition you encountered isn't on this list and you stopped anyway, the list is wrong, not your behavior — add it via `/update-docs` and explain why.

## MUST surface (pause + ask)

### Intent ambiguity

The task spec is open to multiple reasonable interpretations and your choice would materially change what the feature does. Not "which helper name is better" — that's your call. This is "did Riley want behavior A or B."

### Destructive operations

- Database schema changes (migrations, drops, type changes on populated columns)
- File or directory deletion beyond build artifacts
- `git push --force`, `git reset --hard` on tracked branches, branch deletion
- Dropping or rotating secrets
- Anything affecting external services (API keys, webhook URLs, DNS, billing config)
- Production data writes from a dev environment

### Chapter contradiction (Iron Law gate)

The proposed approach contradicts an existing Key Decision in `documentation/chapters/`. Do not override silently. Surface with: the chapter, the conflicting decision's *Why* and *Revisit if* lines, and what changed that you believe justifies revisiting.

### Plan deviation

You are about to do something not in the approved phase plan. Small refactors discovered mid-task are fine if they support the planned task. Net-new tasks, scope expansion, or skipping a planned task are not.

### External blocker

Missing credential, missing infra (database not provisioned, queue not created), failing third-party service. Surface with the specific error, the missing piece, and what you need from Riley.

### Stalled verification loop

A test or verification has failed and your fix-loop (ralph-style) has iterated N times without convergence. Default cap: 5 iterations per failing assertion. Surface with: what the test asserts, every fix you tried, every error you got, and your current hypothesis about the root cause.

### Budget cap reached

Token spend or wall-clock time for the current phase has crossed the configured cap. Surface with current spend, remaining tasks, and projected total if continued.

## MUST NOT surface (just decide)

### Implementation style choices
- Helper extraction, naming, file organization
- "Approach A or B, both reasonable" with no chapter conflict
- Whether to add a defensive check (default: only at trust boundaries per CLAUDE.md)
- Comment density (default: none per CLAUDE.md)

### Routine completion moments
- Tests pass → commit, don't ask
- Edge case discovered + handled → write a Learning entry, don't ask
- Task complete → move to next task, don't ask

### Tooling micro-decisions
- Test framework configuration tweaks
- Linter rule satisfaction
- Format/whitespace
- Import ordering

## How to surface

When a MUST-surface condition fires:
1. Stop work on the current task — do not partially apply changes.
2. Report: which condition, what triggered it, what you'd do by default, what you need from Riley.
3. Wait. Do not retry or escalate to "best guess."
4. After Riley responds, write a Learning entry if the resolution was non-obvious.

## Iron Laws

- **NO MID-PHASE WORK CONTINUES PAST A MUST-SURFACE CONDITION WITHOUT EXPLICIT HUMAN INPUT.**
- **NO MUST-NOT-SURFACE INTERRUPTION IS ALLOWED.** Asking Riley to rubber-stamp a routine decision is a bug, not a courtesy.
- **NO SURFACE CONDITION IS ADDED OR REMOVED WITHOUT `/update-docs` AND A WHY.**

Violating the letter of these laws is violating the spirit of them.

## Related

- [grind-phase skill](../../.claude/skills/grind-phase.md)
- [update-docs skill](../../.claude/skills/update-docs.md)
- [SYSTEM.md three-layer architecture](../../../SYSTEM.md)
```

- [ ] **Step 2: Commit**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add solo/documentation/workflows/autonomy-surface-conditions.md
git commit -m "docs(omc): autonomy surface-conditions policy"
```

---

## Task 5: Create the `/grind-phase` skill

**Files:**
- Create: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\skills\grind-phase.md`
- Create: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\commands\grind-phase.md`

**Context:** This is the heart of the plan. `/grind-phase <phase>` reads a Phase from the project's ROADMAP, verifies preconditions, hands off to OMC's `team` mode (or `ralph` for verify-heavy work), and shepherds the autonomous run with surface-condition checks. The skill file is the body; the command file is the slash-command alias matching ai-dev-system's existing pattern (see `solo/.claude/commands/start.md` etc.).

- [ ] **Step 1: Write the skill body**

Create `solo/.claude/skills/grind-phase.md` with:

````markdown
---
description: "Use after a Phase plan has been brainstormed, written, and approved — runs the whole Phase autonomously via OMC orchestration with superpowers running inside each task. Long autonomous run, batched discipline upfront, minimal mid-run interruptions."
user_invocable: true
---

# /grind-phase — Run an entire Phase autonomously

**Announce at start:** "I'm using the /grind-phase skill to execute Phase {{name}} end-to-end."

## When to use

- A Phase from `documentation/ROADMAP.md` has been planned in detail via `superpowers:writing-plans`.
- The plan lists every task with acceptance criteria.
- Riley has explicitly approved the plan.
- The repo is in a clean state (no uncommitted changes).

**Do NOT use** if any of the above is false. `/grind-phase` is the autonomous execution step — it does no planning of its own.

## Why this skill exists

Without `/grind-phase`, autonomous work happens at the task level: superpowers' `subagent-driven-development` runs a task, returns to the human, runs the next task. Between every task is a rubber-stamp moment. `/grind-phase` is the higher-altitude wrapper that drives the task loop using OMC's `team` orchestration, so Riley spends one large block on planning and gets a completed Phase back instead of a stream of approval requests.

## Iron Laws

- **NO PHASE RUN STARTS WITHOUT A WRITTEN, APPROVED PHASE PLAN.** Verbal "yeah do it" doesn't count — there must be a plan document with tasks and acceptance criteria, and Riley must have OK'd it.
- **NO TASK COMPLETES WITHOUT `/update-docs` RUNNING ON IT.** Chapter writes happen per task, not at phase boundary. If the run is interrupted, chapters are still current up to the last completed task.
- **NO SURFACE-CONDITION TRIGGER IS BYPASSED.** See `documentation/workflows/autonomy-surface-conditions.md`. The list is exhaustive; if it fires, you stop.
- **NO PHASE RUN PUSHES, MERGES, OPENS A PR, OR CLOSES AN ISSUE.** `/ship` is human-gated and is invoked manually after the phase completes.

Violating the letter of these laws is violating the spirit of them.

## Execution Steps

### 1. Load configuration

Read `.claude/project.json`. Confirm:
- `launch.status` — if `"live"`, double-check that the phase plan accounts for the 3-tier branch pipeline.
- `documentation.root`, `documentation.chapters` — for chapter access.
- `testing.quick` — the verification command to run per task.

### 2. Resolve the Phase

The first argument to `/grind-phase` is the Phase identifier. Find it in:
1. `documentation/ROADMAP.md` (look for `## Phase {{name}}` or matching heading).
2. The most recent plan document in `docs/superpowers/plans/` or `docs/` matching the phase name.

If the Phase has no plan document, STOP. Surface: "No plan found for Phase X. Write one via `superpowers:writing-plans` first."

### 3. Pre-flight checks

<VERIFICATION-GATE>

- [ ] Repo is clean. `git status --short` returns nothing.
- [ ] Phase plan is locked. The plan document exists and is not labeled "draft" or "WIP".
- [ ] Every task in the plan has acceptance criteria. If any task says "TBD" or "figure out," STOP — the plan is incomplete.
- [ ] Chapter survey complete. For each task in the phase, grep `documentation/chapters/` for terms relevant to the task. If any task's proposed approach contradicts an existing Key Decision, surface (chapter-contradiction surface condition).
- [ ] Budget caps configured. If `.claude/project.json` has no `autonomy.budget` block, use defaults: 5 ralph iterations per failing test, 60-minute wall-clock cap per phase.

If any check fails, STOP and report which one.

</VERIFICATION-GATE>

### 4. Hand off to OMC's team mode

Invoke OMC's `team` skill with the phase plan as input. The orchestration pattern:

```
team-plan (consumes the existing phase plan, doesn't re-plan)
  → for each task:
      ├─ dispatch via superpowers:subagent-driven-development
      │    (implementer subagent runs TDD, spec-reviewer + quality-reviewer review,
      │     verification-before-completion runs tests)
      ├─ run /update-docs scoped to this task's affected chapters
      ├─ commit with message: "feat({{phase}}): {{task title}}"
      └─ check surface conditions — if any fire, STOP
  → team-verify (run full project test suite, not just per-task)
  → team-fix (ralph loop if anything broke at phase level — capped per Iron Law)
```

**Critical:** the per-task review must use superpowers' agents (spec-reviewer, quality-reviewer) and NOT OMC's `code-reviewer` agent. They look similar; they're not the same. Superpowers' agents enforce TDD + verification-before-completion, which is the discipline we're preserving.

### 5. Monitor surface conditions throughout

The autonomy-surface-conditions doc is the source of truth. The most common firings during a phase:

- **Chapter contradiction** — a task's proposed approach hits an existing micro-ADR with `Revisit if` conditions not met. Surface.
- **Stalled verify loop** — ralph capped at N iterations without convergence. Surface with full diagnostic context.
- **External blocker** — missing API key or unprovisioned service. Surface with the exact error.

When surfacing: STOP work, do NOT partially commit, report cleanly, wait.

### 6. Phase complete — close out

When the last task in the phase passes its acceptance criteria and the phase-level verify is green:

- [ ] Run a final chapter sweep — every Key Decision made during the run has a `Revisit if` line; every debugging session has a Learning entry.
- [ ] Report: tasks completed, total token spend, total wall-clock, surface-condition firings (if any), chapter writes by domain.
- [ ] Do NOT push. Do NOT open PR. Do NOT close issues. Surface: "Phase X complete. Run `/ship` when ready."

## Red Flags — STOP

- "The plan was 'mostly' complete, I'll fill in the rest as I go" — NO, surface and ask.
- "Token budget is close, I'll just push through" — NO, surface and ask for a cap raise.
- "The chapter says X but I think Y is better now" — NO, surface chapter-contradiction. The `Revisit if` line decides.
- "Tests are flaky, I'll skip and document" — NO, stalled verify loop = surface.
- "User said earlier 'just do it' so I'll skip the surface-condition check" — NO, blanket prior approval doesn't override situational gates.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Surface conditions slow me down" | They fire rarely if the plan is good. If they fire often, the plan was rushed. |
| "I can fix the test flake instead of surfacing" | Maybe. If it's <5 ralph iterations away, fine. Past that, you're guessing — surface. |
| "Riley said 'autonomous' so don't bother him" | Riley said autonomous *within the surface-condition policy*. Outside it, ask. |
| "It's just a small schema change" | Schema changes are MUST-surface, regardless of size. |

## Related

- [autonomy-surface-conditions](../../documentation/workflows/autonomy-surface-conditions.md)
- [update-docs](./update-docs.md)
- [SYSTEM.md](../../../SYSTEM.md)
- superpowers: `subagent-driven-development`, `test-driven-development`, `verification-before-completion`
- OMC: `team`, `ralph`, `verify-deliverables.mjs`
````

- [ ] **Step 2: Write the slash-command file**

Create `solo/.claude/commands/grind-phase.md` mirroring ai-dev-system's existing pattern (see `solo/.claude/commands/start.md` for the precedent). The command file is the slash-command entrypoint that invokes the skill.

Content:

```markdown
---
description: "Run an entire Phase autonomously via OMC orchestration. Use only after a Phase plan has been brainstormed, written, and approved."
---

# /grind-phase

Invoke the grind-phase skill from `solo/.claude/skills/grind-phase.md`. First argument: phase identifier (matches a heading in `documentation/ROADMAP.md`).

Example:
```
/grind-phase content-pipeline
```

See `solo/.claude/skills/grind-phase.md` for execution details and surface conditions.
```

- [ ] **Step 3: Verify both files are discoverable**

```powershell
Get-ChildItem c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\skills\grind-phase.md
Get-ChildItem c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\commands\grind-phase.md
```
Expected: both files exist.

- [ ] **Step 4: Commit**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add solo/.claude/skills/grind-phase.md solo/.claude/commands/grind-phase.md
git commit -m "feat(omc): add /grind-phase skill for phase-level autonomous runs"
```

---

## Task 6: Extend `/update-docs` to ingest OMC wiki

**Files:**
- Modify: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\skills\update-docs.md`
- Modify: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\.claude\commands\update-docs.md`

**Context:** OMC's `wiki` skill auto-captures session-level discoveries to `.omc/wiki/*.md` — categorized into architecture / decision-patterns / debugging / environment / session-logs. Most of that is working memory (ephemeral noise). Some of it is genuinely durable insight that belongs in `documentation/chapters/` as a micro-ADR or Learning. The extension makes `/update-docs` a promotion ceremony: scan the wiki delta since last run, classify entries, promote the durable ones into chapters.

This step must be additive — if `.omc/wiki/` doesn't exist (project never used OMC), `/update-docs` runs exactly as it does today.

- [ ] **Step 1: Read the current `/update-docs` skill**

Already read in plan-preparation (`solo/.claude/skills/update-docs.md`). Note the existing structure: Iron Laws, Execution Steps 1-7, Red Flags, Rationalizations, Rules. We're adding a new step between current Step 1 (Identify Scope) and current Step 2 (Read Current Documentation), and adding a related Iron Law.

- [ ] **Step 2: Add the wiki-ingest step to the skill**

Edit `solo/.claude/skills/update-docs.md`. After the current `## When to Use` section and before `## Execution Steps`, add a new optional step. The cleanest insertion is to renumber: current Step 1 becomes Step 2, and the new Step 1 is "Wiki Pre-Scan".

New Step 1 content to insert:

````markdown
### 1. Wiki Pre-Scan (only if OMC is active)

If `.omc/wiki/` exists in the project root:

- [ ] List wiki entries created or modified since the last `/update-docs` run. Compare wiki file `mtime` against the `last_updated` of the most recently touched chapter.
- [ ] For each new wiki entry, classify it into one of:
  - **Promote to chapter (Key Decision)** — a decision with rationale and a recognizable *Why*. Convert to micro-ADR format (Context / Options / Decision / Why / Consequences / Revisit if) and append to the relevant chapter's Key Decisions section.
  - **Promote to chapter (Learning)** — a bug, wrong assumption, or gotcha. Convert to the Learning format (Problem / Wrong Assumption / Reality / Solution / Prevention) and append to the relevant chapter's Learnings & Gotchas section.
  - **Promote to skill** — a recurring pattern worth becoming a reusable skill. Propose a skill file under `solo/.claude/skills/` and surface to Riley before writing.
  - **Archive** — session-log noise, dead ends not worth keeping. Move to `.omc/wiki/archive/`.

The wiki schema is lighter than chapters' — most wiki entries will need fields invented at promotion time (Riley's input may be needed to fill *Why*, *Consequences*, *Revisit if* if the wiki entry didn't capture them).

If a wiki entry can't confidently be classified, surface it to Riley.

If `.omc/wiki/` does not exist, skip this step entirely. No warning, no error.
````

Renumber subsequent steps: 2 → Identify Scope, 3 → Read Current Documentation, etc.

- [ ] **Step 3: Add the wiki Iron Law**

Add a new Iron Law to the existing list:

```markdown
- **NO WIKI ENTRY IS LEFT UNCLASSIFIED.** If `.omc/wiki/` is scanned, every new entry is promoted, archived, or surfaced to Riley. No silent skips.
```

- [ ] **Step 4: Update the Red Flags table**

Add:

```markdown
- About to run `/update-docs` while `.omc/wiki/` has unprocessed entries — ALWAYS scan wiki first.
```

- [ ] **Step 5: Mirror the change in the command file**

Edit `solo/.claude/commands/update-docs.md` to reference the new step ordering. The command file is short — usually just a pointer to the skill. Confirm it doesn't duplicate content that would now be out of sync.

- [ ] **Step 6: Commit**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add solo/.claude/skills/update-docs.md solo/.claude/commands/update-docs.md
git commit -m "feat(omc): /update-docs ingests .omc/wiki/ as promotion candidates"
```

---

## Task 7: Update SYSTEM.md with the three-layer architecture

**Files:**
- Modify: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\SYSTEM.md`

**Context:** SYSTEM.md is ai-dev-system's top-level reference. After this integration, a fresh reader needs to understand that ai-dev-system is the top of a three-layer stack, that superpowers sits in the middle, that OMC is opt-in at the base, and which slash commands route to which layer.

- [ ] **Step 1: Add the architecture section**

Insert a new section after the existing "## Philosophy" section and before "## The Three Pillars". Content:

````markdown
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
````

- [ ] **Step 2: Commit**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add SYSTEM.md
git commit -m "docs(omc): three-layer architecture section in SYSTEM.md"
```

---

## Task 8: Write the rollback procedure

**Files:**
- Create: `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\documentation\workflows\omc-rollback.md`

**Context:** Riley explicitly asked whether this integration is reversible. The answer is yes, and writing the exact procedure now (before we depend on it) means we don't have to invent it under stress later.

- [ ] **Step 1: Write the rollback doc**

Content:

````markdown
---
last_updated: 2026-05-18
updated_by: agent
version: initial
---

# OMC Rollback Procedure

> **When to use this doc.** If the OMC integration isn't working out — too much noise, too much cost, surface conditions don't fire correctly, or you just want your old workflow back — this is how to undo it cleanly.

## Reversibility summary

| Component | Reversal cost |
|-----------|---------------|
| OMC plugin install | Trivial — `/plugin uninstall` |
| Per-project `.omc/` directory | Trivial — delete |
| HUD / statusline | Trivial — settings.json revert |
| `.claude/settings.local.json` overrides | Trivial — delete file |
| `/grind-phase` skill | Trivial — git revert in ai-dev-system |
| `/update-docs` wiki-ingest extension | Trivial — git revert; gracefully no-ops without `.omc/wiki/` |
| Chapter entries promoted from wiki | Permanent — these are now part of the institutional memory regardless of OMC's state |
| Code OMC autonomously wrote during a phase run | Permanent unless `git revert` — normal commit history applies |

## Full rollback procedure (in order)

### 1. Stop any in-progress autonomous run

If `/grind-phase` is currently running, interrupt the session. Wait for the agent to checkpoint (commit any completed task) before killing.

### 2. Uninstall OMC

In a Claude Code session:
```
/plugin uninstall oh-my-claudecode
/plugin marketplace remove Yeachan-Heo/oh-my-claudecode
```

Verify:
```
/plugin list
```
Expected: `oh-my-claudecode` no longer appears.

### 3. Remove per-project OMC state

For each project where OMC was active (initially: Seek only):
```powershell
Remove-Item -Recurse -Force "c:\Users\riley\Cursor\perfectlyhuman\seek\.omc"
Remove-Item -Force "c:\Users\riley\Cursor\perfectlyhuman\seek\.claude\settings.local.json" -ErrorAction SilentlyContinue
```

### 4. Revert ai-dev-system changes (if desired)

If you want to roll ai-dev-system back to its pre-OMC state too (note: ai-dev-system's default branch is `master`, not `main`):
```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" checkout master
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" branch -D feat/omc-integration   # only if you're done with the branch entirely
```

If the branch was merged, identify the merge commit and revert it:
```powershell
git log --oneline --grep="omc"
git revert <merge-sha>
```

**Note:** This removes `/grind-phase` and the wiki-ingest step in `/update-docs`. Existing chapter entries (including any promoted from OMC wiki) remain — they're indistinguishable from regular chapter content.

### 5. Verify settings rolled back cleanly

There is no full settings snapshot to diff against — baseline is the redacted `plugins-manifest.txt`. Check structurally:

```bash
grep -i "oh-my-claudecode" "$HOME/.claude/settings.json"
```
Expected: no matches. If any remain, the uninstall didn't fully clean the `enabledPlugins` block — edit `~/.claude/settings.json` by hand to remove the orphan entry.

Compare the live plugin list against the baseline manifest:
```bash
diff <(grep -A 20 "enabledPlugins" "$HOME/.claude/settings.json" | head -30) <(grep -A 20 "Enabled" "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/plugins-manifest.txt")
```
Trivial diff in formatting is fine. The plugin entries should match what's in the baseline manifest.

### 6. Verify baseline behavior

Open a fresh Claude Code session in any project. Confirm:
- `/start` and `/finish` work normally.
- `/update-docs` runs without the wiki-pre-scan step (or runs the step and finds no `.omc/wiki/`, which is also fine — it no-ops).
- superpowers' `brainstorming` triggers on creative requests, with no magic-keyword interference.

## Partial rollbacks

### Keep `/grind-phase` but disable OMC

Possible — `/grind-phase` should detect OMC's absence and fall back to per-task superpowers execution (essentially behaving like `subagent-driven-development` invoked directly). Verify this fallback works during smoke testing (Task 9 in the integration plan).

### Keep OMC but disable autonomy

Delete `.claude/settings.local.json` from a project but keep the plugin installed. Without the surgery overrides, OMC's defaults take over — which means magic-keyword escalation and `persistent-mode.mjs` are active. This is **not recommended** because it loses the surgery that made OMC compatible with superpowers' discipline.

If you want OMC's wiki / skillify / HUD without the autonomy modes, write a targeted `settings.local.json` that disables only the autonomy hooks (`persistent-mode`, `keyword-detector`, `skill-injector`) and leaves the rest.

## Related

- [omc-integration-plan-2026-05-18.md](../../../docs/omc-integration-plan-2026-05-18.md) — the original integration plan
- [autonomy-surface-conditions.md](./autonomy-surface-conditions.md)
- [SYSTEM.md](../../../SYSTEM.md)
````

- [ ] **Step 2: Commit**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add solo/documentation/workflows/omc-rollback.md
git commit -m "docs(omc): rollback procedure"
```

---

## Task 9: Smoke test — define the test Phase in Seek

**Files:**
- Modify (optional): `c:\Users\riley\Cursor\perfectlyhuman\seek\documentation\ROADMAP.md` — add or designate a small test phase
- Create: a Phase plan via `superpowers:writing-plans` saved to `c:\Users\riley\Cursor\perfectlyhuman\seek\docs\superpowers\plans\YYYY-MM-DD-<phase-name>.md`

**Context:** We need a real, small, low-stakes Phase to run `/grind-phase` against. Seek is pre-launch, so blast radius is low. The Phase should be 3-5 tasks, with clear acceptance criteria, ideally on a domain that already has a chapter (so chapter-survey gates can actually fire and be observed).

- [ ] **Step 1: Pick a candidate Phase from Seek's ROADMAP**

Read `c:\Users\riley\Cursor\perfectlyhuman\seek\documentation\ROADMAP.md`. Identify an unstarted Phase with 3-5 small tasks. Confirm:
- It has acceptance criteria.
- It doesn't touch external services (payments, deployment, third-party APIs) — keep blast radius low.
- It exercises at least one existing chapter (so chapter-survey gates have material to work with).

If no such Phase exists, surface to Riley: "No suitable test Phase found in Seek ROADMAP. Options: (a) define a synthetic 3-task phase specifically for the smoke test, (b) pick a phase that does touch external services with the caveat of higher blast radius."

- [ ] **Step 2: Run `superpowers:brainstorming` + `superpowers:writing-plans` for the chosen Phase**

Per the Iron Law that `/grind-phase` won't run without a written, approved plan. This is the upfront discipline block — expect a long brainstorming + planning session here. Output: a plan document in `seek/docs/superpowers/plans/`.

- [ ] **Step 3: Get explicit approval from Riley**

Present the plan. Wait for explicit "approved, run it." Do not auto-proceed.

- [ ] **Step 4: Commit the plan**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\seek
git add docs/superpowers/plans/
git commit -m "plan(<phase-name>): plan written and approved for /grind-phase smoke test"
```

---

## Task 10: Run `/grind-phase` on the test Phase

**Files:**
- Modified (autonomously, during the run): whatever the test phase's tasks touch
- Modified (per task): relevant chapters in `seek/documentation/chapters/`

**Context:** This is the live integration test. Riley invokes `/grind-phase <phase-name>` and observes. Success = all tasks complete, chapters updated, no false-positive surface conditions, all true-positive surface conditions fired. Failure modes are themselves data — capture them.

- [ ] **Step 1: Verify Seek is in clean state**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\seek
git status --short
git checkout -b feat/grind-phase-smoke-test
```
Expected: clean working tree, new branch checked out.

- [ ] **Step 2: Invoke `/grind-phase`**

In a fresh Claude Code session in Seek:
```
/grind-phase <phase-name>
```

Watch for:
- Pre-flight checks fire (Task 5, Step 3 in this plan) — clean state, plan locked, chapter survey.
- OMC team mode invocation — confirm it's `team` and not something that bypasses superpowers' per-task agents.
- Per-task TDD inside each subagent.
- `/update-docs` running per task — chapters should accumulate entries as the run progresses.
- Commit stream — one commit per task with a recognizable message pattern.

- [ ] **Step 3: Observe surface conditions**

If a MUST-surface condition fires, verify it was correctly identified (intent ambiguity, destructive op, chapter contradiction, plan deviation, hard blocker, stalled verify, budget cap). Respond. Note for the post-mortem whether the firing was useful or a false positive.

If a MUST-NOT-surface "should I extract this helper?"-style prompt fires, that's a bug. Note it for the post-mortem.

- [ ] **Step 4: Wait for phase completion or hard stop**

Don't intervene unless surface-conditioned to. Riley's job during this run is observer + responder, not co-pilot.

- [ ] **Step 5: Inspect outputs**

When the phase reports complete:
- [ ] `git log --oneline` — one commit per task, sane messages.
- [ ] `git diff main` — review the full delta.
- [ ] Test suite — run `pnpm typecheck && pnpm lint:fix && pnpm format:fix` (Seek's `testing.quick`). Should pass cleanly.
- [ ] Chapters — every modified chapter has a *Why* on new entries; Learnings have all five fields.
- [ ] `.omc/wiki/` — any entries that should have been promoted by `/update-docs` but weren't.

---

## Task 11: Post-mortem and capture learnings

**Files:**
- Modify: relevant chapters in `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\solo\documentation\chapters\` (the meta-chapter on tooling, if it exists; create one if not)
- Modify: this plan (`docs/omc-integration-plan-2026-05-18.md`) with a closeout section

- [ ] **Step 1: Run `/update-docs` on the smoke test**

In a Claude Code session, invoke `/update-docs`. The wiki-ingest step (Task 6) should scan `.omc/wiki/`. Verify it promotes durable entries and archives noise.

- [ ] **Step 2: Capture meta-learnings about the integration itself**

In ai-dev-system, write or extend a chapter `solo/documentation/chapters/tooling.md` (or whatever covers dev-system meta) with:
- The decision to layer OMC under superpowers (micro-ADR with full Why / Consequences / Revisit if).
- Any Learnings from the smoke test: false-positive surfaces, missed surfaces, OMC surprises, hook-config gotchas.
- Calibration data: how many tasks ran cleanly, where ralph stalled, token cost per task, wall-clock per task.

- [ ] **Step 3: Decide on phase size**

Based on smoke test data, pick the next phase size. If the 3-5-task run was clean, next test is 8-12 tasks. If it surfaced a lot, next test stays small and we tighten the policy first.

- [ ] **Step 4: Commit the closeout**

```powershell
cd c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system
git add solo/documentation/chapters/ docs/omc-integration-plan-2026-05-18.md
git commit -m "docs(omc): smoke test post-mortem and learnings"
```

- [ ] **Step 5: Decide: merge the feat/omc-integration branch, or extend the experiment**

If the smoke test cleared, merge `feat/omc-integration` into ai-dev-system's `master` (requires Riley's explicit "yes, merge"). If the smoke test surfaced material issues, keep the branch open and iterate.

---

## Self-Review

### Spec coverage

- ✅ Three-layer architecture documented (Task 7)
- ✅ Phase-level autonomy via OMC `team` (Task 5)
- ✅ Surface conditions explicit and minimal (Task 4)
- ✅ Chapters remain canonical, wiki feeds them (Task 6)
- ✅ Rollback procedure pre-written (Task 8)
- ✅ Testbed scoped to Seek pre-launch, not live projects (Task 9)
- ✅ Iron Laws preserved (no autonomous push/merge/PR/issue-close, no /update-docs skip, no chapter-contradiction silent override)
- ✅ Pre-flight baseline captured for rollback (Task 1)
- ✅ Smoke test before any broader rollout (Tasks 9-10)
- ✅ Post-mortem feeds calibration of next phase size (Task 11)

### Placeholder scan

Searched the plan for "TBD", "TODO", "implement later", "fill in details", "similar to Task N" — none found that aren't deliberately user-input dependent (phase name in Task 9, testbed-specific paths). Phase identifier in Task 9 is intentionally open because the testbed phase is Riley's pick.

### Type/path consistency

- All paths use `c:\Users\riley\Cursor\perfectlyhuman\...` absolute form consistently.
- Skill files always go to `solo/.claude/skills/`, command files to `solo/.claude/commands/`, workflows to `solo/documentation/workflows/` — consistent with the existing ai-dev-system layout verified at plan-prep time.
- `/grind-phase` references `documentation/workflows/autonomy-surface-conditions.md` in both Task 4 and Task 5 — same path.

---

## Execution Handoff

Plan complete and saved to `c:\Users\riley\Cursor\perfectlyhuman\ai-dev-system\docs\omc-integration-plan-2026-05-18.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best fit because most tasks are isolated (one config change, one new file, one test).

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints. Best fit if you want to watch every step as it happens.

Which approach?
