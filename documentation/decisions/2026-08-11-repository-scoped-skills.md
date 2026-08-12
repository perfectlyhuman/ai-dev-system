# Decision: Install lifecycle skills per repository

**Date:** 2026-08-11
**Status:** accepted

## Context

Riley needs the same lifecycle across several projects, while each repository must remain understandable and usable with its own versioned project contract. Codex discovers repository skills from `.agents/skills/`. V3 also needs authoritative distributable skill sources from which projects can be installed or updated.

## Decision

Keep authoritative skill packages under `v3/skills/` in this source repository. Install copies into each project's `.agents/skills/` using the v3 installer.

## Why

Repository-scoped skills travel with the project, can evolve with its installed system version, and avoid dependence on opaque machine-global state. The installer makes synchronization explicit and refuses to overwrite locally drifted copies unless refresh is authorized.

A user-global installation would reduce copied files but make project behavior depend on whichever version happened to be installed on Riley's machine. Packaging as a plugin may eventually improve multi-project updates, but optimizing distribution before the private system is proven would add another layer prematurely.

## Consequences

- Installed projects contain small copies of the four skill packages.
- This source repository contains both authoritative sources and installed copies while self-hosting.
- Skill updates require an explicit installer refresh in each project.
- The installer must detect drift so it never silently erases project-local changes.

## Revisit when

Reconsider the distribution mechanism when updating skills across Riley's active projects becomes recurring friction, another human needs managed installation, or v3 is ready to become a public package or plugin.
