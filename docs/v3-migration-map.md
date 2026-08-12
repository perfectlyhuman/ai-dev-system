# AI Dev System v3 Migration Map

**Status:** Authoritative disposition of the legacy system
**Date:** 2026-08-12
**Companion:** `docs/v3-blueprint.md`

## Migration rule

V3 is a clean Codex-native implementation based on the approved blueprint. It is not a patching exercise and not a line-by-line rewrite of the legacy system.

Legacy components are evidence. They may supply a proven idea, reveal a failure mode, or provide reusable wording. They do not determine v3's structure.

## Keep as concepts

| Existing concept | V3 disposition | Why it survives |
|---|---|---|
| Session opening with `start` | Keep | Riley uses it every session and it reliably restores orientation. |
| Periodic `update-docs` | Keep | Capturing durable knowledge near the moment it is learned prevents repeated work. |
| Session closing with `finish` | Keep | A deliberate close is valuable when it completes delivery rather than producing ceremony. |
| New-project `kickoff` | Keep | Product discovery, research, scope, architecture, and roadmap creation are high-leverage at project birth. |
| Repository-local canonical knowledge | Keep | It travels with the code, can be versioned, and is available to future sessions. |
| Internal `ROADMAP.md` | Keep | It is the only format that can preserve product direction, technical detail, dependencies, and implementation state together. |
| Project hub | Keep, rename | The routing value of `MASTER.md` survives as the more legible `PROJECT.md`. |
| Domain chapters | Keep | Deep context is useful when created for real domains rather than template completeness. |
| Material decision rationale | Keep | It prevents settled questions from being repeatedly reopened. |
| Revisit conditions | Keep | They provide an evidence-based rule for when a decision becomes live again. |
| Durable lessons and negative knowledge | Keep | They prevent expensive mistakes from recurring. |
| Git and remote-state inspection | Keep | Current repository state is stronger evidence than a session narrative. |
| Project maturity/risk signal | Keep, simplify | Codex needs to distinguish prototypes, design-partner products, and live products. |
| Market research during kickoff | Keep | Product and positioning decisions should be grounded in current reality. |

## Adapt substantially

| Existing component | V3 replacement | Material change |
|---|---|---|
| Claude slash commands | Codex-native skills | Invocation syntax is an implementation detail; Riley's lifecycle names remain. |
| `.claude/project.json` | `.ai-dev/project.yaml` | Remove Claude, Gilfoyle, Google Drive, and mandatory Linear configuration; retain only real project variation. |
| Claude `SessionStart` hook | Explicit `start` plus global Codex context | Riley already invokes `start`; avoid hidden prompt injection and duplicated instructions. |
| `MASTER.md` | `PROJECT.md` | Clearer name and tighter purpose as an orientation/router document. |
| Roadmap completed-task accumulation | Roadmap archive | Active roadmap stays focused on current, next, and later work; shipped history moves to quarterly or dated archive files. |
| Detailed micro-ADR ceremony | Proportional decision records | Record only decisions likely to be re-litigated or whose rationale affects future work. |
| Every bug becomes a lesson | Durable negative-knowledge test | Write a lesson only when a future session would plausibly repeat an expensive mistake. |
| `launch.status` | `stage` plus `delivery.mode` | Separate user-impact risk from standing authorization to commit, push, or ship. |
| `/finish` as handoff writer | `finish` as documentation, verification, commit, and delivery closer | Eliminate handoff files and complete the actual work loop. |
| `/update-docs` user preview gates | Direct, scoped reconciliation | Codex updates obvious documentation autonomously and surfaces only consequential ambiguity. |
| Linear sync/alignment | Commodore Linear projection adapter | Internal roadmap remains canonical; Linear becomes a non-technical stakeholder view and input channel. |
| GitHub issue intake | Optional project adapter | Keep only where a real project receives useful external intake. Promote accepted work into the roadmap. |
| Setup scripts | V3 installer/migrator | Install the small global layer, project contract, skills, and selected documentation templates. |
| Solo/team modes | One core with optional adapters | Riley's projects share the same canonical system; integrations vary by project. |
| Framework/template setup helpers | Project kickoff or separate tools | Makerkit, Expo, and other stacks are implementation choices, not core system architecture. |

## Remove

