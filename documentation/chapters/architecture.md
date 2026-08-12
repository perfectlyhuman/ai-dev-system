# V3 Architecture

## Purpose

V3 supplies the smallest durable layer Codex needs to work coherently across sessions and projects. It owns project orientation, roadmap direction, knowledge reconciliation, and session closure; Codex retains responsibility for ordinary reasoning and implementation.

## Mental model

The system has four layers:

1. Optional Riley-global context for stable working preferences, project locations, account aliases, and future credential routing.
2. `.ai-dev/project.yaml` for facts that vary by project: maturity, documentation paths, verification, delivery authorization, and optional integrations.
3. Repository-local canonical memory in `documentation/`.
4. Four focused Codex skills for `kickoff`, `start`, `update-docs`, and `finish`.

Code and external systems are evidence, not additional competing memory layers. Git records implementation history. Linear is an optional Commodore stakeholder projection. Deployment platforms report delivery reality.

## Architecture and flow

```text
kickoff -> project contract + canonical memory
                         |
start -> orient -> recommend next work
                         |
              natural-language implementation
                         |
update-docs -> reconcile durable changes
                         |
finish -> reconcile -> verify -> commit -> deliver
```

`start` does not read a generated session handoff. It reconstructs current state from the project contract, canonical documents, git, and configured external signals. `finish` updates those same durable sources and completes delivery according to standing authorization.

## Code map

| Area | Path | Responsibility |
|---|---|---|
| Authoritative design | `docs/v3-blueprint.md` | Product and behavior contract. |
| Migration decisions | `docs/v3-migration-map.md` | Keep, adapt, remove, and cutover sequence. |
| Skill sources | `skills/` | Distributable lifecycle skill packages. |
| Installed skills | `.agents/skills/` | Repository-scoped copies Codex discovers. |
| Installer | `installer/install.mjs` | Safe scaffold and skill synchronization. |
| Installer tests | `installer/install.test.mjs` | Idempotency, drift protection, refresh, and dry-run behavior. |
| Project schema | `schema/project.schema.json` | Machine-readable project contract. |
| Templates | `templates/` | Initial canonical document structures. |

## Working conventions

- Change skill sources under `skills/`, then run the installer with `--refresh-skills` to update installed copies.
- Never hand-edit installed copies without intentionally creating drift; the installer will stop rather than overwrite it silently.
- Keep project-specific facts in `.ai-dev/project.yaml` or canonical documentation, not in shared skill instructions.
- Do not place secret values in the project contract or documentation.
- Treat `skills/`, `templates/`, `schema/`, and `installer/` as the canonical product packages. Superseded implementations exist only in git history.

## Verification

Run:

```text
node --check installer/install.mjs
node --test installer/install.test.mjs
```

Validate `.ai-dev/project.yaml` against `schema/project.schema.json` after contract changes. Validate all skill source and installed folders with the official skill validator after skill changes.

## Related decisions and lessons

- [Install lifecycle skills per repository](../decisions/2026-08-11-repository-scoped-skills.md)
- [Run validation tools in an explicit dependency and cache environment](../lessons/2026-08-11-skill-validator-python-dependency.md)
