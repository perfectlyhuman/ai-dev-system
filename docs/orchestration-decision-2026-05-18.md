---
last_updated: 2026-05-18
updated_by: agent
status: adopted-for-seek
scope: per-project (Seek is the first adopter)
supersedes: docs/omc-integration-plan-2026-05-18.md (Task 11 left this as an open question)
---

# Orchestration Decision — OMC-only default (Seek, 2026-05-18)

## TL;DR

For Seek, **OMC is the sole per-feature orchestration plugin**. `superpowers` is
disabled at the project level via `seek/.claude/settings.local.json` →
`enabledPlugins.superpowers@claude-plugins-official: false`. ai-dev-system
continues to provide the outer shell. This decision is project-scoped (Seek
specifically) and easily reversible (one line flip in `enabledPlugins`).

## Context — how we got here

The original assumption when we installed OMC (2026-05-18 morning) was that OMC's
team mode would *add* parallel-execution capability on top of superpowers'
sequential `writing-plans → subagent-driven-development` chain. We expected the
two plugins to be complementary: OMC owns the autonomy/team layer, superpowers
owns the per-task TDD + review rigor, ai-dev-system owns project lifecycle and
chapter memory. Three layers, each with a clear job.

That assumption did not survive contact with reality. Across two smoke-test runs
(`P1.5` and `P1-007`) with both plugins enabled, OMC's `/grind-phase` skill
*never* invoked team mode — it silently fell through to the superpowers execution
path every time. Investigation revealed:

1. **OMC team primitives are not exposed as Claude Code tools** in our install
   (Claude Code 2.1.144). `TeamCreate`, `TeamDelete`, `SendMessage`,
   `state_write`, `state_read` — all referenced in OMC's docs and skill bodies
   but none of them appear as callable tools or even as deferred tools requiring
   ToolSearch. They appear to be primitives in a version of Claude Code we
   either don't have access to or don't have yet.
2. **OMC and superpowers overlap heavily** on the orchestration layer. Both
   inject skills aggressively at session start. Both have hook ecosystems that
   touch the same lifecycle events. Both want to be the "router" that decides
   what to do next. When loaded together, the resolution order is non-obvious
   and depends on whichever plugin wins the skill-injection race.
3. **The discipline floor came from ai-dev-system, not from either plugin.** In
   all three runs (two hybrid + one pure-OMC), what kept the code quality high
   and the chapter docs honest was: Iron Laws in the project preamble, the
   chapter survey gate before approach proposals, the `/update-docs` requirement
   before declaring work done, the no-deploy-without-fresh-test-output rule.
   None of those live in superpowers or OMC. They live in `solo/.claude/` and
   `seek/.claude/` and `seek/documentation/`. The hypothesis "ai-dev-system is
   the floor, plugins are texture" held up in evidence.

## The controlled experiment (Run #3)

To test "is OMC-only enough?" without confounders, we:
- Set `enabledPlugins.superpowers@claude-plugins-official: false` in
  `seek/.claude/settings.local.json`.
- Trimmed the `permissions.allow` list to the OMC-relevant patterns (kept
  `Skill(superpowers:brainstorming)` as the one exception — see below).
- Ran a Phase work block end-to-end (P1-007 production TTS) using only OMC's
  `/grind-phase` orchestrator and OMC-injected skills.

**Results:**
- Code quality: equivalent to the hybrid runs. Tests landed, units passed, the
  acceptance script ran live against DeepInfra Kokoro-82M, three Learnings
  landed in `architecture.md`.
- Permission prompts: ≈0 (vs 7 on the P1.5 hybrid run, 2 on P1-007 hybrid).
  Mostly because we'd front-loaded the allowlist patterns based on prior runs,
  but also because OMC-alone doesn't trigger as many cross-plugin permission
  surface area decisions.
- Commit cadence: coarser. OMC defaults to fewer-larger commits where
  superpowers' subagent-driven-development insists on commit-per-task. For a
  pre-launch solo project this is closer to how Riley actually reviews work
  (the diff shows up in his Cursor file tree; tiny commits are noise, not
  signal).
- Workflow texture: less rigid review choreography. Riley's preference (from
  prior feedback) is for the agent to use judgment about when to surface, not
  to ritualistically request approval at every checkpoint. OMC-only respects
  this without abandoning thoroughness.

