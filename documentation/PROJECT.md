# AI Dev System

## What this is

AI Dev System is Riley's operating system for building software with Codex. It connects product intent, an internal roadmap, durable project knowledge, implementation, verification, and delivery so a new session can move quickly without losing why the product exists or repeating settled work.

It is not an autonomous engineering organization or a heavyweight development methodology. It is a small layer around a capable coding agent that preserves direction and removes recurring coordination friction.

## Who it is for

The system is designed for Riley as a solo developer and as the technical founder on Commodore. Riley's advantage is the ability to apply first-principles product judgment and move faster than a conventional team; the system should compound that advantage.

The active portfolio currently includes:

- Perfectly Human: `chezmoi`
- Clubb Ventures: `banks`, `cosskit`, and `rare-data`
- Commodore Strategies: `commodore-app`
- Internal infrastructure: `ai-dev-system`

## Why this should exist

AI coding sessions are individually capable but discontinuous. Without durable product and project memory, they lose rationale, drift from the roadmap, reopen decisions, and make Riley supervise routine mechanics. AI Dev System gives each session enough trustworthy context to reason in a linear direction while keeping documentation proportional to its future value.

## Current stage

**Design partner.** Riley is the only direct user. The Codex-native system is the repository's sole root product, self-hosts its complete lifecycle, and is installed across Banks, Commodore, Chezmoi, Cosskit, and Rare Data. Those migrations proved the system against consulting client scopes, stakeholder projection, mobile and web delivery, data infrastructure, dirty-worktree preservation, and cross-repository task boundaries. Riley-global guidance and project discovery are installed machine-wide. The accounts-and-credentials expansion now has central non-secret credential routing, project capability requests, provider diagnostics, and a live allowlisted local broker backed by a DPAPI-protected Bitwarden machine token. Provider-key onboarding and rotation verification remain evidence-driven consumer work.

## Product principles

1. **Forward motion while active:** recommend and pursue the highest-value next action during an active work session; a successful `finish` is terminal and closes the loop without proposing more work.
2. **Settled means settled:** reopen decisions only when evidence or a recorded revisit condition warrants it.
3. **Options earn attention:** present alternatives only when multiple live paths materially change the outcome.
4. **Internal roadmap is canonical:** Linear may project or contribute stakeholder input, never replace technical product memory.
5. **Durable why over session narrative:** preserve product rationale, material decisions, and expensive lessons; do not archive chat-like handoffs.
6. **Autonomy matches real risk:** routine reversible work belongs to Codex; Riley handles consequential product judgment and real external risk.
7. **Verification over ceremony:** prove work with evidence, then ship according to standing project authorization.
8. **Plain language first:** explain practical meaning and trade-offs before implementation detail.
9. **`go` means proceed:** at real checkpoints, a specific `go` prompt authorizes the named next phase without another planning loop.
10. **Private reasoning stays private:** client scopes preserve the full internal operating context; shared surfaces receive only deliberate, audience-appropriate commitments and outcomes.

## Scope

### Now

- A Codex-native `kickoff -> start -> work -> update-docs -> finish` lifecycle.
- An installed Riley-global working contract and local project index shared across project-owned tasks.
- A small project contract at `.ai-dev/project.yaml`.
- Canonical repository-local product, roadmap, chapter, decision, and lesson memory.
- A safe installer for repository-scoped skills.
- Project-owned tasks whose `start`, recommendations, and `finish` stay anchored to the repository where the task was opened.
- Private client scopes with their own roadmap and durable memory, plus optional client-visible shared work.
- Complete v3 operation across Riley's active portfolio, with migrations owned by `ai-dev-system` and ordinary product sessions owned by each project.
- Explicit project access requests, provider-specific readiness checks, and allowlisted Bitwarden-backed operations with consumer verification and rotation.

### Not now

- Superpowers, OMC, Gilfoyle, or other autonomous engineering orchestration.
- Google Drive as part of the development system.
- Generic framework-specific process packages.
- A public product optimized for unknown developers.
- The Commodore Linear adapter and broader marketing workflows until concrete project needs make them active.

## System overview

```text
Riley-global context (optional, local)
               |
     .ai-dev/project.yaml
               |
  PROJECT.md + ROADMAP.md
      |              |
 chapters / decisions / lessons
               |
 kickoff | start | update-docs | finish
               |
        code -> verify -> deliver
```

Source skill packages live in `skills/`. The installer places project-scoped copies in `.agents/skills/`, the repository location Codex scans. The source package remains authoritative; installed copies are refreshed deliberately and checked for local drift.

## Knowledge map

| Question | Read |
|---|---|
| What are we doing now and next? | [ROADMAP.md](ROADMAP.md) |
| What is the complete v3 contract? | [V3 blueprint](../docs/v3-blueprint.md) |
| What survives from the legacy system? | [V3 migration map](../docs/v3-migration-map.md) |
| How is v3 implemented? | [Architecture](chapters/architecture.md) |
| Why are skills installed per repository? | [Repository-scoped skills decision](decisions/2026-08-11-repository-scoped-skills.md) |
| Where do Riley's cross-project preferences live? | [Riley-global context decision](decisions/2026-08-13-riley-global-context.md) |
| How do sessions discover and verify external access? | [Project access contracts decision](decisions/2026-08-13-project-access-contracts.md) |
| How do private client scopes relate to shared work? | [Client scopes and shared work decision](decisions/2026-08-11-client-scopes-and-shared-work.md) |
| What does the distributable package contain? | [Repository README](../README.md) |

## Open product questions

There are no questions blocking daily use. Packaging for broader distribution remains deliberately deferred while Riley's private system accumulates operating evidence.
