# AI Dev System

AI Dev System is Riley's operating system for building products with any coding agent — **Codex**, **Cursor**, or **Claude Code** without losing product intent, technical rationale, roadmap direction, or hard-won lessons between sessions.

It adds a small durable layer around ordinary coding:

```text
idea -> kickoff -> roadmap -> build -> verify -> ship -> learn
                    ^                              |
                    +------ durable memory <------+
```

Ordinary implementation stays natural language. The system provides lifecycle skills and focused access resolution:

| Skill | Use it when |
|---|---|
| `kickoff` | A new idea or undocumented product needs discovery and canonical `documentation/` |
| `start` | Beginning every product or coding session |
| `access` | GitHub, Vercel, Supabase, Cloudflare, Resend, Sentry, PostHog, OpenAI, Bitwarden — without exposing secrets |
| `update-docs` | Meaningful decisions, progress, or reusable lessons have accumulated |
| `finish` | Closing a substantive session — **includes `update-docs`**, verification, commit, and configured delivery |

Invoke with `/start`, `/finish`, and so on in Cursor and Claude Code (`$start` in Codex), or let the agent match skill descriptions.

## What gets installed

The first installation on a machine also creates Riley-global context:

```text
~/.ai-dev-system/RILEY.md       Cross-project working contract
~/.ai-dev-system/projects.yaml  Local project-path index
~/.ai-dev-system/registry.yaml  Non-secret account and service metadata
```

`RILEY.md` is personal durable guidance and is never overwritten by later installs. When `~/.claude/` exists, the installer appends one `@~/.ai-dev-system/RILEY.md` import to `~/.claude/CLAUDE.md` so Claude Code loads it every session.

Each project receives:

```text
AGENTS.md                     Always-on agent contract (created if absent)
CLAUDE.md                     `@AGENTS.md` import so Claude Code loads the same contract
.ai-dev/project.yaml          Project-specific paths and standing authorization
.ai-dev/access.yaml           Non-secret external capability and credential references
.agents/skills/               Repository-scoped lifecycle skills (Codex, Cursor)
.claude/skills/               Identical copies for Claude Code; a `.claude/` gitignore is narrowed so these are tracked
documentation/PROJECT.md      Product intent and project orientation
documentation/ROADMAP.md      Canonical current and upcoming work
documentation/chapters/       Deeper product and technical context
documentation/decisions/      Material decisions worth preserving
documentation/lessons/        Expensive mistakes worth preventing
documentation/archive/        Completed roadmap history
```

The internal `ROADMAP.md` is canonical. External systems such as Linear are optional adapters, never competing sources of truth.

Run `node .agents/skills/access/scripts/access.mjs doctor` from an installed project to check access readiness without returning secrets. For application keys, `access.mjs install <request> --to <vercel-request> --environment <name>` copies one approved secret from Bitwarden into Vercel when routes exist in `registry.yaml`.

## Install into a project

```powershell
node path\to\ai-dev-system\installer\install.mjs `
  --project C:\path\to\project `
  --description "What this product does" `
  --entity "perfectlyhuman"
```

Or:

```text
npx create-ai-dev --description "What this product does" --entity perfectlyhuman
```

**Makerkit stack** (existing monorepo):

```text
npx create-ai-dev --profile makerkit --description "..." --entity perfectlyhuman
```

**New Makerkit project** (clone + install — provider wiring follows `docs/makerkit-bootstrap.md`):

```text
node installer/bootstrap-makerkit.mjs `
  --project C:\path\to\new-app `
  --template <your-makerkit-git-url> `
  --description "What it does" `
  --entity perfectlyhuman
```

Useful options:

```text
--stage prototype|design-partner|live
--delivery-mode commit|push|ship
--main-branch <name>
--preview-branch <name>
--integration direct|pull-request
--deployment none|automatic|manual
--global-root <path>
--claude-root <path>
--refresh-skills
```

The installer is idempotent. It does not overwrite `AGENTS.md`, `.ai-dev/project.yaml`, canonical documentation, or existing `RILEY.md`. Skills refresh only with `--refresh-skills` when drift is reviewed.

After installation, run **`/kickoff`** for a new or undocumented product, or **`/start`** when documentation is already trustworthy.

## Repository map

| Path | Purpose |
|---|---|
| `skills/` | Authoritative lifecycle and access skill packages |
| `installer/` | Installer, bootstrap helper, tests |
| `scripts/` | Machine maintenance (e.g. remove retired agent plugins) |
| `schema/` | Project and access contract schemas |
| `templates/` | `AGENTS.md`, documentation, and profile scaffolds |
| `documentation/` | This project's canonical memory |
| `docs/` | Design evidence and bootstrap specs |

## Verify

```text
npm test
npm run check
```

Product direction: [`documentation/ROADMAP.md`](documentation/ROADMAP.md). Makerkit bootstrap spec: [`docs/makerkit-bootstrap.md`](docs/makerkit-bootstrap.md).
