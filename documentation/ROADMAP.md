# AI Dev System Roadmap

This is the canonical product and execution roadmap. Completed history belongs in `archive/roadmap/`, not in the active decision surface.

## Current focus

**Outcome:** Prove the migrated system in a real Banks work cycle by reconciling `preview` and `main` delivery truth.
**Why now:** The Banks migration successfully compressed the operating surface and separated product, private client, and shared client work. The highest-confidence test is now whether `start` through `finish` can drive a consequential piece of existing drift to a verified outcome without reviving handoffs or process bloat.
**Success evidence:** A fresh Banks session identifies the branch crosswalk as the highest-value action, maps logical changes and migrations across `preview` and `main`, verifies the preview lane, records durable findings in the right roadmap, and closes through the configured delivery path without an unsafe promotion.

## In progress

**V3-EVAL-001 — Banks live lifecycle** — use the migrated system to complete BP-DELIVERY-001, the `preview`/`main` logical-change crosswalk and preview verification.

## Next

1. **V3-EVAL-001 — Run Banks through a real v3 lifecycle** — resolve the delivery-truth drift identified by the pilot and evaluate whether the compact memory system sustains implementation-grade work.
2. **V3-PILOT-002 — Audit and migrate `commodore-app`** — evaluate the same drift plus the boundary between the canonical internal roadmap and Linear's stakeholder projection.

## Later

- **Accounts and credentials** — implement the Bitwarden-backed registry, consumer graph, scoped Codex access, and rotation workflow after the daily loop is stable.
- **Commodore Linear adapter** — project selected roadmap outcomes into a non-technical stakeholder view and reconcile external input back into the repository.
- **Marketing capabilities** — expand from kickoff research into positioning, launch, content, experiments, and measurement when an active project supplies concrete requirements.
- **Broader distribution** — decide whether to package v3 as a plugin or public installer only after it works across Riley's portfolio.

## Blockers

None.

## Open questions

None blocking current work.
