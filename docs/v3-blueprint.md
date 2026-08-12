# AI Dev System v3 Blueprint

**Status:** Authoritative design baseline
**Date:** 2026-08-11
**Implementation state:** Implemented, self-hosted, proven in Banks and Commodore, and rolling out across the remaining active portfolio

## Purpose

AI Dev System exists to give Riley a durable operating system for building products with AI: from a rough idea, through product definition and technical design, into fast daily execution without losing the vision, rationale, decisions, lessons, or current direction.

The system is optimized for a solo developer or technical founder whose advantage is speed. It should increase that advantage rather than simulate the process of a large engineering organization.

The intended loop is:

```text
idea -> define -> roadmap -> build -> verify -> ship -> learn -> update direction
```

The system succeeds when Riley and Codex can resume any active project, understand why it exists and how it works, identify the most valuable next action, execute it quickly, ship it safely enough for the project's actual risk, and leave the project clearer than they found it.

## Success criteria

V3 must:

1. Restore useful project context at the beginning of every session without relying on chat history.
2. Preserve the why behind the product, architecture, priorities, and material decisions.
3. Keep one canonical internal roadmap for every project, including Commodore, and for every configured private client scope.
4. Recommend and pursue the highest-value next action instead of repeatedly returning control for routine decisions.
5. Make documentation maintenance proportional to the durable knowledge created.
6. Finish sessions completely: reconcile documentation, verify work, commit it, and deliver it according to project posture.
7. Distinguish real risk from ceremonial process.
8. Make integrations optional projections or capabilities, never competing sources of truth.
9. Remain understandable and maintainable without Claude Code, Superpowers, OMC, Gilfoyle, or framework-specific guidance packages.
10. Support future expansion into marketing and broader founder work without distorting the engineering core today.

## Explicit non-goals

V3 is not:

- A simulation of a large software organization.
- A mandatory ticketing, sprint, estimation, or approval process.
- An autonomous cloud engineering agent system.
- A collection of generic framework best-practice skills.
- A second copy of Codex's built-in reasoning and coding capabilities.
- A public framework optimized for unknown users. Riley is the only target user for now.
- A requirement that every thought, small fix, or session produce documentation.

## Riley's global working contract

These biases apply across projects unless a project explicitly overrides them for a concrete reason.

### Forward motion

At every natural boundary, identify the highest-value next step and continue when it is reversible, authorized, and within scope. Do not end with a passive status report when useful work can continue.

### `go` means proceed

At a genuine checkpoint where Riley's approval is appropriate, end with one recommended next action and a concrete continuation prompt:

> Reply `go` and I will {specific next action}.

`go` authorizes that stated next action and its routine, reversible, in-scope implementation work. On receiving it, begin execution immediately. Do not restate the plan, repeat alternatives, ask for ceremonial confirmation, or reopen settled decisions.

The proposed action must be specific enough that `go` has an unambiguous meaning. If there are multiple unresolved consequential choices, resolve them through a recommendation or ask the necessary decision before offering `go`.

Do not manufacture checkpoints merely to request `go`. Continue autonomously when existing authorization already covers the work. Use the prompt at natural scope boundaries, after consequential design agreements, or when the next action represents a new substantive implementation phase.

`finish` is the exception: it is a terminal ritual, not a new checkpoint. A successful `finish` reports what shipped and any real leftovers, then stops without recommending another action or offering `go`. The next session's `start` restores context and selects the next action from fresh evidence.

### Settled decisions stay settled

Do not reopen a decision merely because alternatives exist. Reconsider it only when:

- its recorded revisit condition is true;
- new evidence invalidates a material premise;
- an external constraint has changed; or
- Riley explicitly reopens it.

When a settled decision is relevant, apply it. Do not make Riley decide it again.

### Options must earn attention

Present alternatives only when more than one path remains genuinely viable and the choice materially changes cost, risk, speed, product behavior, or future flexibility. Do not generate option lists for rhetorical completeness.

When alternatives are live:

