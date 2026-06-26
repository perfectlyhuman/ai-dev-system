---
description: "Pre-finish closeout report for a work session: what we're working on now, what's next, what we learned, and which docs need updating — a decision-aid to run before deciding whether to actually /finish."
user_invocable: true
---

# /closeout — Pre-finish closeout report

**Announce at start:** "I'm using the /closeout skill to produce a pre-finish closeout report."

`/closeout` is a **decision aid you run when you're tempted to `/finish`** but want a clear readout first. It reports where things stand, then recommends whether to actually close (`/finish`) or keep going.

**`/closeout` does NOT write `HANDOFF.md`, archive handoffs, or run the memory ritual — that is `/finish`'s job.** Closeout *reports and lightly tidies*; finish *formally closes*.

## Execution Steps

### 1. Gather Session Context

Read the boot surface (don't reload the whole repo):
1. `documentation/ROADMAP.md` — phase, forward plan, in-flight tasks.
2. `documentation/HANDOFF.md` — what the last session said.
3. `documentation/AUTONOMY-INBOX.md` — anything the cloud agent parked.

Check what actually changed:

```bash
git status --short
git log --oneline -15
```

Most important: **review THIS session's actual work and conversation** — what was done, decided, corrected, learned, left unfinished.

### 2. Produce The Report

Plain, scannable language. Four sections:

1. **What we're working on now** — active focus + its real state (live / in progress / blocked / paused), grounded in ROADMAP + session.
2. **What's next** — immediate next move(s), separating *what needs Riley* (gates, decisions) from *what the cloud agent can take autonomously* (`Owner: agent`, `Gate: —`). Then bigger-picture tracks.
3. **What we learned this session** — run the `/reflect` look-back: both **process/working-relationship** learnings and **technical** learnings.
4. **Documentation / updates needed** — assess honestly what should be recorded, and **do the clear, safe ones now** (don't just list).

### 3. Capture Learnings (lightweight — not the full /finish ritual)

Route via `/reflect`'s homes: project-local → `chapters/decisions/lessons` (apply obvious safe ones inline); cross-project behavioral → `~/.claude/CLAUDE.md` + memory (confirm sensitive items). **Do NOT** write `HANDOFF.md` or archive — leave the formal close to `/finish`.

### 4. Recommend: Finish, Or Keep Going

End with a clear, honest call:
- **`/finish` now** — if the session is at a genuine stopping point (work parked, learnings captured, next move is Riley's or a fresh effort).
- **Keep going** — if autonomous work is still on the table or a thread is mid-flight; name the specific next action. Do not default to `/finish` as an escape from work that could still be done now.

List any unresolved items (waiting-on-Riley gates, leftovers) so the call is informed.

## Rules

- A **report + light tidy**, not a close. Never writes `HANDOFF.md` / archives / runs the memory ritual.
- MAY apply clear, safe, durable updates proportionate to stakes; never sensitive/inferred canon without Riley's OK.
- Plain language, thorough not bloated.
- If it commits, commit ONLY documentation/state — never product code, never past a `Gate`.

## Related

- `/finish` — the formal close; run after `/closeout` if you decide to close.
- `/reflect` — the learning look-back this skill reuses.
- `/start` — opens the next session, reads the handoff `/finish` writes.
