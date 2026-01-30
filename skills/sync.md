# /sync - Morning Check-In

Run this skill to verify all connections, get current state across all systems, and surface any inconsistencies.

## Execution Steps

1. **Load Project Configuration**
   Read `.claude/project.json` to get Linear team, Roadmap doc ID, and documentation paths.

2. **Verify Connections** (in parallel)
   - Linear: Fetch team info with `mcp__linear__get_team`
   - Google Drive: Read roadmap doc with `mcp__google-drive__getGoogleDocContent`
   - Codebase: Read the master documentation file from project.json
   - Git: Run `git status` and `git log --oneline -5`

3. **Gather Linear State**
   - Fetch all issues: `mcp__linear__list_issues` for the team
   - Categorize by status: In Progress, In Review, Todo, Blocked

4. **Detect Inconsistencies**
   - Issues marked "In Review" or "Done" but code not merged
   - Issues in progress with no recent updates
   - Roadmap items not in Linear

5. **Present Summary** in this format:

```
## [Project] Sync - [Date]

### Connection Status
| System | Status |
|--------|--------|
| Linear | ✅/❌ |
| Google Drive | ✅/❌ |
| Codebase | ✅/❌ |

### Current Initiative: [Name]
[Timeline and goal from Roadmap]

### Active Work
**In Progress:** [Table of issues]
**Ready to Start:** [Table of issues]
**Blocked:** [Any blocked issues]

### Git Status
[Branch, clean/dirty, recent commits]

### Inconsistencies Detected
[List any issues, or "None detected"]

### Recommended Next Action
[Suggestion based on state]

---
## Available Skills
| Skill | When to Use |
|-------|-------------|
| `/align` | Sync Linear with Roadmap/codebase reality |
| `/dev XXX-YY` | Work on a specific issue |
| `/vision` | Strategic planning session |
| `/update-docs` | Update codebase documentation |
```
