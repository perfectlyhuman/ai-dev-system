---
description: "Use when doing weekly/periodic strategic planning, when considering a pivot, when deciding what to build next at a phase boundary, or when priorities feel drifted"
user_invocable: true
---

# /vision - Strategic Planning Session

**Announce at start:** "I'm using the /vision skill to discuss direction and priorities."

Collaborative planning conversation about the project's direction. This is discussion, not implementation — no code changes during `/vision`.

## The Iron Laws

- **NO FILE EDITS WITHOUT PRESENTING PROPOSED CHANGES AND GETTING APPROVAL FIRST.**
- **NO STRATEGIC DECISION RECORDED WITHOUT RATIONALE AND CONSEQUENCES.**

Violating the letter of these laws is violating the spirit of them.

## Execution Steps

### 1. Load Context

Read these in parallel:
- `documentation/MASTER.md` — project overview, principles, recent decisions.
- `documentation/ROADMAP.md` — current phase, backlog, open questions.
- `documentation/chapters/vision.md` (if it exists) — product vision, differentiation.
- `.claude/project.json` — launch status, intake config.

### 2. Present Current State

Summarize:
- **Where we are:** current phase, what's been built, recent milestones.
- **Where we're headed:** next phase goals, upcoming priorities.
- **Open questions:** unresolved decisions from ROADMAP.md and chapters.
- **Trajectory assessment:** are we on track? Any concerns?

### 3. Facilitate Discussion

Good facilitating questions:
- "What's been on your mind about the product direction?"
- "Any customer or market insights since our last session?"
- "Are the current priorities still right, or should we adjust?"
- "Any new ideas or features we should consider?"
- "Anything we should deprioritize?"

Listen actively. Help think through priorities — don't push an agenda.

### 4. Draft Updates

Based on the discussion, draft proposed changes to:
- **ROADMAP.md** — new tasks, reprioritized items, resolved questions.
- **chapters/vision.md** — updated vision, new insights.
- **MASTER.md** — new major decisions.

### 5. Present Changes

<HARD-GATE>
Always present proposed documentation changes before making them. Show:
- What will change and why.
- What stays the same.
- Implications for current work.

Wait for approval before editing any files.
</HARD-GATE>

### 6. Apply & Suggest Next Steps

After approval, make the changes. Then suggest:
- Specific tasks to add to the Active Sprint.
- Chapters that need updating.
- Research needed before implementation.

## First-Time Bootstrap

If this is the first `/vision` for a new project (MASTER.md has placeholder content):

1. Ask about the product vision, target users, and tech stack.
2. Create initial chapters (at minimum: vision.md, architecture.md).
3. Populate ROADMAP.md with first phases and tasks.
4. Fill in MASTER.md with project-specific content.
5. Define 4-6 project principles.

(For a more structured first-time experience, recommend `/kickoff` instead of `/vision`.)

## Red Flags — STOP

- About to edit MASTER.md or ROADMAP.md without having shown the changes.
- Treating this as a code session rather than a discussion.
- Recording a strategic decision with no Rationale or Consequences sections.
- Pushing the user toward a specific decision instead of facilitating.

## Principles

- **Capture the WHY** behind every strategic decision — in micro-ADR format for anything non-trivial.
- **Don't just agree** — raise concerns constructively if an idea has issues.
- **Think in constraints** — budget, timeline, technical feasibility.
- **Document negative decisions** — "We decided NOT to do X because Y."
- **Keep it grounded** — tie strategy to concrete next actions in ROADMAP.md.

## Rules

- This is discussion, not code. No implementation during `/vision`.
- Always present changes before making them.
- Update MASTER.md "Recent Major Decisions" for any significant decisions.
- Keep `vision.md` focused on product/market (what and why), not implementation (how).
