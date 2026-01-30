# /align - Linear Sync Session

## Purpose
Ensure Linear accurately reflects the Roadmap and codebase reality. Identifies drift between systems and proposes changes to bring Linear into alignment.

## When to Use
- After `/vision` sessions that updated the Roadmap
- When you notice Linear doesn't match reality
- Weekly maintenance to keep systems in sync
- After major code changes that affect project scope

## Mode
- **Read from**: Roadmap doc, Codebase documentation
- **Write to**: Linear (projects, issues, descriptions)

## Execution Steps

### 1. Load Sources of Truth

#### Roadmap Doc (Strategic Truth)
- Read full Roadmap doc
- Extract: Current initiative, all projects, priorities, success criteria

#### Codebase Documentation (Implementation Truth)
- Read MASTER.md
- Scan relevant chapter files for current state
- Note: What's actually built, recent decisions

### 2. Fetch Linear Current State
- Get current initiative details
- List all projects with descriptions
- List all issues across projects
- Note: statuses, assignments, blockers

### 3. Identify Drift

#### Projects
- **Missing in Linear**: Roadmap has project, Linear doesn't
- **Orphaned in Linear**: Linear has project not in Roadmap
- **Status mismatch**: Roadmap says "Complete", Linear says "In Progress"
- **Description drift**: Linear doesn't match Roadmap/codebase

#### Issues
- **Stale descriptions**: Issue describes outdated approach
- **Completed but open**: Code merged but issue not closed
- **Missing issues**: Roadmap scope without corresponding issues

### 4. Present Alignment Report
```
## Linear Alignment Report - [Date]

### Summary
- Projects in sync: X
- Projects needing updates: Y
- Issues needing attention: Z

### Project Updates Needed

#### [Project Name]
**Issue:** [Description mismatch / Status wrong / etc.]
**Current:** [What Linear says]
**Should be:** [What Roadmap/codebase says]
**Proposed action:** [Update description / Change status / etc.]

### Issues Needing Attention

#### [XXX-YY] Issue Title
**Issue:** [Stale description / Should be closed / etc.]
**Proposed action:** [Specific change]

### New Items to Create

#### New Project: [Name]
**From Roadmap:** [Section reference]

#### New Issue: [Title]
**For project:** [Project name]

---
Approve changes? [List specific changes to make]
```

### 5. Execute Approved Changes
Use Linear MCP tools:
- `mcp__linear__update_project`
- `mcp__linear__update_issue`
- `mcp__linear__create_project`
- `mcp__linear__create_issue`

### 6. Confirm Completion
```
## Alignment Complete

### Changes Made
- [List specific changes]

### Linear is now aligned with:
- Roadmap doc (as of [date])
- Codebase documentation

### Next recommended action
[Pick an issue with /dev, or continue with other work]
```

## Notes
- Always present changes before making them
- Keep issue descriptions concise but complete
- Linear is the tactical layer - answers "what now" not "why"
