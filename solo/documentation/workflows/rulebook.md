---
last_updated: 2026-06-26
updated_by: agent
version: v2
---

# The Rulebook — one policy, two executors

> This is the single escalation + ownership policy for this project. **Both executors obey it:** Riley working locally in Claude Code, and the cloud agent (Gilfoyle) draining the ROADMAP in the background. It merges what used to be three separate documents (the Iron Laws, the autonomy surface conditions, and the Banks CONTRACT gate policy) into one.

## The model

The `ROADMAP.md` is a single shared work queue. Each task row carries two controlled-vocabulary fields so ownership and gating are deterministically parseable.

### `Owner` (who does the task)

- `agent` — the cloud agent may pick this up autonomously.
- `riley` — needs Riley: design, judgment, a decision, or a creative call.

### `Gate` (what approval the task needs)

Closed vocabulary. An **unknown token must be treated as "gate it / ask"** — never guessed past.

| `Gate` value | Meaning | Who clears it |
|---|---|---|
| `—` | none | autonomous-eligible (with `Owner: agent`) |
| `prod-promotion` | a production deploy (`preview → main` when live) | Riley |
| `destructive` | irreversible op — DB/schema migration, data deletion, history rewrite | Riley (always; never forced through) |
| `decision` | a product/architecture choice with no single right answer | Riley |
| `reserved` | tunable: secrets/auth, new cost-incurring resources, customer-facing copy/email | Riley (default) |

**`Owner: agent` + `Gate: —` = autonomous-eligible.** Anything else needs Riley.

## When the agent must STOP and surface (MUST-surface conditions)

Outside these, "proceed" is the default — the agent's judgment is trusted. If a condition you hit isn't listed and you stopped anyway, the list is wrong, not your behavior — add it via `/update-docs` with a why.

- **Intent ambiguity** — the spec admits two reasonable interpretations that would materially change behavior (not "which helper name" — that's your call).
- **Destructive operations** — schema/migrations, deletions beyond build artifacts, `git push --force` / `git reset --hard` on tracked branches, dropping/rotating secrets, anything touching external services (API keys, webhooks, DNS, billing), prod data writes from dev.
- **Chapter contradiction** — the approach contradicts an existing Key Decision in `chapters/`. Surface the chapter, the decision's *Why* + *Revisit if*, and what changed. Never override silently.
- **Plan deviation** — net-new task, scope expansion, or skipping a planned task. (Small supporting refactors mid-task are fine.)
- **External blocker** — missing credential/infra, failing third-party service. Surface the exact error + what you need.
- **Stalled verification loop** — a fix-loop has iterated past the cap (default 5 per failing assertion) without converging. Surface what it asserts, every fix tried, every error, current hypothesis.
- **Budget cap reached** — token/wall-clock cap for the run crossed. Surface spend + remaining + projection.

## When the agent must NOT surface (just decide)

Asking Riley to rubber-stamp a routine decision is a bug, not a courtesy.

- Implementation style: helper extraction, naming, file organization, "A or B both reasonable" with no chapter conflict, defensive checks (only at trust boundaries), comment density (default none).
- Routine completion: tests pass → commit; edge case handled → write a Learning, don't ask; task done → next task.
- Tooling micro-decisions: test-config tweaks, linter satisfaction, formatting, import ordering.

## How to surface

1. Stop work on the current task — do not partially apply changes.
2. Report: which condition, what triggered it, what you'd do by default, what you need from Riley.
3. Park the task in-place: update the ROADMAP row with what's done + the precise blocker, append a line to `AUTONOMY-INBOX.md`, ping Telegram, and MOVE ON to the next eligible task.
4. Never force a non-negotiable gate (a `destructive` op is always parked, even if parking empties the queue).

## The standing Iron Laws (apply to every interaction, both executors)

- **No approach proposed without first checking `chapters/` for prior decisions and learnings.**
- **No debugging without first checking the relevant chapter's Learnings & Gotchas.**
- **No work marked complete without `/update-docs`** (decisions + learnings captured).
- **No deploy without fresh test/gate output in the same message as the deploy action.**
- **No push, merge, PR, or issue-close past a `Gate` without the gate cleared.**

Violating the letter of these laws is violating the spirit of them.

## Related

- `../ROADMAP.md` — the shared queue these rules route.
- `../../.claude/skills/update-docs.md` — how learnings get written.
- `AUTONOMY-INBOX.md` — where parked items land for `/start` to surface.
