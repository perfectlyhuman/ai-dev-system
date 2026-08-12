# AI Dev System Roadmap

This is the canonical product and execution roadmap. Completed history belongs in `archive/roadmap/`, not in the active decision surface.

## Current focus

**Outcome:** Make v3 the root `ai-dev-system` product and remove the legacy system from the default installation path.
**Why now:** The core lifecycle, installer, repository discovery, and self-hosted `start` and `finish` behaviors are proven. Leaving two public product surfaces would create ambiguity.
**Success evidence:** The root README, package metadata, executable, and install flow describe and install only v3; legacy material is removed or clearly historical; and a clean fixture installation passes.

## In progress

No work is currently half-finished. The complete self-hosting sequence is archived in [2026 Q3](archive/roadmap/2026-Q3.md); V3-CUT-001 is ready.

## Next

1. **V3-CUT-001 — Cut the root product over to v3** — replace the legacy README, package entrypoint, npm metadata, executable, and default setup path, then prove a clean fixture install.
2. **V3-PILOT-001 — Audit and migrate `banks`** — use a real solo SaaS project to identify documentation, roadmap, architecture, and code drift produced by the prior system.
3. **V3-PILOT-002 — Audit and migrate `commodore-app`** — evaluate the same drift plus the boundary between the canonical internal roadmap and Linear's stakeholder projection.

## Later

- **Accounts and credentials** — implement the Bitwarden-backed registry, consumer graph, scoped Codex access, and rotation workflow after the daily loop is stable.
- **Commodore Linear adapter** — project selected roadmap outcomes into a non-technical stakeholder view and reconcile external input back into the repository.
- **Marketing capabilities** — expand from kickoff research into positioning, launch, content, experiments, and measurement when an active project supplies concrete requirements.
- **Broader distribution** — decide whether to package v3 as a plugin or public installer only after it works across Riley's portfolio.

## Blockers

None.

## Open questions

None blocking current work.
