# /branch [ID] - Create Issue Branch

## Purpose
Create a new git branch for working on a Linear issue. Ensures clean starting state and proper branch naming.

## Usage
```
/branch XXX-18       # Create branch for specific issue
/branch              # Interactive - asks which issue
```

## Mode
- **Read from**: Linear (issue details), Git state
- **Write to**: Git (new branch)

## Execution Steps

### 1. Verify Clean State
```bash
git status
```

If uncommitted changes:
```
## Warning: Uncommitted Changes

You have uncommitted changes:
- [list of files]

Options:
1. Stash changes: `git stash`
2. Commit changes first
3. Proceed anyway (changes carry to new branch)

How would you like to proceed?
```

### 2. Sync with Main
```bash
git checkout main
git pull origin main
```

### 3. Get Issue Details
```
mcp__linear__get_issue(id)
```
Extract: `gitBranchName`, `title`, `identifier`

### 4. Create Branch
```bash
git checkout -b [branch-name]
```

Use Linear's suggested name, or: `[branchPrefix][identifier]-[slugified-title]`

### 5. Confirm
```
## Branch Created

Branch: [branch-name]
Issue: [XXX-YY] [Title]
Base: main (up to date)

Ready to work. Run `/dev XXX-YY` to continue.
```

## Error Handling

### Already on feature branch
```
## Warning: Not on main

Currently on: [branch-name]

Options:
1. Switch to main first (recommended)
2. Create from current branch
3. Cancel
```

### Branch already exists
```
## Warning: Branch exists

Branch [name] already exists.

Options:
1. Switch to existing branch
2. Delete and recreate
3. Use different name
```

## Notes
- Always start from up-to-date main
- Use Linear's branch name for consistency
- This skill is often called automatically by `/dev`
