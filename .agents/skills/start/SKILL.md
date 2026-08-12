---
name: start
description: "Open an AI Dev System work session by restoring project context, inspecting canonical documentation and repository state, reconciling relevant external signals, and recommending the highest-value next action. Use at the beginning of every coding or product-work session in a project with .ai-dev/project.yaml."
---

# Start an AI Dev System session

Orient from durable evidence, not prior chat history or archived handoffs.

## 1. Load the project contract

Find and read `.ai-dev/project.yaml` from the repository root. Resolve all configured paths relative to that root unless a path is explicitly absolute.

That repository is the owning project for the entire Codex task. Inspecting, editing, verifying, or delivering work in another repository does not transfer task ownership, and changing the shell working directory is never a project switch. Keep orientation, roadmap reconciliation, recommendations, and eventual `finish` anchored to the owning project. If the next substantive work belongs to another project, close this task and tell Riley to open a new task rooted in that repository.

If the file is missing, report that the project is not installed and recommend installing or running `kickoff`. Do not silently infer a conflicting project structure.

If available, read Riley-global context from `C:\Users\riley\.ai-dev-system\RILEY.md`, `projects.yaml`, and the non-secret `registry.yaml`. Missing global files are optional and must not block the session.

## 2. Restore only relevant knowledge

Read the configured `PROJECT.md` and the active sections of `ROADMAP.md` first. Identify:

- the product and present stage;
- current focus and desired outcome;
- work in progress;
- the top ready work;
- blockers and unresolved product questions; and
- decisions whose revisit conditions may now be true.

Read only the chapters, decisions, and lessons relevant to the current focus or repository changes. Do not load the entire documentation tree by default.

Treat recorded decisions as settled. Reopen one only when its revisit condition is met, new evidence invalidates a premise, an external constraint changed, or Riley explicitly asks.

If `scopes` are configured, determine whether the request or changed files concern one of them. Load that scope's private `PROJECT.md`, active `ROADMAP.md`, and only its relevant chapters, decisions, and lessons in addition to the root project context. Select an obvious single scope without asking; ask only when work genuinely spans ambiguous scopes.

Keep the three work layers distinct:

- The root `ROADMAP.md` owns the product, platform, and reusable builds.
- A scope's private `ROADMAP.md` owns internal engagement execution, including technical work, hypotheses, risks, unresolved questions, stakeholder dynamics, and tact-sensitive context.
- Optional `shared_work` owns only the commitments and outcomes deliberately made visible to the client.

Link related records with stable identifiers when useful. Do not mirror descriptions across layers, infer a client commitment from implementation work, or expose private scope text through the shared surface.

## 3. Inspect repository and remote state

Gather evidence appropriate to the repository:

- current branch and upstream;
- working-tree status, including untracked files;
- recent commits and their relationship to roadmap state;
- configured remotes;
- open or unfinished work visible in code and tests; and
- deployment or CI state when the project contract provides a safe way to inspect it.

Preserve unrelated dirty work. Do not mutate files, pull, switch branches, or run destructive commands during a standalone `start`.

Run explicitly pending read-only verification when it is safe and useful. Do not turn `start` into a full test suite unless a recorded pending check requires it.

## 4. Reconcile optional external signals

For an active scope with `shared_work`, inspect that surface using available authenticated tooling. A Supabase surface is canonical only for the configured account's client-visible work. Query only relevant rows and never expose credentials. If access is unavailable, report that exact signal gap without pretending the private roadmap represents the current shared view.

Compare the private scope roadmap and shared work against recent client decisions, deliverables, and implementation evidence. Surface drift in either direction without treating differences as automatic errors: private work may intentionally have no shared counterpart. Client work can require a product build, but the private objective, client-visible outcome, and product implementation remain linked records rather than duplicated descriptions.

When the project enables Linear, inspect changes relevant to the current roadmap. Treat comments, reprioritization, and status changes as stakeholder input. Surface meaningful differences without treating Linear as canonical or copying technical details into it.

Inspect optional intake only when configured. Distinguish new input from accepted roadmap work.

## 5. Determine the next action

Choose the action with the strongest combination of product value, dependency readiness, learning value, urgency, and ability to finish. Prefer completing coherent in-progress work over starting more work unless evidence supports changing direction.

Do not manufacture multiple options. Present alternatives only if two or more live paths materially differ and Riley's judgment is required. Otherwise recommend one action.

## 6. Report briefly

Use this shape, omitting empty sections:

```markdown
## Session start

**Current focus:** {outcome}
**Scope:** {active private scope and shared-work state, when applicable}
**Repository:** {branch, clean/dirty, meaningful delta}
**External signals:** {only meaningful configured input}
**Needs attention:** {real contradiction, blocker, or pending verification}

**Recommended next:** {one concrete action}
**Why:** {plain-language reason}
```

If Riley invoked `start` by itself, remain read-only and end with:

> Reply `go` and I will {recommended action}.

If Riley invoked `start` together with a clear work request, proceed directly into that work after reporting orientation. Do not ask for `go` again.
