# Decision: Install skills for Codex, Cursor, and Claude Code from one source

**Date:** 2026-10-21
**Status:** accepted

## Context

V3 launched Codex-native and deliberately removed Claude Code runtime surfaces. Riley now works across Codex, Cursor, and Claude Code. Claude Code does not discover `.agents/skills/` and reads `CLAUDE.md` rather than `AGENTS.md`, so in Claude Code sessions the lifecycle skills were invisible and `RILEY.md` loaded only if `start` happened to run. Commodore had also ignored `.claude/` wholesale while retiring the old Claude/Superpowers layer, which would hide any Claude Code skills from Git.

## Decision

The system is agent-neutral. The installer copies every skill from `skills/` to both `.agents/skills/` (Codex, Cursor) and `.claude/skills/` (Claude Code) with the same drift protection. It creates a one-line `CLAUDE.md` containing `@AGENTS.md`, narrows a whole-directory `.claude/` gitignore to `.claude/*` plus `!.claude/skills/`, and, when `~/.claude/` exists, appends one `@~/.ai-dev-system/RILEY.md` import to `~/.claude/CLAUDE.md`. The default branch prefix becomes `agent/`.

Commodore's canonical-context resolution in `start` and its lineage checks in `finish` were promoted into the source skills at the same time.

## Why

Two copies of identical files are cheap and keep each agent on its native discovery path; symlinks are unreliable on Windows and in Git. `AGENTS.md` stays the single project contract and `RILEY.md` the single global one — Claude Code reaches both through imports instead of duplicated text. Only the retired Claude/Superpowers/OMC runtime stays excluded; `.claude/settings.local.json` and worktrees remain ignored.

## Consequences

- Installed projects carry each skill twice; edit the source and reinstall rather than editing either copy.
- `--refresh-skills` refreshes both copies; drift in either blocks installation.
- An existing `CLAUDE.md` is never overwritten; the installer warns if it lacks the import.

## Revisit when

A shared skill location becomes standard across these agents, or maintaining the duplicate copy causes real drift.
