# /update-docs - Documentation Update

## Purpose
Update codebase documentation to reflect recent changes, capture learnings, and document decisions. Ensures future AI agents (and humans) understand not just WHAT the code does, but WHY.

## When to Use
- After completing a feature or fix
- After debugging sessions that revealed insights
- When documentation is stale or missing
- As part of `/dev` workflow before shipping

## Mode
- **Read from**: Codebase (recent changes, current docs)
- **Write to**: Documentation files

## Execution Steps

### 1. Identify Scope
- Which features/domains changed?
- Map to documentation chapters

### 2. Read Current Documentation
- Read MASTER.md
- Read affected chapter files
- Note gaps

### 3. Identify Documentation Gaps

#### What to Document
1. **What** (factual) - New features, changed behaviors
2. **How** (technical) - Patterns, files, data flows
3. **Why** (critical!) - Decisions, trade-offs, constraints

### 4. Draft Updates

#### For MASTER.md
Update if:
- New major decision for decisions table
- Chapter index needs new entry
- Architecture changed
- Principles evolved

#### For Chapter Files
Each should have:
- Overview
- Key Concepts
- Architecture
- Key Files table
- Patterns & Usage
- Key Decisions table
- Learnings & Gotchas
- Related links

### 5. Make Updates
- Keep focused and concise
- Preserve existing useful content
- Include dates on decisions

### 6. Verify
- Re-read updated sections
- Check they make sense standalone
- Verify code examples are accurate

## Documentation Principles

### Write for Future Agents
Assume the reader:
- Has never seen this codebase
- Is trying to make changes
- Needs to understand constraints and history

### Capture the WHY
Bad: "We use QStash for background jobs"
Good: "We use QStash because serverless functions timeout at 60s and our tasks take longer. We evaluated alternatives but QStash fits our deployment model."

### Keep It Maintainable
- Don't duplicate (link instead)
- Details in chapters, summaries in MASTER
- Update incrementally
- Delete outdated info

### Document Negative Knowledge
"We tried X and it didn't work because Y" prevents future developers from rediscovering dead ends.

## Output Format
```
## Documentation Updates

### Files Updated
- MASTER.md: [What changed]
- chapters/[name].md: [What changed]

### New Decisions Logged
- [Decision]: [Brief rationale]

### Learnings Captured
- [Key insight documented]

---
Documentation is up to date.
```

## Notes
- Documentation is a first-class deliverable
- A few good sentences > pages of boilerplate
- Update as you work, not days later
- If you learned it the hard way, write it down
