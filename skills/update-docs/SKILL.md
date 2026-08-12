---
name: update-docs
description: "Reconcile an AI Dev System project's canonical documentation with meaningful work, decisions, lessons, and roadmap progress. Use periodically after substantial implementation, debugging, product decisions, accumulated learnings, or detected documentation drift, and automatically as part of finish. Do not use to narrate every small code change."
---

# Update durable project knowledge

Make the repository easier for a fresh future session to understand. Preserve signal by documenting only what changes future reasoning or action.

## 1. Establish the comparison

Read `.ai-dev/project.yaml`, the configured `PROJECT.md`, active `ROADMAP.md`, and only documentation related to the work under review.

Inspect relevant evidence:

- working-tree and staged diffs;
- commits since the documentation was last meaningfully reconciled;
- code, tests, migrations, and configuration changed by the work;
- roadmap items affected; and
- decisions or lessons stated during the current task.

Do not assume commit messages or the conversation are accurate when the code provides stronger evidence.

## 2. Apply the durability test

Update documentation when at least one is true:

- The product's behavior, scope, audience, or priority changed.
- The architecture, data flow, integration, operational procedure, or important code-routing information changed.
- Roadmap state or dependencies materially changed.
- A decision is likely to be questioned again and its rationale matters.
- A false assumption or gotcha would plausibly cost a future session meaningful time.
- Existing documentation is now false, contradictory, or misleading.

Do not document merely because files changed, a routine implementation choice was made, or a small bug was fixed.

## 3. Update the canonical layer first

Make the smallest coherent documentation change:

- Keep `PROJECT.md` compact and update it only when project-level orientation changed.
- Keep `ROADMAP.md` focused on current, next, and later work.
- Update only affected chapters.
- Add a decision record only for a material choice. Include context, decision, reasoning, consequences, and a concrete revisit condition.
- Add a lesson only for durable negative knowledge. Include the false assumption, observed reality, resolution, and future prevention.

Replace stale statements; do not append a contradictory new paragraph beneath them. Link to one canonical explanation instead of copying it across files.

Never place credentials or secret values in documentation.

## 4. Reconcile the roadmap

Reflect verified reality:

- Mark completed outcomes complete only when evidence supports completion.
- Keep partial work in progress and say what remains.
- Add newly discovered work only when it belongs on the product path.
- Record blockers with the condition required to clear them.
- Remove obsolete work instead of preserving it as noise.

When completed items no longer help decide current work, move them into a dated or quarterly file under the configured roadmap archive. Preserve meaningful shipped outcomes and rationale, not a transcript of checkboxes.

## 5. Refresh optional projections

If Linear is enabled, update its selected non-technical projection only after the internal roadmap is correct. Include outcome, status, timing, and stakeholder-relevant context. Keep technical specifications and architectural reasoning in the repository.

If Linear contains new input that changes direction, reconcile that input into the internal roadmap deliberately before projecting it back.

## 6. Verify and report

Re-read the changed documentation and check:

- it agrees with current code and roadmap reality;
- the why is present where future judgment depends on it;
- settled decisions were not reopened without evidence;
- duplicated or stale text was removed; and
- changes are proportional to the knowledge gained.

Report:

- files changed and the durable reason for each;
- decisions or lessons captured;
- roadmap/archive movement;
- external projections refreshed; and
- meaningful changes intentionally left undocumented.

If this standalone update completes a planning boundary, name the single recommended next action and offer `go`. When running inside `finish`, return control to `finish` without creating a separate checkpoint.
