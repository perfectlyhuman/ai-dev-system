---
description: "Close a work session. Compute session richness, archive prior HANDOFF, write a fresh HANDOFF.md as the bridge to the next session."
user_invocable: true
---

# /finish — Close a work session

**Announce at start:** "I'm using the /finish skill to close this session."

Pair with `/start` at the next session open. Writes the bridge so next-session-self isn't dependent on user memory.

## Why this skill exists

The HANDOFF.md bridge only works if it gets written. Left to ad-hoc discipline, it gets skipped on the sessions where it matters most (long ones, with implicit context). `/finish` makes the ceremony cheap and almost-automatic.

## The decision tree (the most important part of this skill)

Before writing anything, compute a **session richness signal**:

```bash
# Commits in this session (since last HANDOFF.md update)
git log --oneline --since="<HANDOFF.md last_updated>"

# Files changed
git diff --stat <HANDOFF.md last_updated>..HEAD
```

Also check TaskList for completions in this session.

Categorize:

- **HIGH signal:** new commits AND completed tasks AND meaningful diff (any of: >50 LOC changed, a new feature shipped, a migration applied, a deploy fired, a meaningful refactor landed). → Write a **full handoff**.

- **MEDIUM signal:** commits OR completed tasks, but not both / smaller diff (a single bug fix, a tweak, a few config changes). → Write a **focused handoff** — what shipped, what's next, what didn't make it to ROADMAP yet.

- **LOW signal:** no commits, no completed tasks, conversation was mostly exploration / Q&A. → **ASK before writing.** Present three options:
  1. "Skip — nothing to bridge." Confirm session close, remind to commit anything dirty.
  2. "Write a brief handoff." Capture exploration / learnings even though no code shipped.
  3. "Let me draft it." User dictates what's worth capturing.

NEVER silently skip on low signal. The "thought it was trivial, actually had a critical insight" failure mode is real.

## Execution Steps

### 1. Load Project Configuration

Read `.claude/project.json`. Resolve `documentation.handoffs` (fall back to `<documentation.root>/handoffs/` if not in schema).

### 2. Compute Session Richness

See decision tree above. Branch accordingly.

### 3. Generate the Handoff Content

For HIGH and MEDIUM signal sessions (or LOW when user said "write it"), produce a handoff with these sections:

```markdown
---
last_updated: <today, ISO date>
session_summary: "<one-line summary — what shipped or what advanced>"
---

# Handoff — <date> → next session

Read this before `/start`. <One-sentence framing of the session.>

## What just happened (this session)

| Shipped | Commits | What it is |
|---|---|---|
| <feature / fix / decision> | `<sha-short>` | <2-3 sentence description> |

## Durable learnings / gotchas worth remembering

<Only when this session surfaced something that would otherwise have to be re-learned.
Phrase as standing rules: "X always Y" / "Never do Z" / "When you see A, check B".>

## Where to start the next session

1. **Read this file.** Then `/start` will surface the rest.
2. <Specific verification to run if the session queued one — query a table, check a deploy, smoke a route.>
3. **Pick the next track:**
   - **Track A:** <option> — <why it's a reasonable next step>
   - **Track B:** <option> — <why>
   - (omit if there's a single obvious next move)

## Known leftovers — not blocking but worth tracking

- <thing>: <one-line description, link to issue / file / commit if applicable>

## Conventions worth re-reading

<Only when a convention came up THIS session that next-session might violate without the reminder.
Pull from memory's feedback-type entries, the architecture chapter's "Learnings & Gotchas", etc.>
```

**Rules for content:**
- The handoff is for **future-self orientation**, not a session diary. It overlaps with commit messages and ROADMAP journal entries but has a different angle: "what you need to know to pick up tomorrow", not "what got done."
- Surface durable gotchas (things that would cost time to re-learn) prominently.
- Be concrete: name commits, file paths, table names, env vars. Vague handoffs are worthless.
- 1-2 pages max. If it grows longer, the session was too big; consider whether some of the content belongs in ROADMAP journal or a chapter instead.

### 4. Archive the Prior Handoff

If `<documentation.root>/HANDOFF.md` exists:
- Read its `last_updated` from frontmatter.
- Copy to `<documentation.handoffs>/<last_updated>.md`.
- If that path already exists, append `-N` suffix until unique.

This preserves the timeline. A year from now, "what was the state in May?" is grep-able.

### 5. Write the Fresh Handoff

Write the generated content to `<documentation.root>/HANDOFF.md`. Confirm the user is satisfied with the "Where to start next session" recommendations — if they want a different framing, edit before close.

### 6. Suggest Follow-On Actions

After writing:
- Is there uncommitted work? Surface a commit reminder.
- Did big things ship this session that haven't made it to ROADMAP? Suggest `/update-docs` as the next step.
- Are there pending verifications the handoff just queued? Mention they'll get run at next `/start`.

### 7. Confirm Close

End with: "Handoff written. Safe to clear context."

## Rules

- **`/finish` does not auto-trigger `/update-docs`.** They're different concerns (session bridge vs persistent project record). Suggest, don't subsume.
- **`/finish` does not auto-commit.** Surface the reminder; the user decides whether to commit.
- For LOW-signal sessions, ALWAYS ask before writing a handoff. Silent skip loses context; auto-write creates noise.
- Don't write a handoff if the user explicitly says "skip handoff for this one" — confirm and exit.
- If `documentation/HANDOFF.md` doesn't exist (first /finish on a project), no archive step — just write the fresh handoff.

## Related skills

- `/start` — paired session-open ritual. Reads the handoff this skill writes.
- `/update-docs` — separate concern. Syncs ROADMAP / chapters / MASTER with shipped work.
