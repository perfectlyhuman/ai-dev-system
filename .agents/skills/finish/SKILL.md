---
name: finish
description: "Close an AI Dev System work session completely by reconciling documentation, verifying the actual work, resolving safe failures, committing relevant changes, and delivering them according to .ai-dev/project.yaml. Use at the end of every substantive session; it includes the necessary update-docs pass, so a separate update-docs invocation is not required first."
---

# Finish an AI Dev System session

Close the real work loop. Do not create handoff files or substitute a status report for delivery.

## 1. Load authorization and scope

Read `.ai-dev/project.yaml`. Note:

- product stage;
- documentation paths;
- required verification commands;
- delivery mode: `commit`, `push`, or `ship`;
- main branch, optional preview branch, and integration strategy;
- deployment verification commands or URLs.

Finish the project that owns the current Codex task—the repository in which the task was opened and `start` established context. Changing the shell working directory or completing cross-repository work does not transfer ownership. Cross-repository changes may need their own verification and delivery, but another repository's `finish` or roadmap never substitutes for closing the owning project.

The configured delivery mode is standing authorization for its routine actions. Do not ask Riley again before committing, pushing, integrating, or verifying delivery when those actions are in scope and checks pass.

Inspect the working tree, staged changes, commits, current branch, upstream, and recent roadmap work. Separate session-related changes from unrelated pre-existing work. Never discard, overwrite, or silently include unrelated work.

## 2. Reconcile durable knowledge

Run the `update-docs` workflow for everything not already reconciled during the session. This pass is mandatory; documentation edits are not mandatory when the durability test finds nothing worth recording.

Ensure the root roadmap and any active private scope roadmap match verified reality. Reconcile optional shared work only when the session changed a verified client-visible commitment, outcome, or status. Do not mirror private work into it or expose tact-sensitive context. Do not write or archive `HANDOFF.md`.

## 3. Verify the work

Run the configured verification commands appropriate to the changes. Start with focused checks, then run required full checks before delivery. Also inspect for:

- unintended generated files or debug code;
- malformed diffs or formatting errors;
- accidental secret values in changed files;
- migrations or environment changes that require deployment coordination; and
- documentation claims unsupported by behavior.

Use the project's actual tooling. Do not add a generic testing framework or demand universal TDD.

If a check fails, diagnose and fix safe in-scope causes, then rerun it. Stop only when resolution requires a consequential product choice, destructive external action, missing authority, unexpected material cost, customer/security exposure, or a genuinely external blocker.

For `live` projects, apply stronger evidence proportional to user impact. Do not confuse stronger verification with repeated permission requests.

## 4. Commit the coherent unit

Review the final diff. Stage only files belonging to the completed work and documentation reconciliation. Write a clear commit message describing the outcome.

If there is no meaningful file change, do not manufacture an empty commit. Continue to final reporting.

If unrelated changes prevent a safe commit, preserve them and surface the exact conflict. Do not use destructive cleanup commands.

## 5. Execute the delivery mode

### `commit`

Create the local commit and verify the working tree state. Do not push.

### `push`

Create the commit, push the current branch to its configured upstream, and verify the remote contains the commit.

When `preview_branch` is configured and the current branch is that branch, this is the normal continuously delivered stopping point. Verify the preview deployment when deployment checks are configured. Do not silently promote it to the production `main_branch`; that requires `ship` authorization or an explicit production request.

### `ship`

Create the commit and move it through the repository's configured integration path:

- Push the working branch.
- If a preview branch is configured, reconcile it with the main branch safely before promotion; never assume a long-lived preview branch is a fast-forward.
- If already on the main branch and direct delivery is allowed, push main.
- If on a feature branch, use the configured direct or pull-request integration strategy.
- Respect branch protection and required checks.
- Merge or promote when checks pass and standing configuration authorizes it.
- Verify the resulting main-branch commit and deployment state.

Do not claim shipped when only a local commit or branch push succeeded. State the furthest verified delivery state precisely.

Never force-push, bypass failing required checks, revoke credentials, run destructive migrations, or override protected workflows merely to complete `finish`.

## 6. Close with evidence

Report concisely:

```markdown
## Finished

**Delivered:** {outcome and verified destination}
**Documentation:** {durable updates or "already current"}
**Verification:** {commands/checks and results}
**Git:** {commit, branch, push/integration state}
**Deployment:** {verified state, when applicable}
**Remaining:** {only real leftovers or blockers}
```

A successful `finish` is terminal. Do not recommend a next action, offer `go`, or turn session closure into another continuation checkpoint. The roadmap preserves future work, and the next `start` will select from current evidence when Riley returns.

If real leftovers or blockers remain, state them precisely under `Remaining`. If closing is impossible without a consequential decision, report that `finish` is blocked and ask only for the required decision. Otherwise end after the evidence report so Riley can close Codex immediately.
