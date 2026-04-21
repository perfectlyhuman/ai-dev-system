---
description: "Use when the project is about to go live — flipping from pre-launch (code on main, no ceremony) to live (feature branches, preview pipeline, real users affected by deploys)"
user_invocable: true
---

# /go-live - Transition from Pre-launch to Live

**Announce at start:** "I'm using the /go-live skill to transition this project from pre-launch to live."

The moment you flip from pre-launch to live is worth its own skill. The branch strategy changes, ceremony goes up, and blast radius of mistakes goes from zero to real. This skill handles the cutover cleanly.

## The Iron Laws

- **NO FLIP TO LIVE WITHOUT USER CONFIRMATION.** This is a one-way door (not literally, but operationally) — ceremony goes up after this point.
- **NO FLIP WHILE UNCOMMITTED CHANGES ARE IN THE TREE.** Clean state required.
- **NO FLIP WITHOUT DOCUMENTING IT** as a Decision in MASTER.md.

Violating the letter of these laws is violating the spirit of them.

## When to Use

- You're about to announce, launch, or open the product to real users.
- External customers start using production.
- Any moment when "a broken deploy affects someone besides me" becomes true.

**Do not use** just because you feel ready, or because features feel polished. The trigger is specifically *users exist in production*.

## Execution Steps

### 1. Pre-flight Checks

Read `.claude/project.json` — confirm `launch.status == "pre-launch"`. If already `"live"`, stop and report.

Check git state:
- Clean working tree? (`git status`)
- On main? (`git branch --show-current`)
- Main pushed? (`git log origin/main..HEAD` should be empty)

If any check fails, stop and resolve before proceeding.

### 2. Confirm with the User

Present:

```
## Ready to go live?

This will:
- Set launch.status from "pre-launch" → "live" in project.json.
- Record wentLiveAt as today.
- Ensure the `preview` branch exists and tracks main.
- Update MASTER.md Git Workflow section to highlight the live pipeline.
- Add a Decision entry to MASTER.md recording the cutover.

After this, /dev will create feature branches instead of committing to main,
and /ship will use the 3-tier feature → preview → main pipeline.

Proceed? (yes / no)
```

Wait for explicit "yes" before continuing.

### 3. Ensure Preview Branch Exists

```bash
# Check whether preview exists locally or remotely
git branch -a | grep -E "(origin/)?preview$"
```

If preview does not exist:
```bash
git checkout -b preview main
git push -u origin preview
git checkout main
```

If preview exists but isn't up-to-date with main, fast-forward it:
```bash
git checkout preview
git merge --ff-only main
git push origin preview
git checkout main
```

### 4. Update project.json

Flip the `launch` section:
```json
"launch": {
  "status": "live",
  "activeUsers": true,
  "wentLiveAt": "YYYY-MM-DD"
}
```

Use today's date as `wentLiveAt`.

### 5. Update MASTER.md

Two updates:

**a. Recent Major Decisions** — add a row:

```markdown
| YYYY-MM-DD | Went live — transitioned from pre-launch to live mode | Real users now depend on production; 3-tier pipeline protects them from broken deploys | MASTER.md (Git Workflow) |
```

**b. Confirm the Git Workflow section** still has both modes described (pre-launch + live). The template already does; verify it wasn't customized away.

### 6. Check In-Progress Work

Look at ROADMAP.md for any tasks marked 🔄 in-progress. For each:
- If the task is being worked on now, surface it to the user: "Task {id} is in progress. Under live mode it needs to move to a feature branch before continuing. Move it now or keep working on main until this task is done?"
- Document the chosen approach.

### 7. Commit the Changes

```bash
git add .claude/project.json documentation/MASTER.md
git commit -m "$(cat <<'EOF'
Go live: transition to live-mode git pipeline

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push origin main
```

### 8. Report Cutover Complete

```
## Live mode active

- launch.status: "live"
- wentLiveAt: YYYY-MM-DD
- preview branch: confirmed (tracks main)

From here forward:
- /dev creates feature branches (main protected).
- /ship uses the 3-tier pipeline (feature → preview → main).
- Breaking main affects real users — the pipeline catches issues at preview.

Recommended next step: announce the launch, then run /sync for next tasks.
```

## Red Flags — STOP

- Trying to run `/go-live` with uncommitted changes in the tree.
- Trying to run it while on a branch other than main.
- Running it "because we're almost ready" rather than "because real users are about to be affected".
- Skipping the MASTER.md Decision entry.
- Skipping the preview-branch creation step.

## Reversing (rare)

If you need to return to pre-launch mode (e.g., you took the product offline again), edit `project.json` directly — there's no `/pre-launch` skill because this should be extremely rare and deliberate.

## Rules

- This is a one-way door operationally. Confirm before flipping.
- Document the cutover as a Decision with a date.
- Ensure the `preview` branch exists before flipping — the live pipeline assumes it.
