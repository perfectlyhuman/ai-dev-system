---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# Intake Workflow

How bugs and feature requests get from a Slack conversation into the project's work queue without turning into yet another tab to manage.

## The Mental Model

- **GitHub Issues = inbox.** Where new bugs and requests land. Cheap, git-adjacent, shared with anyone on the repo.
- **ROADMAP.md = prioritized tracker.** The actual working queue, organized into phases, with task IDs and status markers.
- **One-way flows:**
  - Intake → roadmap during `/start` (Claude surfaces new issues; you decide what to promote).
  - Roadmap → issue-close during `/ship` (Claude closes the corresponding issue when its task ships).

No bidirectional sync. GitHub Issues is never the source of truth for priority or status — that lives in ROADMAP.md.

## Setup

### 1. Enable intake in `project.json`

```json
"intake": {
  "provider": "github",
  "repo": "perfectlyhuman/your-project"
}
```

Set `provider` to `"github"` and `repo` to the `owner/name` of the repo. If `provider` is `"none"` or missing, all intake steps are skipped.

### 2. Install the GitHub Slack app

In your Slack workspace:

1. Add the official GitHub app: <https://slack.github.com/>.
2. In the channel where your cofounder posts bugs, run `/github subscribe owner/repo issues`.
3. To create issues from Slack, use `/github open owner/repo`.

Your cofounder can now:
- Type `/github open owner/repo [Bug] checkout flow broken on mobile` to file an issue directly.
- Or describe a bug in a thread and convert it via the message menu → GitHub → Create issue.

### 3. Done

Run `/start` on your next work session. Claude will pull the new issues, cross-reference with ROADMAP.md, and ask whether to promote any into the active work queue.

## Day-to-Day Flow

### Cofounder reports a bug from Slack

```
Cofounder (in #product):
  /github open perfectlyhuman/myapp [Bug] Stripe checkout 500s on Safari iOS
```

GitHub app creates issue #42 with title and assigns it to the default.

### You run /start at the start of your work session

Claude detects issue #42 is open and not referenced in ROADMAP.md:

```
### External Intake
- #42: [Bug] Stripe checkout 500s on Safari iOS — NEW, not in roadmap
```

You decide:
- Add it to the active sprint as a task (Claude writes the task with a reference to `#42`).
- Add it to a later phase's backlog (same, but in a later phase).
- Close the issue as won't-fix, with a comment.
- Defer — leave it in Issues, revisit next `/start`.

### You ship a task that fixes the issue

When you run `/ship`, Claude sees the task in ROADMAP.md references `#42` and closes it with a comment linking to the commit:

```
gh issue close 42 --comment "Shipped in abc1234"
```

## Conventions

### Linking tasks to issues in ROADMAP.md

When you promote an issue to a task, reference the issue number in the task row:

```markdown
| P2-007 | Fix Stripe checkout 500s on Safari iOS (#42) | ⬜ | -- | [chapters/billing.md](chapters/billing.md) |
```

The `(#42)` reference is what `/ship` looks for when deciding which issues to close.

### Commit messages

Include `Closes #42` in the commit message for the fix — GitHub will auto-close on merge to default branch, which is belt-and-suspenders with `/ship`'s explicit close.

### When not to promote to ROADMAP.md

Not every issue needs a task:
- Low-priority nice-to-haves that might never happen.
- Feature requests that need `/vision` discussion before committing.
- Duplicates of existing issues or tasks.

Leave those in Issues with appropriate labels (`backlog`, `needs-discussion`). They'll surface again next `/start` if still open.

## Why GitHub Issues (and not Linear)

- **Zero cost.** Everyone on the repo already has access.
- **Git-native.** Issue numbers show up in commits, PRs, and blame automatically.
- **Low friction for intake.** Slack users don't need another account; the GitHub Slack app works out of the box.
- **No new tab.** ROADMAP.md stays the working queue; Issues is just the inbox.

Linear is a reasonable upgrade if the team grows beyond ~3 engineers, if non-technical stakeholders need visibility, or if you outgrow markdown-as-tracker. Until then, GitHub Issues is enough.

## Rules

- ROADMAP.md is the source of truth for status and priority. Don't use GitHub's milestones or labels as the organizing system.
- Reference `#N` in task descriptions when promoting an issue to a task.
- `/ship` closes issues; don't close them manually unless you're explicitly declining to fix.
