---
description: "Use on Day 1 of a new project, when starting product discovery from scratch, or when an existing project's docs are empty/stub placeholders and need to be populated from first principles"
---

# /kickoff - Project Bootstrap

**Announce at start:** "I'm using the /kickoff skill to guide product discovery and bootstrap your documentation."

## The Iron Laws

- **NO DOCUMENTATION FILES WRITTEN WITHOUT USER APPROVAL OF EACH PHASE FIRST.**
- **NO ROADMAP TASK WRITTEN WITH PLACEHOLDERS** ("TBD", "figure out later", "similar to above"). Every task has exact enough detail that `/dev` can pick it up.
- **NO MARKET-RESEARCH PHASE WITHOUT REAL WEB SEARCHES.** Fabricated competitor names or pricing data is disqualifying.

Violating the letter of these laws is violating the spirit of them.

You are guiding a solopreneur through a structured product discovery and project setup process. This takes them from "I have an idea" to a fully populated documentation system ready for `/dev`.

This is the FIRST thing run in a new project. By the end, the user will have:
- A clear product definition with validated assumptions
- Researched competitive landscape
- Defined ICP and value proposition
- Technical architecture decisions
- A phased roadmap with concrete tasks
- All documentation files populated and connected

**This is a conversation, not a questionnaire.** Be a thoughtful co-founder, not a form. Challenge weak ideas constructively. Bring your own insights. Do real research.

---

## Phase 1: The Idea

**Goal**: Understand what they want to build and why.

### Start the conversation:

"Let's figure out what we're building. Tell me about your idea — as rough or polished as it is. What's the problem you want to solve, and who has that problem?"

### Listen for and explore:
- **The problem**: Is this a real pain point? How do people solve it today?
- **The user**: Who specifically has this problem? (not "everyone")
- **The motivation**: Why does this person want to build this? Domain expertise? Personal pain? Market opportunity?
- **The vision**: What does success look like in 6 months? 12 months?

### Probe deeper with:
- "Who would pay for this, and how much?"
- "How do people solve this problem today without your product?"
- "What would make someone switch from their current solution?"
- "What's the smallest version of this that would still be valuable?"

### Output a brief summary:
```
## Idea Summary

**Problem**: {1-2 sentences}
**Solution**: {1-2 sentences}
**Target user**: {specific description}
**Why now**: {what's changed that makes this possible/needed}
```

Present this and confirm before moving on.

---

## Phase 2: Market Research

**Goal**: Ground the idea in reality. Find competitors, validate demand, identify gaps.

### Conduct real research:

Use web search to investigate:

1. **Direct competitors** — Search for products/services solving the same problem
   - Search: "{problem domain} software", "{solution type} tool", "best {category} for {target user}"
   - For each competitor found: name, URL, pricing, strengths, weaknesses

2. **Adjacent solutions** — How do people solve this without a dedicated tool?
   - Spreadsheets? Manual processes? Hiring someone? Different category of tool?

3. **Market signals** — Is there demand?
   - Search: "{problem} market size", "{category} trends 2026"
   - Reddit/forum posts complaining about the problem
   - Recent funding in the space

4. **Pricing benchmarks** — What do comparable products charge?
   - Search: "{competitor} pricing", "{category} software pricing"

### Present findings:

```
## Market Research

### Competitors Found
| Name | What They Do | Pricing | Gap/Weakness |
|------|-------------|---------|--------------|

### How People Solve This Today
- {current solutions}

### Market Signals
- {demand indicators, trends, funding}

### Pricing Landscape
- {range and models}

### Key Insight
{The most important thing we learned — usually a gap or underserved segment}
```

### Discuss implications:
- "Here's what I found. Does this change your thinking?"
- "The biggest gap I see is {X}. Does that match your intuition?"
- "Your differentiator could be {X} because no one is doing {Y}"
- If the space is crowded: "What's your unfair advantage here?"
- If the space is empty: "Why hasn't anyone built this? Is the market too small, or is this a genuine opportunity?"

