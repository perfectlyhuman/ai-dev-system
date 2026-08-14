# AI Dev System

AI Dev System is Riley's Codex-native operating system for building products quickly without losing product intent, technical rationale, roadmap direction, or hard-won lessons between sessions.

It adds a small durable layer around Codex:

```text
idea -> kickoff -> roadmap -> build -> verify -> ship -> learn
                    ^                              |
                    +------ durable memory <------+
```

Ordinary coding remains ordinary conversation with Codex. The system provides four lifecycle skills and one focused access capability:

| Skill | Use it when |
|---|---|
| `kickoff` | A new idea or undocumented product needs a trustworthy foundation. |
| `start` | Beginning every product or coding session. |
| `access` | Checking or resolving declared GitHub, deployment, data, infrastructure, email, monitoring, and analytics access without exposing secrets. |
| `update-docs` | Meaningful decisions, progress, or reusable lessons have accumulated. |
| `finish` | Closing a substantive session; this includes the necessary documentation pass, verification, commit, and configured delivery. |

## What gets installed

The first installation on a machine also creates Riley-global context shared by every project:

```text
C:\Users\riley\.ai-dev-system\RILEY.md       Cross-project working contract
C:\Users\riley\.ai-dev-system\projects.yaml Local project-path index
C:\Users\riley\.ai-dev-system\registry.yaml Non-secret account and service metadata
```

`RILEY.md` is personal durable guidance and is never overwritten by later installs. The installer safely registers each project in JSON-compatible `projects.yaml`. `registry.yaml` groups observed provider accounts, organizations, and remote-resource IDs; it contains aliases and identifiers only, while secret values belong in the selected credential provider.

Each project receives:

```text
.ai-dev/project.yaml          Project-specific paths and standing authorization
.ai-dev/access.yaml           Non-secret external capability and credential references
.agents/skills/               Repository-scoped lifecycle skills Codex discovers
documentation/PROJECT.md      Product intent and project orientation
documentation/ROADMAP.md      Canonical current and upcoming work
documentation/chapters/       Deeper product and technical context
documentation/decisions/      Material decisions worth preserving
documentation/lessons/        Expensive mistakes worth preventing
documentation/archive/        Completed roadmap history
```

The internal `ROADMAP.md` is canonical. External systems such as Linear are optional project adapters, never competing sources of truth.

Access requests are explicit and testable. Projects name friendly credential routes and capabilities; the machine registry resolves those routes to persistent provider CLI sessions or central Bitwarden Secrets Manager references. Run `node .agents/skills/access/scripts/access.mjs doctor` from an installed project to check readiness without returning provider output or credential values. For application keys, `access.mjs install <request> --to <vercel-request> --environment <name>` copies one approved secret directly from Bitwarden into Vercel. There is no arbitrary secret-to-command runner or raw-secret output command.

Consulting and custom-development repositories may also define private client scopes. Each scope has its own internal roadmap and durable knowledge tree. An optional Supabase `shared_work` surface contains only deliberately client-visible initiatives, projects, and tasks; it does not replace or mirror the private client operating context.

## Install into a project

Run the installer from this repository:

```powershell
node C:\Users\riley\perfectlyhuman\ai-dev-system\installer\install.mjs `
  --project C:\path\to\project `
  --description "What this product does" `
  --entity "perfectlyhuman"
```

Or, when using the npm package:

```text
npx create-ai-dev --description "What this product does" --entity perfectlyhuman
```

Useful configuration options include:

```text
--stage prototype|design-partner|live
--delivery-mode commit|push|ship
--main-branch <name>
--preview-branch <name>
--integration direct|pull-request
--deployment none|automatic|manual
--global-root <path>
```

The installer is idempotent. It does not overwrite existing global guidance, a project contract, or canonical documentation. If an installed skill has local drift, installation stops until the difference is reviewed; `--refresh-skills` deliberately restores the authoritative source copy.

After installation, ask Codex to run `kickoff` for a new or undocumented product. For an established project with trustworthy documentation, begin with `start`.

## Repository map

| Path | Purpose |
|---|---|
| `skills/` | Authoritative lifecycle and access skill packages. |
| `installer/` | Installer and its tests. |
| `schema/` | Strict project and access contract schemas. |
| `templates/` | Initial canonical documentation scaffolds. |
| `documentation/` | This project's own canonical memory. |
| `docs/` | V3 design, migration, and self-hosting evidence. |

## Verify

```text
npm test
npm run check
```

The design contract is documented in [`docs/v3-blueprint.md`](docs/v3-blueprint.md). Current product direction lives in [`documentation/ROADMAP.md`](documentation/ROADMAP.md).