## Why brainstorming is the one exception

`Skill(superpowers:brainstorming)` is explicitly kept in `permissions.allow`
because:
- OMC doesn't have a clean equivalent of the "1-question-at-a-time forced
  socratic" brainstorming flow.
- It's the one superpowers skill we found Riley actively wanted to keep
  invoking (vs writing-plans / subagent-driven-development, which OMC's
  `/grind-phase` swallows the role of).
- Allowing it via permissions.allow + plugin-disabled still works because
  Claude Code resolves Skill calls against the install cache, not against the
  "enabled" flag — disabling a plugin stops auto-injection but doesn't unload
  the skill bodies.

## Consequences

**Foreclosed (deliberately):**
- The "subagent-per-task with two-stage review" execution pattern as a default.
  If we want it for a specific feature, we can either re-enable superpowers for
  that work or invoke the skills explicitly via the permission allowlist exception.
- Some of superpowers' more rigid scaffolding (testing-discipline, etc.) is no
  longer auto-injected.

**Gained:**
- A single clear orchestration story. When Riley reads a session log, he doesn't
  have to figure out which plugin's hooks fired.
- Lower permission-prompt overhead.
- Coarser, more reviewable commit cadence.
- Easier mental model for "what is the agent doing right now."

**Risks to watch:**
- If OMC's hooks misbehave or its skill auto-injection drifts, we no longer
  have superpowers as a parallel safety net. Mitigation: ai-dev-system's
  preamble + chapter discipline are the actual safety net, and they're
  unchanged.
- If a future task genuinely benefits from parallel subagent execution, we
  lose easy access to that pattern. Mitigation: re-enable superpowers
  temporarily for that one piece of work.

## Revert procedure

Single edit in `seek/.claude/settings.local.json`:

```jsonc
"enabledPlugins": {
  "superpowers@claude-plugins-official": false  // ← flip to true OR delete this line
}
```

Then restart Claude Code so the plugin loader re-reads the manifest. The
superpowers cache at `~/.claude/plugins/cache/claude-plugins-official/5.1.0/`
is untouched, so all skills and hooks return immediately. Optionally also
re-add to `permissions.allow`:
- `Skill(superpowers:writing-plans)`
- `Skill(superpowers:subagent-driven-development)`
- `Skill(superpowers:test-driven-development)`
- `Skill(superpowers:systematic-debugging)`
- `Skill(superpowers:finishing-a-development-branch)`

The `_experiment` and `_notes` fields in `settings.local.json` document the
same rollback steps inline so future-Claude finds them at the point of friction.

## Revisit if

- A run of ≥8 tasks under OMC-only feels under-reviewed (signal: Riley finds
  himself wanting per-task commits / per-task review passes back).
- Claude Code exposes OMC's team-mode primitives as real tools — then team
  mode becomes a genuine capability worth re-evaluating against superpowers'
  sequential pattern.
- Chapter discipline degrades (Iron Laws being skipped, decisions landing
  without WHY, Learnings missing fields) — this falsifies the "ai-dev-system
  is the discipline floor" hypothesis and means we need a plugin's rigidity
  back.
- A second project adopts ai-dev-system + plugins and we want a generalized
  recommendation rather than a Seek-specific one.

## Scope of this decision

**Seek only, for now.** Other projects under `Cursor/perfectlyhuman/` continue
with whatever orchestration setup they have. If a future project adopts this
pattern, copy the `enabledPlugins` block and the trimmed `permissions.allow`
from Seek's `settings.local.json`. Document each adoption here so we have a
running record of when this decision generalized vs stayed project-specific.

## Pointers

- Smoke test post-mortem: `docs/omc-smoke-test-postmortem-2026-05-18.md`
- Integration plan history: `docs/omc-integration-plan-2026-05-18.md`
- Rollback workflow: `solo/documentation/workflows/omc-rollback.md`
- Surface conditions policy: `solo/documentation/workflows/autonomy-surface-conditions.md`
- Auto-memory pointer in Seek: `~/.claude/projects/C--Users-riley-Cursor-perfectlyhuman-seek/memory/project_orchestration_omc_default.md`
