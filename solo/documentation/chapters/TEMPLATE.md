---
last_updated: {{DATE}}
updated_by: agent
version: initial
---

# {{Chapter Title}}

> **Purpose of this chapter.** A chapter is the durable **domain knowledge** for one area: what was built, where it lives, and how the architecture works — written for a fresh agent (human or Gilfoyle) with zero context. **Decisions and lessons are NOT stored here.** They live in `../decisions/` and `../lessons/` (the single sources both you and the cloud agent read and write). This chapter carries a **"Decisions & lessons affecting this domain"** pointer list linking to those files. When you find yourself about to write a decision body or a gotcha inline, stop — write it to the right dir and add a link here instead.

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

## Decisions & lessons affecting this domain

Decisions and lessons live in their own single-source dirs, not inline here — link the relevant ones so a reader of this chapter can find them (and so there's exactly one copy, the same one the cloud agent reads).

**Decisions:** (`../decisions/`)
<!-- - [YYYY-MM-DD-<slug>](../decisions/YYYY-MM-DD-<slug>.md) — one-line what + why -->

**Lessons:** (`../lessons/`)
<!-- - [YYYY-MM-DD-<slug>](../lessons/YYYY-MM-DD-<slug>.md) — one-line trap -->

## Open Questions

Questions we haven't resolved yet for this domain. List them here even if they're not currently blocking — future sessions may have more context to answer them.

## Related

- [MASTER.md](../MASTER.md)
- [ROADMAP.md](../ROADMAP.md)
<!-- Link to other chapters whose decisions affect or depend on this one. -->
