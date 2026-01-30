# /ship - Push and Close Branch

## Purpose
Push completed work, optionally create a PR, update Linear, and clean up the branch. The final step of `/dev`.

## Usage
```
/ship                # Ship current branch
/ship --pr           # Ship with PR creation
/ship --no-linear    # Skip Linear update
/ship --keep-branch  # Don't delete local branch
```

## Mode
- **Read from**: Git state, Linear
- **Write to**: Git (push), Linear (status), GitHub (PR)

## Prerequisites
- All tests pass
- Changes committed
- Branch ready to merge

## Execution Steps

### 1. Verify Ready State
```bash
git status
```
Check: no uncommitted changes, on feature branch, commits ahead of main

### 2. Run Final Tests
Run quick + full tests from project.json. Stop if failures.

### 3. Push Branch
```bash
git push -u origin [branch-name]
```

### 4. Create PR (if requested)
```bash
gh pr create \
  --title "[XXX-YY] [Title]" \
  --body "## Summary
[From commits]

## Linear Issue
[Link]

## Testing
- [x] typecheck
- [x] lint
- [x] build"
```

### 5. Update Linear
```
mcp__linear__update_issue(id, state="Done")
mcp__linear__create_comment(issueId, body="Implemented and pushed. Branch: [name]")
```

### 6. Clean Up
```bash
git checkout main
git pull origin main
git branch -d [branch-name]
```

### 7. Summary
```
## Ship Complete

### What was shipped
- Branch: [name]
- Commits: X
- Files changed: Y

### Linear
- Issue: [XXX-YY] → Done

### GitHub
- [Branch/PR links]

---
Ready for next issue? Run `/sync`
```

## Error Handling

### Push rejected
```
Remote has changes. Options:
1. Rebase: `git rebase origin/main` (recommended)
2. Merge: `git merge origin/main`
3. Force push (dangerous)
```

### PR creation failed
Branch pushed successfully. Create PR manually at [URL].

## Notes
- Always run tests before shipping
- PR descriptions should explain "why"
- Keep Linear in sync
- Clean up branches to avoid clutter
