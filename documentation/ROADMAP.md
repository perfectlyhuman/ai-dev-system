# AI Dev System Roadmap

This is the canonical product and execution roadmap. Completed history belongs in `archive/roadmap/`, not in the active decision surface.

## Current focus

**Outcome:** Operate v3 as Riley's daily development system across the full active portfolio and evolve it only from observed friction.
**Why now:** v3 is self-hosted and installed in Banks, Commodore, Chezmoi, Cosskit, and Rare Data. Cursor-first packaging (`AGENTS.md`, portable global paths, founder-speed contract) is rolling out from this repository. The rollout exercised consulting client scopes, stakeholder projection, mobile delivery, web deployment, data infrastructure, dirty-worktree preservation, and project ownership boundaries. Live Chezmoi use also exposed and corrected the missing Riley-global runtime layer and excess `start` ceremony. The core system is now deployed; the next phase is evidence-driven operation and focused capability expansion.
**Success evidence:** Project-owned sessions begin with trustworthy global and project context, finish with verified delivery, preserve the internal roadmap and durable why, and require Riley's attention for product judgment rather than routine mechanics. Shared-system changes are tied to recurring evidence rather than speculative process.

## In progress

1. **Accounts and credentials** — the machine registry records observed provider identities, remote resources, central credential routes, and approved consumers. Projects request friendly routes and capabilities through `.ai-dev/access.yaml`. The local broker has provider-specific diagnostics and direct Bitwarden-to-Vercel installation, with no arbitrary secret runner. The US-hosted `Riley Dev` organization, `Developer Access` project, read-only workstation machine account, protected token, and live project-access check are complete. Remaining validation is onboarding provider keys (OpenAI, Resend, PostHog, Sentry where used) and proving installation and rotation when projects reach those integrations.

2. **Cursor packaging** — installer ships `AGENTS.md`, skills use portable `~/.ai-dev-system` paths, README and templates describe Cursor as the primary agent surface.

## Next

1. **Makerkit bootstrap phase 2** — `bootstrap-makerkit.mjs --provision` handles registry consumer approval, doctor, GitHub, Vercel link, and Supabase link/push; observability merge template and `--install-secrets` when Bitwarden routes exist. Remaining: Supabase auth URL sync after first Vercel URL, registry service entries for new project ids.

2. **Evidence-driven maintenance** — use friction from real `start`, `access`, and `finish` sessions to justify narrowly scoped system changes.

## Later

- **Commodore Linear adapter** — project selected roadmap outcomes into a non-technical stakeholder view and reconcile external input back into the repository.
- **Marketing capabilities** — expand from kickoff research into positioning, launch, content, experiments, and measurement when an active project supplies concrete requirements.
- **Broader distribution** — decide whether to package v3 as a plugin or public installer only after it works across Riley's portfolio.

## Blockers

None for the broker capability. Provider account creation, billing, and initial application-key generation remain human actions when a consuming project reaches them.

## Open questions

None blocking current work.
