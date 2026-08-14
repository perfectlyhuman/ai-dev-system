# Declare and verify project access without storing secrets

**Date:** 2026-08-13
**Status:** Accepted

## Context

New project sessions can understand product intent yet still stall when GitHub, deployment, database, DNS, email, monitoring, or analytics access is missing or ambiguous. Provider logins, API keys, organization identities, remote project IDs, and installed CLIs have been implicit machine state. Agents therefore discover gaps late and tend to ask Riley to locate a token without knowing the required scope or safe destination.

## Decision

Every installed project receives a non-secret `.ai-dev/access.yaml` manifest. Each request declares a friendly credential route, optional remote resource, and least required capabilities. The machine-wide registry resolves that route to a provider identity and one source:

- `cli` uses a provider-specific harmless identity or metadata check against normal persistent CLI authentication.
- `bitwarden` references a central Secrets Manager project, one named secret UUID, its application environment-variable name, and approved project consumers. Values and machine-account access tokens never enter the repository.

The installed `access` skill owns diagnosis and resolution. Its doctor reports readiness without returning provider command output or secret values. Persistent authenticated CLIs remain directly usable for normal provider operations. Bitwarden-backed values may be used only through explicit broker adapters with constrained inputs and non-secret results. The initial adapter verifies the source, approved consumer, Bitwarden project membership, declared Vercel destination, and `environment:write` capability before passing one application key to Vercel over standard input.

There is intentionally no generic command runner and no command that prints a secret. One central Bitwarden project is the source of truth, while the registry makes project consumers explicit. The machine token is protected locally with Windows DPAPI. This is a practical guardrail against accidental chat, log, shell-history, and repository disclosure—not a cryptographic boundary from code already running as Riley's Windows user. Hard isolation would require a broker under another OS identity or on a remote service.

## Why

The manifest makes requested access durable and reviewable while keeping provider identity and credential routing centralized. Provider-specific checks distinguish unknown identity, missing tooling, unfinished setup, and failed authentication before a session begins deployment or integration work. Explicit broker adapters cover common operations without turning possession of a credential alias into arbitrary secret access.

## Consequences

- Installer-managed projects gain `.ai-dev/access.yaml` and the `access` skill.
- The machine registry groups observed accounts, organizations, remote resources, and credential routes; project manifests refer to stable aliases rather than rediscovering identity each session.
- The global registry and project access manifest remain JSON-compatible YAML so the runtime needs no YAML package.
- GitHub, Vercel, and Supabase prefer persistent first-party CLI sessions; API-only services use Bitwarden-backed credentials.
- The initial runtime proves reachability and direct Bitwarden-to-Vercel installation. New destinations require explicit adapters rather than arbitrary child-process injection.
- The live Bitwarden project, read-only machine account, DPAPI-protected token, and project-access verification are complete. Application-key onboarding and rotation are verified when a real consumer reaches them.
- Access UUIDs may be committed; credential values and machine tokens may not.

## Revisit if

Codex gains a native, project-scoped secret and provider-identity mechanism that supplies equivalent least-privilege access, auditability, portability, and non-disclosure guarantees.
