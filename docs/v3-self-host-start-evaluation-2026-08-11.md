# V3 Self-Hosted Start Evaluation — 2026-08-11

## Scope

Exercise the installed `.agents/skills/start/SKILL.md` against `ai-dev-system` using only the v3 project contract, canonical documentation, repository state, and configured integrations.

## Inputs discovered

- `.ai-dev/project.yaml` identified the project as design-partner stage with `ship` delivery authorization on `master`.
- `documentation/PROJECT.md` restored the product thesis, Riley's working contract, current scope, and knowledge map.
- `documentation/ROADMAP.md` identified V3-SH-001 as the coherent in-progress outcome and V3-SH-002 as the next ready milestone.
- The relevant architecture chapter and repository-scoped skill decision supplied implementation context without loading unrelated legacy documentation.
- Git showed `master`, one pre-existing local commit ahead of `origin/master`, the uncommitted v3 unit, and unrelated root `.claude/` state.
- Optional Riley-global files were absent and did not block orientation.
- Linear and intake were disabled, so no external projection was consulted.

## Result

**Behavioral contract: pass.** The workflow:

- restored the correct product and roadmap context without a HANDOFF file;
- treated approved v3 decisions as settled;
- preserved unrelated `.claude/` state;
- reported the meaningful repository delta;
- omitted irrelevant external-system ceremony; and
- recommended one next action: complete the first self-hosted `finish` before cutting over the legacy root product.

## Fresh-task discovery confirmation

The task immediately following installation exposed `kickoff`, `start`, `update-docs`, and `finish` in its available skill inventory. Repository-scoped discovery therefore passes without a Codex restart.

## Decision

V3-SH-001 is complete. V3-SH-002 now closes the coherent v3 unit through verification and delivery.
