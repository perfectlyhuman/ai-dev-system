# Decision: Trello is the default stakeholder projection

**Date:** 2026-10-29
**Status:** accepted

## Context

V3 modelled one stakeholder adapter, `integrations.linear`, and left it out of the schema for every
other board. Commodore then moved its shared founder roadmap to Trello — lists as buckets, labels as
workstreams, founder-facing card wording — and wrote the reconciliation rules into a repository
decision. The contract had no slot for the surface the project actually depends on, so the only
record of it was prose inside `AGENTS.md`.

Riley now intends to use Trello instead of Linear for this kind of projection going forward.

## Decision

`integrations.trello` becomes the default stakeholder projection and `integrations.linear` remains
supported for projects already running on it. A project declares at most one of them, both shaped the
same way: a non-secret `board`/`workspace` identity, `projection: stakeholder`, and an optional
`governance` path pointing at the repository decision that defines lists, labels, intake rules, and
wording constraints for that surface.

Skill text stays provider-generic and defers board shape to that governance record. `trello` is added
to the credential-provider enum in the access registry so a future API token can have a non-secret
route; no CLI check is defined for it, so the doctor reports that honestly rather than pretending.

## Why

The canonical-versus-projection contract does not depend on which product hosts the board. Both are a
non-technical view of direction and progress for people who should not read the repository, both take
stakeholder input that must be reconciled deliberately, and neither may silently override
`ROADMAP.md`. Encoding the host product in the skill prose meant every new board rewrote guidance
that was never about the host.

Board shape, unlike the contract, is genuinely project-specific: Trello calls buckets lists and
workstreams labels, and Commodore already documents founder-facing wording rules that would be wrong
to impose on another project. A `governance` pointer keeps that where it belongs without duplicating
it into shared instructions.

## Consequences

- Commodore can declare its board in `.ai-dev/project.yaml` instead of describing it only in
  `AGENTS.md`, and `start`/`update-docs` now look for `integrations.trello` as well as
  `integrations.linear`.
- New projects default to `trello: false`; declaring a projection remains optional.
- A project with two boards must pick one declared projection; the other is out of the contract.
- Linear guidance in `docs/v3-blueprint.md` is now provider-neutral, so it does not need rewriting
  when a board host changes again.

## Revisit when

A project needs two simultaneous stakeholder surfaces, a board host exposes an API the doctor can
verify without a token, or Trello stops being the practical default.
