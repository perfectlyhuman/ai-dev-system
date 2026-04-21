---
description: "Use when work is complete and tested and ready to deploy — either to staging/preview or to production"
user_invocable: true
---

# /ship - Deploy Feature

**Announce at start:** "I'm using the /ship skill to deploy this work."

Deploy code through the pipeline appropriate to the project's current launch status.

## The Iron Laws

- **NO DEPLOY WITHOUT FRESH TEST OUTPUT IN THE CURRENT MESSAGE.**
- **NO DEPLOY WITH UNCOMMITTED CHANGES IN THE WORKING TREE.**
- **NO FORCE-PUSH TO MAIN** (without explicit, in-the-moment user instruction to do so).

Violating the letter of these laws is violating the spirit of them.

## Determine the Pipeline

Read `.claude/project.json` `launch.status`:

- **`"pre-launch"`** — no active users. Lightweight pipeline: test → commit → push main.
- **`"live"`** — real users in production. 3-tier pipeline: feature branch → preview → main.

If the value is missing or ambiguous, **ask the user** which mode applies before proceeding.

---

## Pre-launch Pipeline

When `launch.status == "pre-launch"`, ceremony is overhead without upside. You're working on main directly.

### Execution

```bash
# 1. Verify clean state
git status

# 2. Run quick tests — output must appear in this message
pnpm typecheck && pnpm lint:fix && pnpm format:fix

# 3. Commit if anything is uncommitted (otherwise skip)
git add -A && git commit -m "$(cat <<'EOF'
{descriptive commit message}

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"

# 4. Push to main
git push origin main
```

<VERIFICATION-GATE>
Before `git push`, fresh test output must appear in this message. If tests have not been run in this turn, run them now.
</VERIFICATION-GATE>

### Post-Ship (pre-launch)

1. Report deploy triggered.
2. Update ROADMAP.md if applicable.
3. Close any corresponding external intake issues (see "External Intake" section below).
4. Suggest `/update-docs` if learnings haven't been captured.

---

## Live Pipeline

When `launch.status == "live"`, every deploy affects real users. Full 3-tier pipeline.

### Option A: Ship to Preview (Staging)

**Prerequisites:**
1. On a feature branch (`{branch-prefix}*`).
2. All changes committed.
3. Tests passing (fresh output required).

**Execution:**

```bash
# 1. Verify clean state
git status

# 2. Run quick tests — output must appear in this message
pnpm typecheck && pnpm lint:fix && pnpm format:fix

# 3. Push feature branch
git push -u origin $(git branch --show-current)

# 4. Merge to preview
git checkout preview
git pull origin preview
git merge $(git branch --show-current)
git push origin preview

# 5. Return to feature branch
git checkout -
```

**Post-Ship (preview):**
1. Report: "Shipped to preview. Vercel will build a preview deployment."
2. Remind the user to test on the preview URL.
3. Update ROADMAP.md if applicable.

### Option B: Ship to Main (Production)

**Prerequisites:**
1. Code tested on preview.
2. Preview branch is up to date.
3. **Full pre-production validation** — see "Pre-Production Validation Ladder" below. This goes beyond the quick typecheck/lint/format that ship-to-preview runs.

**Pre-Production Validation Ladder:**

Before merging preview to main, run each level that applies. Paste output for each.

```bash
# Level 1: Quick (always)
pnpm typecheck && pnpm lint:fix && pnpm format:fix

# Level 2: Build (always for production)
pnpm build

# Level 3: E2E tests (if the project has them)
cd apps/e2e && pnpm test    # or whatever the project uses

# Level 4: Database typegen check (if recent schema changes)
pnpm supabase:web:typegen && pnpm typecheck

# Level 5: Manual verification (UI changes)
# Describe what to check on the preview URL before merging.
```

<VERIFICATION-GATE>
Each level must show fresh output in this message before proceeding to the merge. If any level fails, stop, fix, re-run before continuing.
</VERIFICATION-GATE>

**Execution:**

```bash
git checkout preview && git pull origin preview
git checkout main && git pull origin main
git merge preview
git push origin main

# Cleanup feature branch
git branch -d {branch-prefix}{feature-name}
git push origin --delete {branch-prefix}{feature-name}
```

**Post-Ship (main):**
1. Report: "Shipped to main. Production deployment triggered."
2. Update ROADMAP.md: mark tasks ✅, update milestones.
3. Close any corresponding external intake issues (see below).
4. Suggest `/update-docs` if learnings haven't been captured.

---

## External Intake Closure

If `.claude/project.json` has `intake.provider == "github"`:

Look at the commits being shipped. For each commit, check for:
- `Closes #N`, `Fixes #N`, `Resolves #N` references.
- Task IDs in ROADMAP.md that are marked ✅ and link to a GitHub issue number.

Close those issues:

```bash
gh issue close {number} --repo {intake.repo} --comment "Shipped in {commit-sha or PR link}"
```

Report which issues were closed in the ship summary.

If `intake.provider` is unset or `"none"`, skip this step.

---

## Error Handling

### Merge Conflicts

Present conflicts to the user for resolution guidance. Do not force-resolve.

### Failed Build

Check build logs. Common issues: missing env vars, type errors, SSR issues. Do not ship a failing build.

### Tests Failing

Stop. Return to `/test`. Do not ship.

## Red Flags — STOP

- About to push without fresh test output in this message.
- About to force-push anything to main.
- Uncommitted changes in working tree right before push.
- "Tests passed an hour ago" (run them again).
- Skipping preview in live mode.
- Merging feature branch directly to main in live mode.

## Anti-Patterns (NEVER DO)

- **Merge feature branch directly to main in live mode** (always go through preview).
- **Force push to main** (without explicit in-the-moment user instruction).
- **Ship untested code** in either mode.
- **Skip `/update-docs`** after shipping meaningful work.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Tests passed on my last push" | Code may have changed. Run them now. |
| "It's a hotfix, skip preview" | Hotfixes are exactly when preview catches the unanticipated break. |
| "Quick fix, direct to main is fine" | In live mode: no. Use the pipeline. |
| "I'll update docs later" | Future Claude won't know what changed. Document now. |

## Rules

- Pipeline is determined by `launch.status`; don't override without user consent.
- Paste test output; don't paraphrase it.
- Document ships — close intake issues, update ROADMAP.md.
