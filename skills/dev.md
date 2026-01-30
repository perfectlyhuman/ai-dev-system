# /dev [ID] - Implementation Session

## Purpose
Work on a Linear issue from start to finish: understand requirements, implement changes, test thoroughly, and ship with confidence.

## Usage
```
/dev XXX-18          # Work on specific issue
/dev                 # Pick next available issue
```

## Mode
- **Read from**: Linear (issue details), Codebase
- **Write to**: Codebase, Linear (status updates)

## Execution Steps

### Phase 1: Setup

#### 1.1 Load Issue
```
mcp__linear__get_issue(id, includeRelations=true)
```
Extract: title, description, acceptance criteria, git branch name

#### 1.2 Check Prerequisites
- Is this issue blocked by others?
- Is the codebase clean? (no uncommitted changes)
- Are we on the main branch?

#### 1.3 Create Branch
```bash
git checkout main
git pull origin main
git checkout -b [branch-name]
```

#### 1.4 Update Linear Status
```
mcp__linear__update_issue(id, state="In Progress")
```

### Phase 2: Understand

#### 2.1 Read Relevant Documentation
- MASTER.md - overall context
- Relevant chapter files
- AGENTS.md files in affected directories

#### 2.2 Explore Affected Code
- Identify files that need changes
- Understand existing patterns

#### 2.3 Present Understanding
```
## Issue: [XXX-YY] [Title]

### My Understanding
[Summarize what needs to be done]

### Affected Areas
- [File/directory]: [What changes needed]

### Technical Approach
[High-level implementation plan]

### Questions/Concerns
- [Any ambiguities or risks]

---
Ready to implement? Or clarify first?
```

### Phase 3: Implement

- Follow existing patterns
- Keep changes focused on the issue
- Make small, testable changes
- Commit logical chunks

If stuck, use `/check-assumptions`.

### Phase 4: Test

Run tests from project.json:
1. Quick validation (typecheck, lint, format)
2. Full test suite
3. E2E tests (if UI changes)
4. Manual verification

Document results:
```
## Test Results

### Automated Tests
- typecheck: PASS
- lint: PASS
- full: PASS

### Manual Verification
- [What was tested]: [Result]
```

### Phase 5: Document

Use `/update-docs` if implementation involved:
- New patterns
- Learnings/gotchas
- Architectural decisions

### Phase 6: Ship

```bash
git push -u origin [branch-name]
```

Update Linear:
```
mcp__linear__update_issue(id, state="Done")
mcp__linear__create_comment(issueId, body="Implemented and pushed.")
```

Clean up:
```bash
git checkout main
git pull origin main
git branch -d [branch-name]
```

### Phase 7: Next

```
## [XXX-YY] Complete

### Summary
[What was implemented]

### Files Changed
- [List]

---
Pull next issue? [Suggest next based on priorities]
```

## Error Handling

### Tests Failing
1. Don't push with failing tests
2. Investigate root cause
3. Use `/check-assumptions` if stuck

### Scope Creep
1. Note related issues but don't fix them
2. Create new Linear issues for follow-up
3. Stay focused on original issue

## Notes
- Evidence over assumptions - test everything
- Small commits with clear messages
- Update docs as you learn
- Don't mark done until actually done
