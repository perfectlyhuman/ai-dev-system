---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# Git Workflow

## Overview

This project uses a three-tier branch strategy: feature branches → preview → main. All changes are tested on staging before reaching production.

## Branch Strategy

```
Feature branches ({branch-prefix}*) → preview → main
                                ↓          ↓
                         Vercel Preview  Production
                           (staging)     (live)
```

| Branch | Purpose | Deploys To | Protected? |
|--------|---------|------------|-----------|
| `main` | Production code | Vercel Production | Yes |
| `preview` | Staging/testing | Vercel Preview | Yes |
| `{branch-prefix}*` | Feature development | None (local only) | No |

## Workflow Steps

### 1. Create Feature Branch

Always create from an up-to-date `main`:

```bash
git checkout main
git pull origin main
git checkout -b {branch-prefix}feature-name
```

### 2. Develop & Test Locally

```bash
pnpm typecheck && pnpm lint:fix && pnpm format:fix
git add [specific files]
git commit -m "description of change"
```

### 3. Push & Deploy to Staging

```bash
git push -u origin {branch-prefix}feature-name
git checkout preview
git pull origin preview
git merge {branch-prefix}feature-name
git push origin preview
git checkout {branch-prefix}feature-name
```

### 4. Test on Staging

Manually test the feature on the Vercel preview URL.

### 5. Deploy to Production

```bash
git checkout main
git pull origin main
git merge preview
git push origin main
```

### 6. Cleanup

```bash
git checkout main
git branch -d {branch-prefix}feature-name
git push origin --delete {branch-prefix}feature-name
```

## Anti-Patterns (NEVER DO)

| Anti-Pattern | Do This Instead |
|-------------|-----------------|
| Merge feature branch directly to main | Always go through preview |
| Create branch from preview | Always branch from main |
| Force push to main or preview | Never force push shared branches |
| Skip preview for "small changes" | Always test on preview |

## Commit Message Style

Use clear, imperative-mood messages:

```
Add intake form with validation
Fix JSON parsing for edge cases
Update scoring weights based on feedback
Remove deprecated template format
```

For Claude-authored commits:
```
Add feature description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Related

- [MASTER.md](../MASTER.md) - Git workflow summary
- [development-cycle.md](development-cycle.md) - Full development process