| Legacy component | Reason for removal |
|---|---|
| Google Drive roadmap | Not useful to Riley now and creates another source of truth. |
| Linear as roadmap or tactical source of truth | Loses technical rationale and has already caused Commodore roadmap drift. |
| `HANDOFF.md` and `handoffs/` archive | Duplicates git, roadmap, and durable documentation while creating a fragile ritual. |
| Superpowers dependency | Adds process and duplicated reasoning that current Codex models do not need. |
| OMC integration and `/grind-phase` | Adds orchestration layers, hooks, working-memory ceremony, and failure modes without demonstrated present value. |
| Gilfoyle/cloud engineering agent machinery | The experiment did not produce enough practical value. |
| `AUTONOMY-INBOX.md` | Exists only to coordinate the discarded cloud-agent system. |
| `/prep-engines` in its current form | New and unproven; tied to an autonomy architecture that is being removed. Any future concept must earn reintroduction from observed need. |
| Mandatory TDD/review subagent chains | Quality should be demonstrated by appropriate verification, not a universal prescribed process. |
| Duplicate command and skill files | One Codex skill definition should own each capability. |
| `/align` as a global lifecycle command | Only Commodore needs Linear reconciliation, which belongs in its adapter. |
| `/dev`, `/branch`, `/test`, and `/ship` as system rituals | Codex can perform ordinary implementation, branching, testing, and shipping from natural-language requests and project configuration. |
| Generic framework skills in the core package | Makerkit, RLS, Playwright, Postgres, React, and similar guidance should be used only when a task demonstrates a need. |
| Claude-specific hooks, settings, MCP examples, and plugin manifests | V3 is Codex-native. |
| The claim that every feature or small fix requires documentation | Produces low-signal documentation and slows delivery. |
| The claim that routine completion requires Riley's permission | Conflicts with the intended speed and standing delivery authorization. |

## Defer without carrying forward

These are not part of the core implementation. Their names may appear in the blueprint so the architecture does not foreclose them, but no legacy implementation is preserved.

| Capability | Revisit condition |
|---|---|
| Bitwarden-backed credential subsystem | After the v3 daily lifecycle is self-hosted and usable. |
| Broader marketing system | When a current project has a concrete recurring marketing workflow to support. |
| Autonomous engineering agents | When a bounded engineering workflow demonstrates that unattended execution would outperform Riley plus Codex. |
| Public/open-source `create-ai-dev` product | After Riley's private v3 has proven stable across multiple projects. |
| Framework-specific reusable skills | After the same task-specific failure or inefficiency recurs enough to justify permanent guidance. |

## Legacy tree disposition

| Current path | Disposition during v3 construction |
|---|---|
| `solo/.claude/` and `solo/documentation/` | Removed at root cutover; retained in git history only. |
| Legacy `skills/` and `templates/` | Removed and replaced by the v3 packages at the root paths. |
| OMC, orchestration, and upgrade diagnostics | Removed at root cutover; the approved v3 design records the durable conclusions. |
| `README.md` and `SYSTEM.md` | README replaced with the v3 product; redundant legacy SYSTEM removed. |
| Root installer scripts | Removed and replaced by `installer/install.mjs`. |

## Clean implementation sequence

### 1. Build the v3 package in isolation

Create a new `v3/` implementation surface containing:

```text
v3/
  README.md
  skills/
    kickoff/SKILL.md
    start/SKILL.md
    update-docs/SKILL.md
    finish/SKILL.md
  templates/
    project.yaml
    PROJECT.md
    ROADMAP.md
    chapter.md
    decision.md
    lesson.md
  schema/
    project.schema.json
  installer/
```

This is a clean build area, not a third runtime mode. It exists only until v3 is ready to become the repository's root product.

### 2. Implement the smallest complete lifecycle

Implement the four core skills and the project schema together. A skill is not complete because its prose exists; it is complete when it can operate against a real configured project and produce the intended evidence.

### 3. Self-host

Install the v3 project contract and canonical documentation into `ai-dev-system`. Run `start`, conduct actual v3 implementation work, run `update-docs`, and close with `finish`.

### 4. Cut over the repository

After the self-hosted loop works:

- Replace the root README and system documentation with v3.
- Replace the legacy installer with the v3 installer.
- Remove runtime references to Claude Code, Superpowers, OMC, Google Drive, and Gilfoyle.
- Preserve genuinely useful historical analysis under an explicitly historical archive only if it still has diagnostic value.

### 5. Audit real projects

Use `banks` first to evaluate ordinary project drift. Use `commodore-app` next to evaluate both drift and the Linear projection boundary. Findings may refine v3 behavior, but they do not automatically resurrect legacy machinery.

### 6. Add optional capabilities

Implement the Bitwarden/account registry after the daily loop is proven. Implement the Commodore Linear adapter against the canonical roadmap contract. Expand into marketing when a real workflow provides requirements.

## Completed implementation phase

The clean implementation was built and proven under `v3/`, then promoted to the repository root. `skills/`, `templates/`, `schema/`, and `installer/` are now the only product packages. The legacy runtime, setup modes, and redundant system documentation were removed; git history retains them if historical investigation is ever necessary.

`ai-dev-system` self-hosts the project contract, canonical documentation, and repository-scoped skill copies. Behavioral `start`, fresh-task skill discovery, documentation reconciliation, verification, direct `finish` delivery, and a clean root-package installation all pass.

## Completed rollout

The v3 foundation is installed and delivered in every active product repository: Banks, Commodore, Chezmoi, Cosskit, and Rare Data. These migrations were owned and closed by AI Dev System tasks. Ordinary product work now begins in a new task rooted in the relevant repository and uses that project's `start` and `finish` lifecycle.

The rollout earned only narrow shared-system corrections: private client scopes, asymmetric Linear projection, explicit preview lanes, preservation of unrelated dirty work, and a hard distinction between cross-repository work and task ownership. Claude, Superpowers, OMC, Gilfoyle, Google Drive, and handoff machinery were not carried forward.
