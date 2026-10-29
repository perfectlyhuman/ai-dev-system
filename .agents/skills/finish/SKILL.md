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

Finish the project that owns the current agent session—the repository in which the session was opened and `start` established context. Changing the shell working directory or completing cross-repository work does not transfer ownership. Cross-repository changes need their own verification and delivery, but another repository's `finish` or roadmap never substitutes for closing the owning project. An `ai-dev-system` session may complete and deliver another repository's v3 migration as system-owned adoption work; do not begin that repository's ordinary product work in the migration session.

The configured delivery mode is standing authorization for its routine actions. Do not ask Riley again before committing, pushing, integrating, or verifying delivery when those actions are in scope and checks pass.

Inspect the working tree, staged changes, commits, current branch, upstream, and recent roadmap work. Separate session-related changes from unrelated pre-existing work. Never discard, overwrite, or silently include unrelated work.

If local `main` and remote `main` each contain unique commits, do not silently treat either as the integration base. Preserve the local lineage under an explicit recovery branch, keep dirty files attached to their existing checkout, and reconcile the intended work in a clean branch from the canonical remote.

### Calibrate ceremony to stage

`stage` is the project's answer to "who can be hurt if this goes wrong," and it decides how much
process the delivery earns. Read it as permission, not metadata:

- **`prototype`** — unshipped, and Riley is the only user. Move fast and ship recklessly: commit
  straight to the main branch, no working branch, no preview, no pull request, deploy and find out
  by using it. Skip roadmap and documentation ceremony whenever the durability test finds nothing
  durable. Do not manufacture process that a first user would never notice.
- **`design-partner`** — one real person depends on part of it. Protect the surface that person
  touches — their data, their flows, their credentials — and stay fast everywhere else. Verify the
  path they reach; do not spend ceremony on the path they cannot.
- **`live`** — customers depend on it. Evidence proportional to blast radius, and use the configured
  preview, integration, and deployment checks instead of delivering straight to production.

Four things stay guarded at every stage, because Git can undo a bad commit but not a dropped database:
no force-push over history that matters, no destructive migration, no credential rotation, and no
deleting data or files outside the session's scope.

If the recorded stage no longer matches what Riley is actually doing — a prototype that now has
users, or a live project still being prototyped — deliver under the recorded stage and say so plainly
once in the report. Reclassifying a project is Riley's decision, not a delivery prerequisite.

## 2. Reconcile durable knowledge

Run the full `update-docs` skill for everything not already reconciled during the session. Read `.agents/skills/update-docs/SKILL.md` and follow it through the durability test and roadmap reconciliation. This pass is mandatory on every `finish`, including when invoked as `/finish`; a separate `/update-docs` is optional mid-session but not a prerequisite. Documentation edits are not mandatory when the durability test finds nothing worth recording.

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

Calibrate verification to stage. For `live` projects, apply stronger evidence proportional to user
impact; for `prototype` projects, evidence that the changed behavior demonstrably works is enough.
Do not confuse stronger verification with repeated permission requests.

## 4. Commit the coherent unit

Review the final diff. Stage only files belonging to the completed work and documentation reconciliation. Write a clear commit message describing the outcome.

If there is no meaningful file change, do not manufacture an empty commit. Continue to final reporting.

If unrelated changes prevent a safe commit, preserve them and surface the exact conflict. Do not use destructive cleanup commands.

For work governed by a repository decision, verify that the commit contains that decision as well as the implementation it authorizes. Do not integrate an executable or paid preflight whose governing decision is absent from the branch.

## 5. Execute the delivery mode

`delivery.mode` is standing authorization; `stage` decides how much evidence is required before using
it. The two are meant to agree, so check them against each other rather than obeying either alone. If
the project is `live` and delivery reaches production directly with no preview branch and no
deployment check configured, finish the work and call that combination out once in the report — it
has no recovery point between a bad commit and a bad production. Correcting it is Riley's call, not a
prerequisite for closing the session.

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

After integration, independently resolve the delivered remote main commit and verify that it contains the session commit and the governing files. A successful feature-branch push alone is not proof that `main` received the work.

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

If real leftovers or blockers remain, state them precisely under `Remaining`. If closing is impossible without a consequential decision, report that `finish` is blocked and ask only for the required decision. Otherwise end after the evidence report so Riley can close the session immediately.
