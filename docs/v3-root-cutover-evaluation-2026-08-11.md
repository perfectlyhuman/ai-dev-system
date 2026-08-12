# V3 Root Cutover Evaluation — 2026-08-11

## Scope

Make the proven Codex-native implementation the repository's only default product and prove that its packed npm executable installs a clean project from scratch.

## Product cutover

- Promoted `skills/`, `templates/`, `schema/`, and `installer/` from the isolated v3 build surface to canonical root paths.
- Replaced the root README, npm metadata, package executable, and verification scripts with the v3 product.
- Removed the tracked legacy `solo/` runtime, team skills, templates, examples, setup modes, redundant system manual, and OMC-era diagnostics.
- Retained migration rationale and self-hosting evidence under `docs/`.
- Left ignored machine-local `.claude/`, `.omc/`, and `.superpowers/` state outside the product and untouched.

## Verification

- `npm.cmd run check` passed.
- `npm.cmd test` passed: 2 tests, 0 failures.
- Self-hosted installer idempotency passed from the new root path.
- Source and installed copies of all four lifecycle skills match.
- `npm pack` produced `create-ai-dev-3.0.0.tgz` with 18 product files and no legacy package paths or content.
- A clean local install of that tarball exposed the generated `create-ai-dev` executable.
- The packed executable created `.ai-dev/project.yaml`, both canonical entry documents, and all four repository-scoped skills in an empty fixture.
- The fixture contained no `.claude/` directory.
- The live product surface contained no legacy provider or orchestration references.

## Outcome

V3-CUT-001 passes. The repository now has one installable product: the Codex-native AI Dev System. The next product proof is V3-PILOT-001, the `banks` audit and migration.
