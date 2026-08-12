# AI Dev System v3

This directory is the clean Codex-native implementation of the approved v3 design. The legacy Claude implementation remains outside `v3/` as historical evidence during construction.

V3 provides four focused skills:

| Skill | Purpose |
|---|---|
| `kickoff` | Turn an idea into a build-ready project foundation. |
| `start` | Restore current context and recommend the highest-value next action. |
| `update-docs` | Reconcile durable knowledge and roadmap reality. |
| `finish` | Document, verify, commit, and deliver the session's work. |

Ordinary implementation stays in natural language. V3 does not wrap branching, testing, debugging, or framework guidance in additional required rituals.

## Project contract

Each installed project has `.ai-dev/project.yaml`, validated by `schema/project.schema.json`. The contract declares project-specific paths, maturity, verification commands, delivery authorization, and optional integrations.

The canonical documentation defaults to:

```text
documentation/
  PROJECT.md
  ROADMAP.md
  chapters/
  decisions/
  lessons/
  archive/roadmap/
```

## Delivery modes

- `commit`: verify and commit locally.
- `push`: verify, commit, and push the working branch.
- `ship`: verify, commit, integrate, and verify deployment where configured.

The mode is standing authorization used by `finish`. It should reflect the project's real risk and deployment posture.

## Install into a project

From this repository, run:

```text
node v3/installer/install.mjs \
  --project <project-path> \
  --description "What this product does" \
  --entity <entity-alias>
```

The installer creates `.ai-dev/project.yaml`, canonical documentation scaffolds, and repository-scoped skills under `.agents/skills/`. It is idempotent. If an installed skill differs from its source, installation stops until the difference is reviewed; use `--refresh-skills` to deliberately replace installed copies.

Run `node v3/installer/install.mjs --help` for maturity, delivery, branch, and integration options. Then use `kickoff` to replace scaffolds with a real product foundation.

## Current implementation state

The skill contracts, schema, templates, and installer are implemented. V3 is self-hosted, repository discovery is confirmed, and the complete daily loop is proven. The next phase replaces the legacy root package and install surface.

See `../docs/v3-blueprint.md` for the authoritative design and `../docs/v3-migration-map.md` for legacy dispositions and the cutover sequence.
