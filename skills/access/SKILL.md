---
name: access
description: "Inspect and resolve the accounts, credentials, CLI authentication, and programmatic service access declared by an AI Dev System project. Use when a project needs GitHub, Vercel, Supabase, Cloudflare, Resend, Sentry, PostHog, OpenAI, or Bitwarden access; when an agent encounters missing credentials or permissions; or when configuring a new project's external services."
---

# Resolve project access

Make external access predictable without placing secret values in repositories, documentation, chat, shell history, or command output. Treat the local broker as a practical guardrail, not a hard security boundary from other processes running as Riley's Windows user.

## 1. Read the access contract

Find `.ai-dev/access.yaml` at the owning project root. It is JSON-compatible YAML so the dependency-free runtime can parse it deterministically. Each request names a friendly credential route, optional remote resource, and required capabilities. Resolve the route through the JSON-compatible `C:\Users\riley\.ai-dev-system\registry.yaml`; that global file contains provider, account, consumer, CLI, and non-secret Bitwarden references.

Treat the manifest as a request contract, not proof that access works. A global credential route must list the requesting project as an approved consumer. Consult only relevant non-secret identity and service metadata. Never put secret values in either file.

If the manifest is missing, create it from the installed template or add only the requirements supported by product and deployment evidence. Do not invent services merely because they are common.

## 2. Diagnose before requesting credentials

Run from the project root:

```text
node .agents/skills/access/scripts/access.mjs doctor
```

Use `--provider <name>` to limit checks to the service relevant to the current task. The doctor reports readiness without returning credential values.

For first-party CLI authentication, use the provider's normal persistent login and verify the expected account and remote resource. For application API keys, use the central Bitwarden Secrets Manager project and the registered local broker machine account. Secret and project UUIDs are non-secret references; secret values and the machine-account access token are not.

## 3. Resolve the smallest missing capability

Prefer these access paths:

- GitHub, Vercel, and Supabase: installed first-party CLI with persistent authentication.
- Cloudflare and Sentry: first-party CLI when available, with narrowly scoped tokens supplied from Bitwarden when non-interactive access is required.
- Resend, PostHog, and OpenAI: narrowly scoped Bitwarden-backed application credentials installed directly into the declared runtime by the broker.

Install missing tooling only when the current project declares the provider. Authentication that opens a browser, creates an account, enables billing, grants organization access, or mints a machine token requires Riley. Give one exact action and continue with all work that does not depend on it.

Never ask Riley to paste a secret into chat. Have Riley enter it directly into Bitwarden or the provider's authenticated prompt. Never print, return, or write a retrieved secret to a repository to prove that it works; prove access with a harmless identity, metadata, or list operation.

To copy a declared Bitwarden application key directly into a declared Vercel project, run:

```text
node .agents/skills/access/scripts/access.mjs install <request> --to <vercel-request> --environment <development|preview|production>
```

The broker verifies the source route, approved consumer, Bitwarden project membership, destination route, and explicit `environment:write` capability. It passes the value to Vercel over standard input and returns only installation status. The broker intentionally has no arbitrary command runner and no raw-secret output command. Add future provider operations as explicit adapters with constrained inputs and non-secret results.

## 4. Keep access scoped and durable

Keep one central Bitwarden source of truth and register every project consumer. The local machine token is protected with Windows DPAPI and used only inside broker adapters. This prevents accidental chat and log exposure, but code running as the same Windows user is not cryptographically isolated from it; stronger isolation would require moving the broker to another OS identity or remote service.

When access changes materially, update `.ai-dev/access.yaml`, relevant non-secret aliases in `registry.yaml`, and canonical project documentation. Credential values never belong in those records.
