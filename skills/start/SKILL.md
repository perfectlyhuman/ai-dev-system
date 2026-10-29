---
name: start
description: "Open an AI Dev System work session by restoring project context, inspecting canonical documentation and repository state, reconciling relevant external signals, and recommending the highest-value next action. Use at the beginning of every coding or product-work session in a project with .ai-dev/project.yaml."
---

# Start an AI Dev System session

Orient from durable evidence, not prior chat history or archived handoffs.

## 1. Load the project contract

Find and read `.ai-dev/project.yaml` from the repository root. Resolve all configured paths relative to that root unless a path is explicitly absolute.

That repository is the owning project for the entire agent session. Inspecting, editing, verifying, or delivering work in another repository does not transfer session ownership, and changing the shell working directory is never a project switch. Keep orientation, roadmap reconciliation, recommendations, and eventual `finish` anchored to the owning project.

AI Dev System portfolio migrations are a deliberate exception to where the edited files live, not to session ownership: work rooted in `ai-dev-system` may audit, install, verify, commit, and deliver v3 in another repository because adoption itself is system work. Once installation is complete, ordinary product work belongs in a new session rooted in that project. In every other case, if the next substantive phase belongs to another project, close this session and tell Riley to open a new one there.

If the file is missing, report that the project is not installed and recommend installing or running `kickoff`. Do not silently infer a conflicting project structure.

Read Riley-global context from the machine-wide directory (default `~/.ai-dev-system/`; the installer may have used `--global-root`): `RILEY.md`, `projects.yaml`, and the non-secret `registry.yaml`. Load `RILEY.md` as the cross-project working contract before project documentation. Use `projects.yaml` for project identity and path resolution, and consult `registry.yaml` only when account, organization, service, or remote-resource identity is relevant.

If `.ai-dev/access.yaml` exists, read its non-secret capability requirements. Run the installed access doctor's provider-limited check only when the current request, active roadmap work, external reconciliation, or likely delivery depends on that provider. Report a missing capability as a concrete access gap; do not enumerate unrelated services or ask Riley to locate raw tokens.

The installer creates all three files without overwriting personal guidance. If `RILEY.md` is missing, report global-context installation drift but continue from repository-local evidence. Do not narrate successful reads, empty registries, or missing data that the current task does not need.

## 2. Resolve canonical context before reading project documentation

Never assume the current checkout contains the canonical documentation. A session may open on a stale,
dirty, detached, recovery, or long-lived feature checkout while the delivered product truth has moved
forward on the configured main branch.

Run the bundled resolver from the repository root (from a POSIX shell, wrap it as
`powershell -NoProfile -File <script> -RepositoryRoot .`; use `pwsh` where Windows PowerShell is absent):

```powershell
& .agents/skills/start/scripts/resolve-canonical-context.ps1 -RepositoryRoot .
```

The resolver may fetch only the configured `origin/<main_branch>` remote-tracking ref. This is
read-only reconnaissance with respect to the worktree and remote service; it must not pull, merge,
switch, reset, clean, or edit files. If fetch is unavailable, use the best local main ref and report
that the remote could not be refreshed. If PowerShell is unavailable, perform the same resolution with
equivalent read-only `git` commands.

Use the resolver's exact `canonical_ref` and `canonical_sha` as the delivered documentation baseline:

- read configured canonical files with `git show <canonical_sha>:<path>` rather than assuming the
  same-named working-tree files are current;
- always report the exact canonical ref and abbreviated SHA used for orientation;
- treat working-tree documentation changes and current-branch-only commits as unfinished local
  evidence, not delivered canonical truth;
- if local `main` and remote `main` each contain unique commits, inspect the relevant documentation
  and decisions on both lineages and make reconciliation the next action before consequential work;
- if the current branch or dirty work contains a governing decision relevant to the next action that
  is absent from delivered main, surface it explicitly and reconcile the lineages before proceeding;
  and
- if unrelated dirty work occupies the current checkout, preserve it and recommend a clean worktree
  from the canonical SHA for the new roadmap action instead of treating stale checkout docs as truth.

This reference-resolution step is mandatory even when the checkout appears clean. It prevents a
fresh session from silently reviving superseded methods or missing delivered decisions.

## 3. Restore only relevant knowledge

Read the configured `PROJECT.md` and the active sections of `ROADMAP.md` first from the resolved
canonical SHA. Identify:

- the product and present stage;
- current focus and desired outcome;
- work in progress;
- the top ready work;
- blockers and unresolved product questions; and
- decisions whose revisit conditions may now be true.

Read only the chapters, decisions, and lessons relevant to the current focus or repository changes.
Resolve canonical relative links against files at the canonical SHA. Then inspect relevant
working-tree or branch-only documentation deltas as secondary evidence. Do not load the entire
documentation tree by default.

