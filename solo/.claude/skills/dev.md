---
description: "Implementation session: pick up a task, implement it, test, and document learnings"
user_invocable: true
---

# /dev [task-id] - Implementation Session

You are running a structured implementation session. Follow these phases in order.

## Phase 1: Setup

1. **Read ROADMAP.md** to find the task (by ID or description)
2. **Read the relevant chapter(s)** linked from the task
3. **Check dependencies** — are prerequisite tasks completed?
4. **Update ROADMAP.md** — mark the task as 🔄 in-progress
5. **Create branch** if not already on a feature branch:
   ```
   git checkout main && git pull origin main
   git checkout -b riley/{descriptive-name}
   ```

If no task-id is provided, read ROADMAP.md and present the next available tasks for the user to choose from.

## Phase 2: Understand

1. **Read relevant code** — explore existing patterns, understand what exists
2. **Read AGENTS.md files** in the relevant directories for framework patterns
3. **Present your understanding** to the user:
   - What needs to be built
   - What already exists that we can use
   - Your proposed approach
   - Any questions or concerns

**Wait for confirmation before proceeding to implementation.**

## Phase 3: Implement

1. Make changes incrementally — commit logical chunks
2. Follow project principles (see MASTER.md)
3. If you get **stuck**:
   - Use `/check-assumptions` to systematically debug
   - Check the relevant chapter's "Learnings & Gotchas" for known issues
   - Ask rather than guessing

### Commit Style

```
git commit -m "$(cat <<'EOF'
Add [feature/fix/update] description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

## Phase 4: Test

Run the quick validation suite:

```bash
pnpm typecheck && pnpm lint:fix && pnpm format:fix
```

If this is a UI change, describe what should be manually verified.

### Test Failure Handling

- Fix typecheck/lint errors immediately
- If a test reveals a deeper issue, document it and discuss
- Never mark a task as done if tests are failing

## Phase 5: Document

**This phase is not optional.**

1. **Update the relevant chapter** with:
   - **Key Decisions** made (with rationale and alternatives)
   - **Learnings & Gotchas** — problems hit, solutions found
   - **Key Files** — new files created
   - **Implementation** — how it actually works (vs. how it was specced)
   - **Open Questions** — anything discovered that needs future attention

2. **Update MASTER.md** if a major decision was made (add to decisions table)

3. **Update ROADMAP.md**:
   - Mark task as ✅ done
   - Add notes if relevant
   - Update Active Sprint

## Phase 6: Ship Ready

1. Push the branch: `git push -u origin riley/{branch-name}`
2. Summarize what was accomplished
3. Advise using `/ship` when ready to deploy

## Error Handling

### Prerequisites Not Met
Flag the dependency and suggest working on it first or a different task.

### Scope Creep
If the task is larger than expected:
1. Complete what's reasonable
2. Create new tasks in ROADMAP.md for remaining work
3. Document what was learned about the scope

## Rules

- Always read before writing. Never modify code you haven't read.
- Always update documentation after implementation (Phase 5 is mandatory).
- Never skip testing (Phase 4).
- Ask when uncertain — don't make large assumptions.
- Keep changes focused. Don't refactor unrelated code.
