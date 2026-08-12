---
name: kickoff
description: "Turn a new product idea or an undocumented project into a build-ready AI Dev System project. Use for Day 1 product discovery, market research, product definition, initial architecture, canonical documentation, roadmap creation, and .ai-dev/project.yaml setup. Do not use for ordinary feature planning or for projects whose product foundation is already trustworthy."
---

# Kick off an AI Dev System project

Build enough shared understanding to start useful implementation without turning discovery into a ceremony.

## 1. Establish reality

Inspect the repository before asking questions. Determine whether it is empty, a template, or an existing codebase. Read relevant code, package manifests, existing documentation, git state, and deployment configuration without exposing secret values.

Ask Riley only for product knowledge that cannot be discovered locally. Conduct this as a conversation, not a questionnaire. Combine related questions and make recommendations when evidence supports one direction.

Clarify:

- the problem and who experiences it;
- how they solve it now;
- why Riley is positioned to build it;
- the smallest outcome worth delivering;
- the expected business model and product stage; and
- what success would look like over the next practical horizon.

Do not reopen a premise Riley has already settled unless new evidence contradicts it.

## 2. Research decisions that depend on the outside world

Use current primary sources for facts that may have changed. Research the market when competition, pricing, distribution, regulation, platform capabilities, or customer behavior affects the product direction.

Synthesize the implications. Do not dump a competitor list. Separate observed facts from inference and explain what the evidence means for this product.

## 3. Define the product

Produce one coherent product thesis covering:

- target user and triggering situation;
- painful current state;
- promised outcome;
- differentiation or unfair advantage;
- smallest valuable initial scope;
- explicit exclusions; and
- the riskiest assumptions to learn from.

Present options only when multiple paths remain genuinely viable and would materially change the product. Recommend the path that best fits the current evidence.

## 4. Choose enough technical direction to begin

Respect the repository's existing stack and Riley's standing preferences. Prefer the simplest architecture that can produce the initial product outcome and remain changeable at the present stage.

Record only material decisions. Explain them in plain language first, then include the technical consequences. Do not add framework-specific process or tooling merely because it is generally considered good practice.

## 5. Create the project system

Create `.ai-dev/project.yaml` using the installed v3 schema and create the canonical documentation paths it declares.

At minimum, write:

- `PROJECT.md`: product definition, user, value, principles, stage, architecture summary, and document routing;
- `ROADMAP.md`: current focus, in progress, next, later, blockers, and open product questions;
- the few domain chapters required to begin; and
- decision records only for material choices worth preserving.

Use the project's actual documentation root. Populate real content; do not leave template instructions or `TBD` placeholders. If a question cannot yet be answered, give it an explicit owner, consequence, and resolution step in the roadmap.

Create roadmap work at outcome level. Tasks must be concrete enough to execute and verify without fabricating implementation detail that should be decided while building.

If the product delivers consulting, custom development, or other client-scoped work, install one runtime for the repository and configure a private `client` scope for each active engagement. Give every scope its own repository-local `PROJECT.md`, `ROADMAP.md`, chapters, decisions, lessons, and roadmap archive.

Use the scope tree as the private operating brain for the engagement, including technical work, hypotheses, risks, unresolved questions, and socially or politically sensitive context. When a client-facing application owns shared initiatives, projects, or tasks, configure it separately as `shared_work`. Store only deliberately client-appropriate commitments and outcomes there. Link the private roadmap, shared work, and root product builds when related; do not mirror their descriptions or automatically expose private context.

If Commodore enables Linear, treat the internal roadmap as canonical. Create or refresh only the selected non-technical stakeholder projection after the internal roadmap is coherent.

Never write credentials or secret values to project files.

## 6. Verify coherence

Re-read the project configuration and generated documentation. Check that:

- the problem, user, product, scope, and roadmap agree;
- the first work item advances the current product outcome;
- the architecture supports the promised initial scope;
- every material decision includes a reason and revisit condition;
- no duplicate source of truth was introduced; and
- no placeholder text remains.

Correct obvious inconsistencies directly.

## 7. Hand off to implementation

Report the product thesis, files created, unresolved consequential questions, and one recommended first implementation action.

When that action begins a new substantive implementation phase, end with:

> Reply `go` and I will {specific first implementation action}.

Do not present dead alternatives or ask Riley to approve routine implementation mechanics.
