# Decision: Let `stage` decide delivery ceremony

**Date:** 2026-10-29
**Status:** accepted

## Context

`stage` was recorded in every project contract but almost never read. `finish` noted it in step 1 and
used it for exactly one sentence of verification guidance; `start`, `kickoff`, and `update-docs` never
referenced it at all. Only `delivery.mode` changed behavior, so a `prototype` and a `live` project
delivered identically once both were set to `ship`.

Riley works solo: most projects are pre-customer, frequently never observed by another human, and the
only trusted operator is himself. Working branches, worktrees, and preview lanes are therefore pure
cost on those projects — the thing they buy (concurrent contributors, review, a gate before
production) does not exist yet. Being invited to raise `push` as a global default was considered and
rejected: a bad `main` on a pre-customer project costs one `git revert`, while a branch per task costs
ceremony on every task. Trading a rare cheap recovery for a constant tax is the wrong trade.

## Decision

`stage` becomes the switch that decides how much ceremony delivery earns. `prototype` authorizes
committing straight to the main branch with no working branch, preview, or pull request, and skips
documentation ceremony that the durability test does not justify. `design-partner` guards the surface
a real user reaches. `live` requires evidence between a bad commit and a bad production, using the
configured preview, integration, and deployment checks.

The irreversible actions are outside the calibration and stay guarded at every stage: no force-push
over history that matters, no destructive migration, no credential rotation, and no deleting data or
files outside the session's scope. Git can undo a bad commit; it cannot undo a dropped database.

`finish` now calibrates verification and delivery to stage, flags a `live` project that reaches
production with no preview branch and no deployment check, and leaves reclassification to Riley.
`start` reports the stage and delivery mode in words each session and surfaces a visible mismatch
rather than silently narrowing its own evidence. `kickoff` chooses the stage deliberately.

## Why

The dials already existed, and the missing piece was behavior rather than vocabulary. Making `stage`
load-bearing lets one system serve a throwaway prototype and a customer-facing product without
imposing either one's ceremony on the other, and it keeps Riley's own standing preference — light
process by default, heavy rigor reserved for genuinely irreversible or customer-facing work — inside
the contract instead of in his head.

Naming the guardrails that survive every stage matters as much as naming the ones that relax. Without
that line, "prototype means go fast" reads as license for the handful of actions that `git revert`
cannot reach.

## Consequences

- Projects can move from reckless to guarded by changing one field, and the change takes effect on the
  next `finish`.
- A stale `stage` now produces a visible report line and, on `live`, an explicit no-recovery-point
  warning, instead of silent uniform behavior.
- Nothing about branch policy is mandatory at any stage; `push` and `pull-request` remain available
  where Riley wants a reviewable change without caring about customer exposure.
- The durable reason is recorded here so the "should we default to push?" question does not get
  reopened on the same argument.

## Revisit when

A project acquires a second regular contributor, a customer-visible surface without a preview
environment, or an incident where a bad `main` cost more than one revert.
