# Install Riley-global context without overwriting personal guidance

**Date:** 2026-08-13
**Status:** Accepted

## Decision

AI Dev System installs a machine-wide context root at `C:\Users\riley\.ai-dev-system\` alongside every repository-scoped installation:

- `RILEY.md` is the runtime authority for Riley's cross-project working contract and durable personal preferences.
- `projects.yaml` is an installer-maintained, JSON-compatible YAML map from canonical project names to local repository paths.
- `registry.yaml` is the non-secret surface for account, organization, service, and remote-resource metadata. Secret values never belong there.

Installation creates `RILEY.md` and `registry.yaml` only when absent. It never overwrites personal guidance. Each installation safely adds or corrects its own entry in `projects.yaml`.

Repository-scoped skills remain authoritative product packages, but they should load and apply the global working contract instead of carrying its entire rationale independently. Project documentation may override a global preference only for a concrete recorded reason.

## Why

The v3 design already defined Riley-global context, but portfolio rollout treated its absence as acceptable and never materialized the files. That left important behavior—forward motion, risk-matched autonomy, evidence over ceremony, and `go`—split between a blueprint and partial skill instructions. A live Chezmoi `start` exposed the gap by reporting the absent files without being able to use them.

Bootstrapping the layer makes the intended hierarchy real: one personal working contract, one local portfolio index, repository-local product truth, and focused lifecycle skills.

## Consequences

- New and existing installations establish the global layer idempotently.
- Missing `RILEY.md` after installation is drift worth reporting; empty or irrelevant registry data is not.
- `start` no longer runs configured verification merely because a tree is dirty and no longer reports disabled or uninspected external systems.
- The future Bitwarden capability extends `registry.yaml`; it does not introduce a competing global context location.

## Revisit if

Codex gains a trustworthy native profile mechanism that can hold this contract across projects with equivalent portability, inspectability, and user control.