1. Explain the decision in plain language first.
2. State the conditions under which each path makes sense.
3. Recommend one and explain why it fits the present conditions.
4. Include technical depth where it improves the decision or when Riley asks for it.

### Evidence before ceremony

Use tests, observed behavior, repository state, logs, deployment state, and current documentation as evidence. Do not substitute checklists, approvals, or elaborate plans for evidence.

### Autonomy matches actual risk

Routine, reversible implementation decisions belong to Codex. Pause for Riley when product intent is genuinely ambiguous, an action is destructive or difficult to reverse, external authority is required, meaningful cost or customer impact is possible, or the evidence supports materially different product directions.

### Ship at the project's real maturity

Most current projects are pre-launch or design-partner stage. V3 should not impose production-enterprise ceremony on them. Verification remains mandatory; repeated permission requests to commit, push, merge, promote, or deploy do not.

### Plain language, technical precision

Lead with the practical meaning, trade-off, and recommendation. Preserve technical accuracy and make deeper detail available without forcing Riley to translate implementation jargon before contributing first-principles judgment.

### One project owns each Codex task

A Codex task belongs to the repository where Riley opened it and `start` loaded the project contract. Inspecting or modifying another repository, changing the shell working directory, or completing a cross-project pilot does not silently transfer task ownership.

The owning project keeps responsibility for context, roadmap reconciliation, `finish`, and the recommended next action. When the next substantive phase belongs to another product, finish the current task and direct Riley to open a new task in that repository and run `start`. This keeps project memory and momentum local without forbidding bounded cross-repository work.

## System architecture

V3 has four small layers.

### 1. Riley-global context

Installed locally and available across projects. It contains stable information about how Riley works, not project implementation detail.

Planned location:

```text
C:\Users\riley\.ai-dev-system\
  RILEY.md
  registry.yaml
  projects.yaml
```

- `RILEY.md` contains the working contract above and other durable personal preferences.
- `registry.yaml` will map platforms, identities, organizations, and remote project IDs without containing secret values.
- `projects.yaml` will index active projects and their local paths.

The registry and credential capability are part of the v3 architecture but are not prerequisites for the core implementation.

### 2. Project contract

Each project has a small machine-readable configuration file:

```text
.ai-dev/project.yaml
```

It declares only what varies by project:

```yaml
name: example
entity: clubb-ventures
stage: design-partner

documentation:
  root: documentation
  project: documentation/PROJECT.md
  roadmap: documentation/ROADMAP.md

delivery:
  mode: ship
  main_branch: main

integrations:
  linear: false
```

Expected stage values are `prototype`, `design-partner`, and `live`. Expected delivery modes are:

- `commit`: verify and commit locally.
- `push`: verify, commit, and push the working branch.
- `ship`: verify, commit, push, merge or promote when appropriate, and verify the resulting deployment.

The active projects should default to the most autonomous mode their real deployment setup supports. A mode is a standing authorization, not a suggestion to ask again during every finish.

### 3. Canonical project memory

The default project memory structure is:

```text
documentation/
  PROJECT.md
  ROADMAP.md
  chapters/
  decisions/
  lessons/
  archive/
    roadmap/
```

#### `PROJECT.md`

The compact entry point. It answers:

- What is this product?
- Who is it for?
- Why does it matter?
- What is the current product stage?
- How is the system organized?
- Where should deeper questions be routed?

It replaces the vague `MASTER.md` name while preserving the useful project-hub concept.

#### `ROADMAP.md`

The canonical execution direction for every project. It contains:

- Current focus
- Work in progress
- Next work
- Later work
- Blockers and open product questions

It does not become a permanent graveyard of completed work. Completed milestones move to dated or quarterly files under `archive/roadmap/`, with only meaningful shipped outcomes retained.

#### `chapters/`

Durable domain knowledge: product, architecture, data, integrations, operations, marketing, or other domains that actually exist. Chapters are created because the project needs them, not because a template has slots to fill.

#### `decisions/`

Material decisions whose rationale will prevent future re-litigation. A decision records context, choice, reasoning, consequences, and a concrete revisit condition. Routine implementation choices do not require ADRs.

