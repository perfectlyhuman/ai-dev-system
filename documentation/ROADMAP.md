# AI Dev System Roadmap

This is the canonical product and execution roadmap. Completed history belongs in `archive/roadmap/`, not in the active decision surface.

## Current focus

**Outcome:** Operate v3 as Riley's daily development system across the full active portfolio and evolve it only from observed friction.
**Why now:** v3 is self-hosted and installed in Banks, Commodore, Chezmoi, Cosskit, and Rare Data. Cursor-first packaging (`AGENTS.md`, portable global paths, founder-speed contract) is rolling out from this repository. The rollout exercised consulting client scopes, stakeholder projection, mobile delivery, web deployment, data infrastructure, dirty-worktree preservation, and project ownership boundaries. Live Chezmoi use also exposed and corrected the missing Riley-global runtime layer and excess `start` ceremony. The core system is now deployed; the next phase is evidence-driven operation and focused capability expansion.
**Success evidence:** Project-owned sessions begin with trustworthy global and project context, finish with verified delivery, preserve the internal roadmap and durable why, and require Riley's attention for product judgment rather than routine mechanics. Shared-system changes are tied to recurring evidence rather than speculative process.

## In progress

1. **Stage-calibrated delivery** — `stage` now decides how much ceremony `finish` spends: `prototype` ships straight to the main branch with no branch, preview, or pull request, while `live` requires evidence before production and the irreversible actions stay guarded at every stage ([decision](decisions/2026-10-29-stage-calibrated-delivery.md)). `start` reports the stage and delivery mode each session and flags a visible mismatch. Remaining: re-stage the portfolio so each project records the stage it actually operates at, and confirm the new wording in a real `prototype` and a real `live` session before trusting it.

2. **Accounts and credentials** — the machine registry records observed provider identities, remote resources, central credential routes, and approved consumers. Projects request friendly routes and capabilities through `.ai-dev/access.yaml`. The local broker has provider-specific diagnostics and direct Bitwarden-to-Vercel installation, with no arbitrary secret runner. The US-hosted `Riley Dev` organization, `Developer Access` project, read-only workstation machine account, protected token, and live project-access check are complete. Remaining validation is onboarding provider keys (OpenAI, Resend, PostHog, Sentry where used) and proving installation and rotation when projects reach those integrations.

3. **Agent-neutral packaging** — installer ships `AGENTS.md`, a `CLAUDE.md` import, and identical skills in `.agents/skills/` and `.claude/skills/`, so Codex, Cursor, Claude Code, and DeepSeek Harness share one lifecycle ([decision](decisions/2026-10-21-agent-neutral-skills.md)). Portfolio refresh done 2026-10-21: Commodore (main `41ea0f64`), Banks (preview `90d8c11`), Chezmoi (main `689d4b8`), Cosskit (main `6c730d1`), and Rare Data (main `679af28`) each carry both skill copies, `CLAUDE.md` → `@AGENTS.md`, and `.ai-dev/access.yaml`; no project had local skill edits beyond older source versions. Remaining: promote Banks `preview` to `main` through its normal delivery, and fix the stale `rare-data` path in `~/.ai-dev-system/projects.yaml` (the local checkout no longer exists).

## Next

1. **Makerkit bootstrap phase 2** — `bootstrap-makerkit.mjs --provision` handles registry consumer approval, doctor, GitHub, Vercel link, and Supabase link/push; observability merge template and `--install-secrets` when Bitwarden routes exist. Remaining: Supabase auth URL sync after first Vercel URL, registry service entries for new project ids.

2. **Evidence-driven maintenance** — use friction from real `start`, `access`, and `finish` sessions to justify narrowly scoped system changes.

## Later

- **Stakeholder projection adapter** — automate the reconciliation that `start`, `update-docs`, and `finish` currently describe for a declared Trello board, once real use shows which parts are mechanical ([decision](decisions/2026-10-29-trello-stakeholder-projection.md)).
- **Marketing capabilities** — expand from kickoff research into positioning, launch, content, experiments, and measurement when an active project supplies concrete requirements.
- **Broader distribution** — decide whether to package v3 as a plugin or public installer only after it works across Riley's portfolio.

## Blockers

None for the broker capability. Provider account creation, billing, and initial application-key generation remain human actions when a consuming project reaches them.

## Open questions

None blocking current work.
