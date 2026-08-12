# AI Dev System Roadmap

This is the canonical product and execution roadmap. Completed history belongs in `archive/roadmap/`, not in the active decision surface.

## Current focus

**Outcome:** Complete the `commodore-app` pilot by using v3 to resolve the delivery drift its migration exposed.
**Why now:** Commodore now has a canonical internal roadmap, an explicit Linear stakeholder boundary, a Codex-only lifecycle, and its previously local product work safely on the remote branch. The next proof is whether v3 drives the real product through a consequential boundary without reverting to handoffs or permission ceremony: three local-only Supabase migrations, an untested browser flow, a stale `main`, and a manual production deployment.
**Success evidence:** Commodore's hosted migration history is reconciled safely, Search → save draft → reopen is browser-smoked, `main` contains the verified state, the manual Vercel deployment is Ready, and Linear can be refreshed as a founder-facing projection from the correct internal roadmap.

## In progress

**V3-PILOT-002 — Commodore migration and delivery proof** — v3 installation and runtime cleanup are complete on remote commit `0614be2`. Finish the pilot by reconciling the three local-only Supabase migrations and smoke-testing the Search/Lists path before fast-forwarding `main` and deploying production.

## Next

1. **V3-PILOT-002 — Clear Commodore's delivery gate** — inspect the hosted schema against the three local-only migrations, apply only the verified delta, then browser-smoke Search → save draft → reopen using Commodore's new v3 lifecycle.

## Later

- **Accounts and credentials** — implement the Bitwarden-backed registry, consumer graph, scoped Codex access, and rotation workflow after the daily loop is stable.
- **Commodore Linear adapter** — project selected roadmap outcomes into a non-technical stakeholder view and reconcile external input back into the repository.
- **Marketing capabilities** — expand from kickoff research into positioning, launch, content, experiments, and measurement when an active project supplies concrete requirements.
- **Broader distribution** — decide whether to package v3 as a plugin or public installer only after it works across Riley's portfolio.

## Blockers

None.

## Open questions

None blocking current work.