#### `lessons/`

Durable negative knowledge: misleading assumptions, expensive gotchas, or operational facts likely to save a future session real time. This is not a diary of every bug fixed.

### 4. Codex-native capabilities

The core lifecycle is implemented as Codex skills. Riley may invoke them with the mechanism Codex supports; the `/` character is not part of the product contract.

Natural-language implementation remains the default. V3 does not create a special skill for ordinary feature work, tests, branching, or debugging unless repeated evidence later shows a real gap.

### Client scopes and shared work

Consulting and custom-development products need more than a product roadmap. Each active client is a private scope within the same repository and lifecycle runtime:

```text
documentation/clients/{client}/
  PROJECT.md
  ROADMAP.md
  chapters/
  decisions/
  lessons/
  archive/roadmap/
```

The scope is Banks' internal operating brain for the engagement. It may hold technical detail, delivery strategy, hypotheses, risks, unresolved questions, conflicts, stakeholder dynamics, and context that requires tact. It is private by default and is never automatically exposed.

A client-facing application may separately own shared initiatives, projects, or tasks. V3 configures that as optional `shared_work`, such as a Supabase `work_projects` table. Shared work contains deliberately client-appropriate commitments, outcomes, status, and collaboration—not the private reasoning used to deliver them.

The work model is therefore partitioned rather than mirrored:

```text
root ROADMAP        private client ROADMAP        shared client work
product/builds      engagement execution          visible commitments
       \                    |                    /
        +----------- stable links --------------+
```

A record may exist in any one layer without counterparts in the others. Related records may link by stable identifiers, but descriptions are not copied. Code does not imply a client commitment, and sensitive internal context is never projected automatically.

## Core lifecycle

### `kickoff`

Used for a genuinely new product or an existing project with no trustworthy product foundation.

It moves from idea to an executable project foundation:

1. Understand the problem, user, motivation, and desired outcome.
2. Research the market and current alternatives when those facts affect the product.
3. Define the product, initial customer, value proposition, and smallest valuable scope.
4. Establish the technical direction at the level needed to begin.
5. Create the initial roadmap and canonical documentation.
6. End with a concrete recommended first build action.

Kickoff is collaborative because product direction is consequential. It should still make recommendations, resolve minor uncertainty, and maintain momentum rather than treating every phase as an approval gate.

Marketing discovery belongs in kickoff where it affects audience, positioning, acquisition, or launch—not as an unrelated afterthought.

### `start`

Used at the beginning of every work session.

It should:

1. Read `.ai-dev/project.yaml` and Riley-global context.
2. Read `PROJECT.md`, the active portion of `ROADMAP.md`, and only the chapters relevant to current work; for active client work, load the private scope roadmap and inspect optional shared work separately.
3. Inspect git status, recent commits, the current branch, and configured remote state.
4. Run pending verification that is explicitly recorded in the roadmap or project docs and safe to automate.
5. For Commodore, surface relevant Linear changes as external input without treating Linear as canonical.
6. Report current state briefly.
7. Recommend the highest-value next action and why.

`start` is read-only unless Riley explicitly combines it with a work request. It does not depend on a HANDOFF file; canonical docs, git, deployment state, and the current request are the memory system.

### `update-docs`

Used periodically after meaningful work or accumulated learning.

It should:

1. Compare work completed since the last relevant documentation state.
2. Identify durable product, roadmap, architecture, decision, or lesson changes.
3. Update only affected documents.
4. Remove or correct stale information rather than layering contradictions on top.
5. Archive completed roadmap items when appropriate.
6. Reconcile optional client shared work or the Commodore Linear projection only after the relevant internal roadmap is current and only with audience-appropriate information.
7. Report what changed and what intentionally did not require documentation.

It should not demand a decision record, lesson, chapter update, or user preview for every change. Documentation is valuable only when its signal remains high.

### `finish`

Used at the end of every work session. It subsumes the necessary `update-docs` pass.

It should:

