# /vision - Strategic Planning Session

## Purpose
Brainstorm, refine the roadmap, and capture strategic decisions. This is a **conversational** skill - discuss ideas with the user, then write updates to the Roadmap doc.

## When to Use
- Weekly planning sessions
- After completing a major milestone
- When priorities need to shift
- When new opportunities or constraints emerge

## Mode
- **Read from**: Roadmap doc, Linear (current state), Codebase documentation
- **Write to**: Roadmap doc only

## Execution Steps

### 1. Load Context
Before the conversation begins, gather:

#### Current Roadmap
- Read the full Roadmap doc via `mcp__google-drive__getGoogleDocContent`
- Note: Vision statement, current initiative, project statuses, open questions

#### Linear Reality Check
- Fetch all projects in current initiative
- Get completion percentages and blockers
- Identify what's actually been delivered vs planned

#### Technical Constraints
- Read MASTER.md for architectural context
- Scan recent decisions that might affect planning

### 2. Present Current State
```
## Vision Session - [Date]

### Current Initiative: [Name]
**Timeline:** [Start] - [End]
**Progress:** [X of Y projects complete]

### What's Working
- [Projects on track, recent wins]

### What's Challenging
- [Blockers, delays, scope creep]

### Open Questions from Roadmap
- [Any unresolved decisions]

---
What would you like to explore today?
```

### 3. Facilitate Discussion
Guide the conversation with questions like:
- "What's the most important thing to accomplish this week?"
- "Are the current priorities still correct?"
- "What have we learned that changes our approach?"
- "What should we add/remove/defer?"

Take notes on:
- New priorities or reprioritizations
- Decisions made and their rationale
- New projects or features to add
- Items to defer or cut

### 4. Draft Roadmap Updates
Before writing, present the proposed changes:
```
## Proposed Roadmap Updates

### Changes to Current Initiative
- [List specific changes]

### New Decisions to Log
- [Decision]: [Rationale]

### Open Questions Resolved
- [Question]: [Answer/Decision]

### New Open Questions
- [Questions that emerged]

---
Shall I update the Roadmap doc with these changes?
```

### 5. Update Roadmap Doc
Once approved, use `mcp__google-drive__updateGoogleDoc` to:
- Update project statuses
- Add new decisions to the Decisions Log
- Update/add/remove projects as discussed
- Update "Last updated" date

### 6. Suggest Next Steps
```
Roadmap updated successfully.

Recommended next steps:
- [ ] Run /align to sync these changes to Linear
- [ ] [Any specific actions discussed]

Would you like to run /align now?
```

## Notes
- Vision sessions are collaborative - ask questions, don't just present
- Capture the WHY behind every decision
- Don't get too detailed - that's what Linear issues are for
- Always offer to run /align after updating the Roadmap
