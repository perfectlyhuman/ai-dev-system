---
description: "Open a work session. Read the latest HANDOFF, diff git since then, surface pending verifications, orient on roadmap state, recommend what to work on."
user_invocable: true
---

# /start — Open a work session

**Announce at start:** "I'm using the /start skill to open this session."

This is the canonical session-open ritual. Pair with `/finish` at session close.

## Why this skill exists

The bridge between sessions is fragile. Without ceremony, fresh Claude reads CLAUDE.md + MEMORY.md and dives in — missing yesterday's HANDOFF, the verifications it queued, and any work that landed between sessions (Vercel auto-deploys, crons firing, the user pushing from another machine, etc.).

`/start` makes that bridge explicit:
1. Read what last-session left for next-session.
2. Detect what changed in the world since then that wasn't in the handoff.
3. Run any verifications the handoff queued.
4. Orient on roadmap + in-progress tasks.
5. Report tightly, recommend a next action, await direction.

## Execution Steps

### 1. Load Project Configuration

Read `.claude/project.json`. Note especially:
- `launch.status` — pre-launch vs live (changes ceremony level).
- `documentation.root` / `documentation.handoffs` — paths.
- `intake.provider` — external issue tracker (if any).

If `documentation.handoffs` is not in the schema, fall back to `<documentation.root>/handoffs/`.

### 2. Read the Latest Handoff

Read `<documentation.root>/HANDOFF.md`. Note:
- `last_updated` (from frontmatter).
- `session_summary` (one-liner).
- "Where to start next session" section.
- "Known leftovers" / "Pending verifications" sections.

**Staleness check.** If `last_updated` is more than 5 days ago, flag it loudly. Either Riley forgot `/finish` for several sessions, or there's been a real gap. Offer to do a backfill (next step covers the data).

### 3. Diff Git Against the Handoff Date

```bash
# Commits since the handoff was written
git log --oneline --since="<last_updated>"

# Anything uncommitted right now?
git status --short
```

If commits exist beyond the handoff's mention, surface them. These are things that landed without making it into the bridge — auto-deploys, cron-triggered work, your pushes from another machine, work I did at the very end of last session that I forgot to journal.

### 4. Run Queued Verifications

The handoff's "Where to start next session" section often queues verifications ("verify the nightly cron row landed at 06:00 PT", "check that the new env var is in Vercel prod", "confirm the GitHub workflow ran"). Read those carefully. If any is **automatable** (a SQL query, a `gh` command, a `vercel logs` check), run it now and report the result.

If a verification can't be automated (visual smoke test of a UI page, a manual check the user has to do), surface it as a TODO for the user, don't skip it silently.

### 5. Surface In-Progress Tasks

Run `TaskList`. Note any task marked `in_progress` from a prior session. Anything stale (in-progress > 1 day with no movement) gets flagged.

### 6. Cloud-Agent Status

Read `<documentation.root>/AUTONOMY-INBOX.md`. Surface every entry with `Status: open` —
each is something the cloud agent (Gilfoyle) parked for Riley (a gate or a surface
condition). These are the highest-priority "waiting on you" items.

Then read `.claude/project.json` `autonomy`:
- If `registered: false` — the project isn't on the engine yet (run the setup command's registration step, or it's intentionally local-only).
- If `registered: true` — report the readiness bar from `autonomy.readiness`: is the gate green, is there an agent-eligible ROADMAP task (`Owner: agent`, `Gate: —`), is the base branch set? If all true, the agent should be armed and draining; if not, name the missing condition.

### 7. Roadmap Orient

Read `<documentation.roadmap>`. Identify:
- Current phase + focus.
- Tasks marked 🔄 in-progress.
- Top 1-2 ⬜ ready-to-pick-up tasks with no unresolved dependencies.
- Blocked tasks (🚧) — what's blocking?

### 8. Report

Brief, actionable. Template:

```
## Session start — <DATE>

**Last handoff:** <last_updated> — <session_summary>

**Git delta since handoff:** <N commits> [list if <= 5; otherwise "see git log"]
**Uncommitted:** <yes/no with summary>

**Verifications run:**
- <verification> → <result>

**In-progress tasks:** <list or "none">
**Cloud agent:** <N parked items needing you | "armed, draining" | "dormant — missing: <condition>" | "not registered">

**Recommended next:** <pick from handoff's "Where to start" OR top ready task OR open question>

**Why this:** <one sentence justification>
```

End with a clear handoff to the user: "What do you want to work on?"

## Rules

- This is **read-only** for the project — do not modify roadmap, chapters, or memory in `/start`. Save mutations for `/finish`.
- Don't dive into work the user hasn't picked yet. /start orients, the user picks, then you go.
- If the handoff or the project state strongly implies a specific next move (e.g., a regression alert is queued, a verification failed), surface that loudly — but still await user direction before acting.
- If `documentation/HANDOFF.md` doesn't exist (fresh project, no prior session), fall back to roadmap + git only and note that no handoff was found.

## Related skills

- `/finish` — paired session-close ritual. Writes the handoff this skill reads.
- `/update-docs` — separate concern. Syncs ROADMAP / chapters / MASTER with shipped work. Not the same as the session bridge.
