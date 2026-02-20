---
description: "Deploy feature to staging (preview) or production (main)"
---

# /ship - Deploy Feature

You are deploying code through the deployment pipeline.

## Determine Target

Ask: "Ship to **preview** (staging) or **main** (production)?"

Default to **preview** if not specified.

## Option A: Ship to Preview (Staging)

### Prerequisites
1. On a feature branch (`riley/*`)
2. All changes committed
3. Tests passing

### Execution

```bash
# 1. Verify clean state
git status

# 2. Run quick tests
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

### Post-Ship
1. Report: "Shipped to preview. Vercel will build a preview deployment."
2. Remind to test on the preview URL.
3. Update ROADMAP.md if applicable.

## Option B: Ship to Main (Production)

### Prerequisites
1. Code tested on preview
2. Preview branch is up to date

### Execution

```bash
git checkout preview && git pull origin preview
git checkout main && git pull origin main
git merge preview
git push origin main

# Cleanup feature branch
git branch -d riley/{feature-name}
git push origin --delete riley/{feature-name}
```

### Post-Ship
1. Report: "Shipped to main. Production deployment triggered."
2. Update ROADMAP.md: mark tasks ✅ done, update milestones.
3. Suggest `/update-docs` if learnings haven't been captured.

## Error Handling

### Merge Conflicts
Present conflicts for resolution guidance.

### Failed Build
Check build logs. Common issues: missing env vars, type errors, SSR issues.

## Anti-Patterns (NEVER DO)

- Merge feature branch directly to main (always go through preview)
- Force push to main
- Ship untested code to main
- Skip `/update-docs` after shipping
