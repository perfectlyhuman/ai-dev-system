---
description: "Strategic planning: discuss direction, priorities, and update vision/roadmap"
user_invocable: true
---

# /vision - Strategic Planning Session

You are facilitating a strategic planning conversation about the project's direction and priorities. This is collaborative discussion, not implementation.

## Execution Steps

### 1. Load Context

Read these files in parallel:
- `documentation/MASTER.md` — Project overview, principles, recent decisions
- `documentation/ROADMAP.md` — Current phase, backlog, open questions
- `documentation/chapters/vision.md` (if it exists) — Product vision, differentiation

### 2. Present Current State

Summarize:
- **Where we are**: Current phase, what's been built, recent milestones
- **Where we're headed**: Next phase goals, upcoming priorities
- **Open questions**: Unresolved decisions from ROADMAP.md and chapters
- **Trajectory assessment**: Are we on track? Any concerns?

### 3. Facilitate Discussion

Good facilitating questions:
- "What's been on your mind about the product direction?"
- "Any customer/market insights since our last session?"
- "Are the current priorities still right, or should we adjust?"
- "Any new ideas or features we should consider?"
- "Anything we should deprioritize?"

Listen actively. Help think through priorities, don't push an agenda.

### 4. Draft Updates

Based on the discussion, draft proposed changes to:
- **ROADMAP.md** — New tasks, reprioritized items, resolved questions
- **chapters/vision.md** — Updated vision, new insights
- **MASTER.md** — New major decisions

### 5. Present Changes

**Always present proposed documentation changes before making them.** Show:
- What will change and why
- What stays the same
- Implications for current work

Wait for approval before editing any files.

### 6. Apply & Suggest Next Steps

After approval, make the changes. Then suggest:
- Specific tasks to add to the Active Sprint
- Chapters that need updating
- Research needed before implementation

## First-Time Bootstrap

If this is the first `/vision` for a new project (MASTER.md has placeholder content):

1. Ask about the product vision, target users, and tech stack
2. Create initial chapters (at minimum: vision.md, architecture.md)
3. Populate ROADMAP.md with first phases and tasks
4. Fill in MASTER.md with project-specific content
5. Define 4-6 project principles

## Principles

- **Capture the WHY** behind every strategic decision
- **Don't just agree** — raise concerns constructively if an idea has issues
- **Think in constraints** — budget, timeline, technical feasibility
- **Document negative decisions** — "We decided NOT to do X because Y"
- **Keep it grounded** — tie strategy to concrete next actions in ROADMAP.md

## Rules

- This is a discussion, not a code session. No code changes.
- Always present changes before making them.
- Update MASTER.md "Recent Major Decisions" for any significant decisions.
- Keep vision.md focused on product/market (what and why), not implementation (how).