1. Inspect the session's code, commits, roadmap progress, and documentation delta.
2. Run `update-docs` logic for anything not already reconciled during the session.
3. Run the relevant verification suite and report evidence.
4. Resolve safe, in-scope failures instead of merely reporting them.
5. Commit meaningful outstanding work with a clear commit message.
6. Execute the configured delivery mode: commit, push, or ship.
7. Verify remote branch, merge, promotion, and deployment state where applicable.
8. Surface only genuine blockers or decisions requiring Riley.
9. State what shipped and any real leftovers, then end the task without recommending another action.

`finish` does not write or archive session handoffs. Work-in-progress belongs in the roadmap; durable context belongs in project documentation; implementation history belongs in git.

## Roadmap and Linear contract

The internal `ROADMAP.md` is canonical in every project.

Linear is an optional stakeholder interface currently used only by Commodore. Its purpose is to communicate a useful non-technical view of direction and progress to Riley's cofounders.

The relationship is asymmetric:

```text
internal roadmap -> selected non-technical projection -> Linear
Linear comments/changes -> input to reconcile -> internal roadmap decision
```

Technical specifications, architectural reasoning, dependencies, and implementation detail must remain inside the repository. A Linear change does not silently override the internal roadmap. V3 surfaces the difference, determines whether it represents new stakeholder input, updates the internal roadmap when warranted, and then refreshes the projection.

Google Drive is not part of v3.

## Delivery and stopping rules

Codex should stop and involve Riley for:

- Product intent that remains materially ambiguous after inspecting available context.
- Destructive or difficult-to-reverse actions outside standing project authorization.
- Meaningful customer, legal, privacy, security, or unexpected cost exposure.
- Missing credentials or external permissions that cannot be resolved safely.
- Failed verification whose resolution requires choosing between materially different product behaviors.
- Protected workflows that explicitly require a human action.

Codex should not stop merely to ask permission for:

- Routine implementation choices consistent with project conventions.
- Editing, testing, formatting, or refactoring within the requested scope.
- Creating an appropriate branch or commit.
- Pushing, merging, promoting, or deploying when the configured delivery mode authorizes it and verification passes.
- Updating canonical documentation to match completed work.
- Selecting the obvious next task from a settled roadmap.

## Optional and future capabilities

### Accounts and credentials

Bitwarden Password Manager and Bitwarden Secrets Manager are the selected foundation. V3 will later add a non-secret global account registry, project secret manifests, scoped machine access, consumer mapping, and safe rotation workflows. This follows the core lifecycle implementation; it does not block it.

### Marketing

V3 should eventually support research, positioning, launch planning, content, experiments, measurement, and other founder-led marketing work. The immediate implementation only preserves space for marketing chapters and includes market/positioning work in kickoff.

### Linear

Commodore-only at first. It is an optional adapter, not a core dependency.

### Autonomous agents

Gilfoyle and the current `/agents` experiment are out of scope. Future autonomy must be justified by a concrete workflow that produces better results than Riley plus Codex, not by autonomy as an end in itself.

### Public distribution

The old `create-ai-dev` public-package ambition is deferred. V3 is optimized for Riley first. A public product can be extracted later if the private system proves coherent and portable.

## Evaluation

V3 will be evaluated through real use, not feature count.

The initial evaluation sequence was:

1. Self-host the core lifecycle in `ai-dev-system`.
2. Use it for real implementation work and record friction.
3. Audit `banks` for documentation, roadmap, architectural, and code drift.
4. Audit `commodore-app` for the same issues plus the Linear projection boundary.
5. Revise v3 only where observed failures demonstrate a need.

That sequence is complete. Portfolio rollout continues through project-owned tasks in `chezmoi`, `cosskit`, and `rare-data`; each migration is both adoption work and another source of evidence for narrowly earned v3 improvements.

The system is working when sessions begin with clarity, routine work moves without procedural drag, important decisions are not forgotten or re-litigated, finished work reaches its intended destination, and Riley spends attention on product judgment rather than supervising mechanics.