Treat recorded decisions as settled. Reopen one only when its revisit condition is met, new evidence invalidates a premise, an external constraint changed, or Riley explicitly asks.

If `scopes` are configured, determine whether the request or changed files concern one of them. Load that scope's private `PROJECT.md`, active `ROADMAP.md`, and only its relevant chapters, decisions, and lessons in addition to the root project context. Select an obvious single scope without asking; ask only when work genuinely spans ambiguous scopes.

Keep the three work layers distinct:

- The root `ROADMAP.md` owns the product, platform, and reusable builds.
- A scope's private `ROADMAP.md` owns internal engagement execution, including technical work, hypotheses, risks, unresolved questions, stakeholder dynamics, and tact-sensitive context.
- Optional `shared_work` owns only the commitments and outcomes deliberately made visible to the client.

Link related records with stable identifiers when useful. Do not mirror descriptions across layers, infer a client commitment from implementation work, or expose private scope text through the shared surface.

## 4. Inspect remaining repository and remote state

Continue from the resolver evidence and gather the remaining context appropriate to the repository:

- current branch and upstream;
- working-tree status, including untracked files;
- recent commits and their relationship to roadmap state;
- configured remotes;
- open or unfinished work visible in code and tests; and
- deployment or CI state when the project contract provides a safe way to inspect it.
- readiness of declared external capabilities that the current work actually needs.

Preserve unrelated dirty work. Apart from the bounded remote-tracking fetch above, do not mutate
files or refs, pull, switch branches, create worktrees, or run destructive commands during a
standalone `start`.

Before preparing any paid or hash-bound preflight, verify that its governing decisions exist in the chosen base and agree with the proposed method. A preflight derived from code while its governing decision exists only on another lineage is invalid even when the code and tests pass locally.

Run a read-only verification command only when canonical documentation explicitly records that check as pending and it is safe and useful. Configured focused or required commands describe later work and `finish`; their presence alone does not make them pending during `start`. Inspect diffs enough to understand unfinished work, but do not turn a standalone `start` into implementation review or a test run merely because the tree is dirty.

## 5. Reconcile optional external signals

For an active scope with `shared_work`, inspect that surface using available authenticated tooling. A Supabase surface is canonical only for the configured account's client-visible work. Query only relevant rows and never expose credentials. If access is unavailable, report that exact signal gap without pretending the private roadmap represents the current shared view.

Compare the private scope roadmap and shared work against recent client decisions, deliverables, and implementation evidence. Surface drift in either direction without treating differences as automatic errors: private work may intentionally have no shared counterpart. Client work can require a product build, but the private objective, client-visible outcome, and product implementation remain linked records rather than duplicated descriptions.

When the project declares a stakeholder projection (`integrations.trello` or `integrations.linear`), inspect changes relevant to the current roadmap. Treat comments, reprioritization, and status changes as stakeholder input. Surface meaningful differences without treating the board as canonical or copying technical details into it.

Inspect optional intake only when configured. Distinguish new input from accepted roadmap work.

If no enabled integration, scope, or intake source yields meaningful input, omit external signals entirely. Do not list unconfigured systems or evidence that was not required and was not inspected.

## 6. Determine the next action

Choose the action with the strongest combination of product value, dependency readiness, learning value, urgency, and ability to finish. Prefer completing coherent in-progress work over starting more work unless evidence supports changing direction.

Do not manufacture multiple options. Present alternatives only if two or more live paths materially differ and Riley's judgment is required. Otherwise recommend one action.

## 7. Report briefly

Use this shape, omitting empty sections:

```markdown
## Session start

**Current focus:** {outcome}
**Scope:** {active private scope and shared-work state, when applicable}
**Mode:** {stage and delivery mode in plain words, for example "prototype — straight to main, no preview"}
**Canonical docs:** {resolved main ref and abbreviated commit SHA}
**Repository:** {branch, clean/dirty, meaningful delta}
**External signals:** {only meaningful configured input}
**Needs attention:** {real contradiction, blocker, or pending verification}

**Recommended next:** {one concrete action}
**Why:** {plain-language reason}
```

Apply the same signal filter to intermediate commentary. Do not narrate routine file checks, expected absences, disabled integrations, or other non-events.

State the mode once in that line, in words rather than field names, so Riley can see when a project has outgrown the delivery ceremony it is configured for. If the recorded `stage` visibly contradicts the work in front of you, report the contradiction under **Needs attention** and leave the change to Riley; do not silently reclassify the project or narrow the session's own evidence to match a stale label.

If Riley invoked `start` by itself, remain read-only and end with:

> Reply `go` and I will {recommended action}.

If Riley invoked `start` together with a clear work request, proceed directly into that work after reporting orientation. Do not ask for `go` again.
