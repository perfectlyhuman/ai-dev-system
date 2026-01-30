# Workflow Skills

Custom skills that integrate Linear, Google Drive (Roadmap doc), and the codebase into a cohesive development workflow.

## Quick Reference

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/sync` | Morning check-in | Start of day, re-orient |
| `/vision` | Strategic planning | Weekly planning, priority shifts |
| `/align` | Sync Linear with Roadmap | After /vision, when drift detected |
| `/dev [ID]` | Work on an issue | Main work mode |
| `/test` | Run comprehensive tests | Before shipping |
| `/update-docs` | Update codebase docs | After completing work |
| `/check-assumptions` | Debug reflection | When stuck |
| `/branch [ID]` | Create issue branch | Start of /dev |
| `/ship` | Push, PR, close branch | End of /dev |

## Typical Daily Flow

```
Morning:
  /sync                    → Check all systems, get oriented

Planning (weekly):
  /vision                  → Discuss strategy, update Roadmap
  /align                   → Push changes to Linear

Development (main loop):
  /dev XXX-YY              → Pick issue, create branch, implement
    → /check-assumptions   → If stuck
    → /test                → Verify changes
    → /update-docs         → Capture learnings
    → /ship                → Push and close
  /dev XXX-ZZ              → Next issue...
```

## Configuration

Skills read from `.claude/project.json` for:
- Linear team and initiative
- Roadmap document ID
- Documentation paths
- Testing commands
- Git configuration

## Source of Truth Hierarchy

```
Roadmap Doc (Strategic)     → What we want to build and why
        ↓
Linear (Tactical)           → What we're working on now
        ↓
Codebase + Docs (Implementation) → What actually exists
```
