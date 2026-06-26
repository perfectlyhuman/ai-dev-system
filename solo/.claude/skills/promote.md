---
description: "Promote preview → main (production). Run the gate on preview, open/merge the preview→main PR, watch the deploy + Sentry, report. The one Riley-gated, customer-facing moment."
user_invocable: true
---

# /promote — production promotion (preview → main)

**Announce at start:** "I'm using the /promote skill to promote preview → main."

The single irreversible, customer-facing action in the system. `main` is production (Vercel auto-deploys it). The cloud agent never reaches `main` — only you, via this. Everything else targets `preview`; `/promote` is how `preview` becomes production. This is the rulebook's `Gate: prod-promotion` moment.

## Execution Steps

### 1. Load config
Read `.claude/project.json`: `autonomy.gateCommand`, `git.mainBranch` (main), `git.previewBranch` (preview).

### 2. Confirm preview is green
Fetch latest. Run the gate command against `preview` (or confirm CI green on preview HEAD). Paste fresh output in THIS message — no "should be green." If red, STOP; do not promote.

### 3. Show the diff being promoted
`git log --oneline main..preview` + `git diff --stat main..preview`. Summarize what's shipping. Flag anything risky (migrations, env changes, customer-facing copy).

### 4. Open + merge the promotion PR
Open a `preview → main` PR; once required checks pass, merge it (respect branch protection; you're admin). Never force-push main.

### 5. Watch the deploy
Vercel auto-deploys `main`. Watch the deployment to ready, then check Sentry for new errors in the first minutes. Report deploy URL + status + any error spike.

### 6. Report
What shipped (commits), deploy status, Sentry status, anything to watch.

## Rules
- **Only Riley runs this.** Never auto-invoked; never the cloud agent.
- **No promote without fresh green gate output in this same message.**
- If the deploy fails or Sentry spikes, surface loudly and offer rollback (revert the merge / Vercel instant rollback).
- Never force-push; never bypass a red gate to "just ship it."

## Related
- `/start` — surfaces what's on preview waiting to promote.
- [rulebook](../../documentation/workflows/rulebook.md) — `Gate: prod-promotion` is this moment.