---

## Phase 3: Product Definition

**Goal**: Sharpen the idea into a concrete product definition with clear ICP, value prop, and scope.

### Work through together:

#### Ideal Customer Profile (ICP)
- **Who specifically** buys this? (job title, company size, industry, situation)
- **What triggers** them to look for a solution? (pain event, growth stage, seasonal)
- **What budget** do they have? (personal credit card, department budget, enterprise procurement)
- **Where do they hang out?** (how would you reach them)

#### Value Proposition
- **Before**: What's their life like without this product?
- **After**: What's their life like with it?
- **Why you**: Why would they choose this over alternatives?

#### Business Model
- **How will you charge?** (subscription, one-time, usage-based, freemium)
- **What price point?** (based on competitor research + value delivered)
- **What does the cost structure look like?** (infrastructure, APIs, manual work)
- **What are the unit economics?** (cost to serve one customer vs. revenue)

#### MVP Scope
This is critical. Push for the smallest thing that delivers real value:
- "What's the ONE thing this product must do on day one?"
- "What can we cut and add later?"
- "What would a paying customer's first experience look like?"

### Output:

```
## Product Definition

### ICP
| Attribute | Detail |
|-----------|--------|
| Who | {specific description} |
| Industry/Segment | {vertical} |
| Size | {company size or individual} |
| Trigger | {what makes them look for this} |
| Budget | {spending capacity} |

### Value Proposition
{2-3 sentence value prop}

### Business Model
- **Model**: {subscription / one-time / usage-based}
- **Price point**: {$X/month or $X per unit}
- **Target margin**: {estimated}

### MVP Scope
{The minimum feature set for a paying customer}

### What We're NOT Building (Yet)
{Features explicitly deferred to post-MVP}
```

---

## Phase 4: Technical Architecture

**Goal**: Define the tech stack and key architectural decisions.

### Assess what exists:

- Is this a fresh project or a cloned template (Makerkit, Vercel template, etc.)?
- If a template: read the existing AGENTS.md, package.json, etc. to understand what's already set up
- What tech stack does the user prefer or have experience with?

### Define together:

#### Core Stack
- **Frontend**: Framework, UI library, deployment
- **Backend**: API approach, auth, database
- **External services**: What third-party APIs or services are needed?
- **Infrastructure**: Hosting, job queues, file storage, etc.

#### Key Decisions
For each decision, capture:
- What was decided
- Why (rationale)
- What else was considered

### Output:

```
## Architecture

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|

### External Services
| Service | Purpose |
|---------|---------|

### Key Architectural Decisions
| Decision | Rationale | Alternatives |
|----------|-----------|-------------|
```

---

## Phase 5: Roadmap

**Goal**: Break the MVP into phases with concrete tasks.

### Structure the build:

Work backwards from the MVP:
- What must be built first? (usually: data model, core domain logic)
- What depends on what?
- What can be done in parallel?

### Create 3-5 phases:

Typical pattern:
1. **Foundation**: Project setup, data model, auth, core infrastructure
2. **Core Feature**: The main thing the product does
3. **Polish & Integration**: UI refinement, integrations, error handling
4. **Launch**: Landing page, payment, onboarding, go-live
5. **Post-Launch**: Monitoring, iteration, secondary features

For each phase:
- Break into 5-10 concrete tasks
- Assign IDs (P1-001, P1-002, etc.)
- Identify dependencies
- Link to relevant chapter domains

### Identify open questions:

Things we can't decide yet but need to resolve:
- Assign IDs (Q-001, Q-002)
- Note what they're blocking

---

## Phase 6: Generate Documentation

**Goal**: Create all project documentation files, fully populated.

### Create these files:

1. **documentation/MASTER.md** — Fill in from template:
   - "What is {project}?" paragraph from Phase 3
   - Task routing table (based on chapters created)
   - Architecture overview diagram from Phase 4
   - Project principles (derive from the conversation — what matters most?)
   - Chapter index
   - Initial decisions table

