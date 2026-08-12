# Partition private client scopes from shared work

**Date:** 2026-08-11
**Status:** Accepted

## Context

Banks develops a reusable product while also delivering work for individual clients. L'Ecole currently sees initiatives, projects, and tasks through a Supabase-backed application. That shared surface is useful, but it cannot safely carry the complete context Banks needs to reason and operate well. Technical detail, delivery hypotheses, unresolved questions, conflicts, risks, stakeholder dynamics, and politically sensitive observations may be necessary internally while being inappropriate or harmful to expose bluntly.

Treating Supabase as the only client work system would erase that private operating memory. Mirroring the same roadmap into both Markdown and Supabase would instead create drift and make the audience boundary unreliable.

## Decision

Use three partitioned work layers in consulting and custom-development repositories:

1. The root project roadmap owns the reusable product, platform, and builds.
2. Each client scope has a private repository-local project system, including its own roadmap, chapters, decisions, lessons, and archive. It owns internal engagement execution and reasoning.
3. Optional `shared_work` owns only deliberately client-visible commitments, outcomes, status, and collaboration. Banks uses Supabase for this surface.

Related records may link through stable identifiers, but their descriptions are not mirrored. A record may exist in one layer without counterparts in the others. Private scope content is never automatically projected into shared work, and implementation does not by itself create a client commitment.

## Reasoning

This preserves the full context required for strong technical and interpersonal judgment while keeping the client experience clear, tactful, and trustworthy. Partitioning by purpose and audience prevents duplicate sources of truth: each layer is canonical for a different question.

## Consequences

- `.ai-dev/project.yaml` must declare private client-scope documentation separately from optional shared work.
- `start`, `update-docs`, and `finish` must reason across the layers without flattening them.
- Shared updates must be written for the client audience rather than copied or mechanically sanitized from private prose.
- Private roadmap items commonly have no shared counterpart; this is expected, not drift.
- Banks' L'Ecole migration must create a private client tree while retaining Supabase as the shared work surface.

## Revisit condition

Revisit if multiple real client engagements show that the partition prevents necessary collaboration, creates recurring unresolvable linkage overhead, or requires a fourth category of canonical work.
