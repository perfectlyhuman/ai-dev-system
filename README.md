# AI Dev System

AI Dev System is Riley's Codex-native operating system for building products quickly without losing product intent, technical rationale, roadmap direction, or hard-won lessons between sessions.

It adds a small durable layer around Codex:

```text
idea -> kickoff -> roadmap -> build -> verify -> ship -> learn
                    ^                              |
                    +------ durable memory <------+
```

Ordinary coding remains ordinary conversation with Codex. The system provides only four lifecycle skills:

| Skill | Use it when |
|---|---|
| `kickoff` | A new idea or undocumented product needs a trustworthy foundation. |
| `start` | Beginning every product or coding session. |
| `update-docs` | Meaningful decisions, progress, or reusable lessons have accumulated. |
| `finish` | Closing a substantive session; this includes the necessary documentation pass, verification, commit, and configured delivery. |

## What gets installed

```text
.ai-dev/project.yaml          Project-specific paths and standing authorization
.agents/skills/               Repository-scoped lifecycle skills Codex discovers
documentation/PROJECT.md      Product intent and project orientation
documentation/ROADMAP.md      Canonical current and upcoming work
documentation/chapters/       Deeper product and technical context
documentation/decisions/      Material decisions worth preserving
documentation/lessons/        Expensive mistakes worth preventing
documentation/archive/        Completed roadmap history
```

The internal `ROADMAP.md` is canonical. External systems such as Linear are optional project adapters, never competing sources of truth.

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
--integration direct|pull-request
--deployment none|automatic|manual
```

The installer is idempotent. It does not overwrite an existing project contract or canonical documentation. If an installed skill has local drift, installation stops until the difference is reviewed; `--refresh-skills` deliberately restores the authoritative source copy.

After installation, ask Codex to run `kickoff` for a new or undocumented product. For an established project with trustworthy documentation, begin with `start`.

## Repository map

| Path | Purpose |
|---|---|
| `skills/` | Authoritative lifecycle skill packages. |
| `installer/` | Installer and its tests. |
| `schema/` | Strict project-contract schema. |
| `templates/` | Initial canonical documentation scaffolds. |
| `documentation/` | This project's own canonical memory. |
| `docs/` | V3 design, migration, and self-hosting evidence. |

## Verify

```text
npm test
npm run check
```

The design contract is documented in [`docs/v3-blueprint.md`](docs/v3-blueprint.md). Current product direction lives in [`documentation/ROADMAP.md`](documentation/ROADMAP.md).