2. **documentation/ROADMAP.md** — Fill in from Phase 5:
   - Current focus (Phase 1)
   - Active sprint (first batch of tasks)
   - Open questions
   - Full phase roadmap with all tasks

3. **documentation/chapters/vision.md** — Fill in from Phases 1-3:
   - Product definition
   - ICP
   - Value proposition
   - Business model
   - Competitive landscape
   - Key decisions from product definition

4. **documentation/chapters/architecture.md** — Fill in from Phase 4:
   - Tech stack
   - Architecture diagram
   - External services
   - Key decisions

5. **Additional chapters** as needed based on the product
   - Only create chapters for domains that are well-defined enough
   - Use the chapter TEMPLATE.md structure

6. **.claude/project.json** — Fill in project name, description, paths. Set `launch.status: "pre-launch"` and `launch.activeUsers: false` by default — new projects start pre-launch. The user can run `/go-live` later to flip this.

### Self-Review After Writing

Once all files are drafted (but before reporting "done"), re-read each with fresh eyes and fix inline:

- **Placeholder scan.** Any "TBD", "TODO", "figure out later", "similar to above" in ROADMAP task descriptions? Replace with real content or mark explicitly as an Open Question.
- **Internal consistency.** Do MASTER.md, ROADMAP.md, and chapters agree on what's being built? Does the architecture match the feature descriptions?
- **Scope check.** Is this focused enough for a single project? If the idea covers multiple independent subsystems (chat + billing + analytics + file storage), flag to the user that this should be decomposed into separate projects, each with its own kickoff.
- **Ambiguity check.** Could any requirement be read two different ways? Pick one and make it explicit.
- **WHY capture.** Each chapter's Key Decisions has Rationale AND Alternatives. Each major decision has a Revisit-if condition.

Fix issues inline. No need to re-review — just fix and move on.

### Present the generated docs:

Show a summary of what was created:
```
## Documentation Generated

### Files Created
- documentation/MASTER.md — {summary}
- documentation/ROADMAP.md — {X phases, Y tasks, Z open questions}
- documentation/chapters/vision.md — {summary}
- documentation/chapters/architecture.md — {summary}
- {any other chapters}

### Ready to Go
Run /start to orient, then describe what to build in natural language.
```

---

## Conversation Principles

### Be a co-founder, not a secretary
- Challenge assumptions: "Are you sure that's your target user?"
- Offer insights: "Based on the research, I think the bigger opportunity is..."
- Push for specificity: "Everyone" is not an ICP. "$10-50/month" is not a price.
- Flag risks: "This is a crowded space. Your differentiation needs to be clearer."

### Research is not optional
- Always do web searches in Phase 2. Real data beats gut feelings.
- If you can't find competitors, that's a signal (good or bad) worth discussing.
- Pricing should be grounded in market reality, not wishful thinking.

### Keep momentum
- Don't let any phase drag on too long
- If the user is uncertain, help them decide (with caveats): "Let's go with X for now. We can revisit in Phase 2 of the build."
- Perfect is the enemy of shipped. Capture decisions, move forward.

### Capture everything
- Every decision has a rationale. Write it down.
- Every alternative considered gets noted. Future sessions need this context.
- Open questions are explicitly tracked, not forgotten.

### The output matters more than the conversation
- The goal is populated documentation files, not a fun chat
- Every phase should produce concrete written artifacts
- By the end, someone reading MASTER.md + ROADMAP.md should understand the entire project

---

## Timing Guide

This session typically runs through all 6 phases in one sitting. If the user needs to break:
- Save progress by generating whatever docs are ready so far
- Note where to resume in ROADMAP.md
- They can re-run `/kickoff` and say "we left off at Phase X"

---

## Rules

- Do real web research. Don't make up competitor names or market data.
- Present research findings honestly, even if they challenge the idea.
- Always confirm before generating documentation files.
- Generate REAL content, not templates with placeholders. The user should be able to /start immediately after.
- If the idea has serious viability concerns, say so — respectfully but directly.
