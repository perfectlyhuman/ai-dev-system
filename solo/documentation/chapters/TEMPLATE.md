---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# {{Chapter Title}}

> **Purpose of this chapter.** Every chapter serves two goals. First, it's an **index** — what was built in this domain and where to find it. Second, and more importantly, it's the **WHY** — the decisions made, the alternatives ruled out, the problems hit along the way, and the learnings that should keep us from making the same mistakes twice. When a fresh Claude session reads this chapter, it should come away understanding not just *what* exists but *why* it exists this way. If you find yourself writing only *what*, stop and add the *why*.

## Overview

{{2-3 sentences: what this domain is, why it exists, how it fits into the project.}}

## Key Files

| File | Purpose |
|------|---------|
| `path/to/file` | Description |

## Architecture

{{How this domain works. Diagrams, flow descriptions, key concepts.}}

## Implementation

{{Current implementation details. Code patterns, API usage, configuration.}}

## Key Decisions

Each non-trivial decision gets its own entry below. For small or obvious decisions, a single line in the summary table at the top is fine. For anything with real trade-offs, use the full micro-ADR format — the **Revisit if** line is especially important because it tells future sessions when the decision is still load-bearing vs. when it can be reopened.

### Summary

| Date | Decision | Rationale (one line) |
|------|----------|----------------------|
<!-- Quick lookup only. Each entry with real nuance gets its own section below. -->

<!-- Full micro-ADR template — copy for each non-trivial decision:

### YYYY-MM {{Decision title}}

**Context:** {What constraints forced this decision? What were we trying to achieve?}
**Options considered:** {A, B, C — list them all, even the ones we rejected quickly.}
**Decision:** {What we chose.}
**Why:** {The actual reasoning. What did the alternatives cost? What does this one buy us?}
**Consequences:** {What does this foreclose? What pain does it introduce? What does it make easy that wasn't before?}
**Revisit if:** {The specific conditions that should make us reopen this decision — growth, scale, a new constraint, etc.}

-->

## Learnings & Gotchas

Problems we hit, the wrong assumptions we made, and the solutions we found. **Document these liberally** — the whole point is to prevent the same bug from recurring in a different guise six weeks later.

Each entry should follow this format:

<!--
### {Problem Title} ({YYYY-MM})

**Problem:** {What we were trying to do.}
**Wrong assumption:** {What we believed that turned out to be false.}
**Reality:** {What was actually true.}
**Solution:** {What fixed it.}
**Prevention:** {How to catch this earlier next time — a check, a pattern, a docs update.}
-->

## Open Questions

Questions we haven't resolved yet for this domain. List them here even if they're not currently blocking — future sessions may have more context to answer them.

## Related

- [MASTER.md](../MASTER.md)
- [ROADMAP.md](../ROADMAP.md)
<!-- Link to other chapters whose decisions affect or depend on this one. -->
