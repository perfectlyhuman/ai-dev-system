---
last_updated: 2026-05-18
updated_by: agent
version: initial
---

# OMC Rollback Procedure

> **When to use this doc.** If the OMC integration isn't working out — too much noise, too much cost, surface conditions don't fire correctly, or you just want your old workflow back — this is how to undo it cleanly.

## Reversibility summary

| Component | Reversal cost |
|-----------|---------------|
| OMC plugin install | Trivial — `/plugin uninstall` |
| Per-project `.omc/` directory | Trivial — delete |
| HUD / statusline | Trivial — settings.json revert |
| `.claude/settings.local.json` overrides | Trivial — delete file |
| `/grind-phase` skill | Trivial — git revert in ai-dev-system |
| `/update-docs` wiki-ingest extension | Trivial — git revert; gracefully no-ops without `.omc/wiki/` |
| Chapter entries promoted from wiki | Permanent — these are now part of the institutional memory regardless of OMC's state |
| Code OMC autonomously wrote during a phase run | Permanent unless `git revert` — normal commit history applies |

## Full rollback procedure (in order)

### 1. Stop any in-progress autonomous run

If `/grind-phase` is currently running, interrupt the session. Wait for the agent to checkpoint (commit any completed task) before killing.

### 2. Uninstall OMC

In a Claude Code session:
```
/plugin uninstall oh-my-claudecode
/plugin marketplace remove Yeachan-Heo/oh-my-claudecode
```

Verify:
```
/plugin list
```
Expected: `oh-my-claudecode` no longer appears.

### 3. Remove per-project OMC state

For each project where OMC was active (initially: Seek only):
```bash
rm -rf "c:/Users/riley/Cursor/perfectlyhuman/seek/.omc"
rm -f "c:/Users/riley/Cursor/perfectlyhuman/seek/.claude/settings.local.json"
```

### 4. Revert ai-dev-system changes (if desired)

ai-dev-system's default branch is `master` (not `main`). If you want to roll ai-dev-system back to its pre-OMC state too:
```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" checkout master
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" branch -D feat/omc-integration   # only if you're done with the branch entirely
```

If the branch was merged, identify the merge commit and revert it:
```bash
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" log --oneline --grep="omc"
git -C "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system" revert <merge-sha>
```

**Note:** This removes `/grind-phase` and the wiki-ingest step in `/update-docs`. Existing chapter entries (including any promoted from OMC wiki) remain — they're indistinguishable from regular chapter content.

### 5. Verify settings rolled back cleanly

There is no full settings snapshot to diff against — baseline is the redacted `plugins-manifest.txt`. Check structurally:

```bash
grep -i "oh-my-claudecode" "$HOME/.claude/settings.json"
```
Expected: no matches. If any remain, the uninstall didn't fully clean the `enabledPlugins` block — edit `~/.claude/settings.json` by hand to remove the orphan entry.

Compare the live plugin list against the baseline manifest:
```bash
diff <(grep -A 20 "enabledPlugins" "$HOME/.claude/settings.json" | head -30) <(grep -A 20 "Enabled" "c:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/docs/omc-integration-baseline-2026-05-18/plugins-manifest.txt")
```
Trivial diff in formatting is fine. The plugin entries should match what's in the baseline manifest.

### 6. Verify baseline behavior

Open a fresh Claude Code session in any project. Confirm:
- `/start` and `/finish` work normally.
- `/update-docs` runs without the wiki-pre-scan step (or runs the step and finds no `.omc/wiki/`, which is also fine — it no-ops).
- superpowers' `brainstorming` triggers on creative requests, with no magic-keyword interference.

## Partial rollbacks

### Keep `/grind-phase` but disable OMC

Possible — `/grind-phase` should detect OMC's absence and fall back to per-task superpowers execution (essentially behaving like `subagent-driven-development` invoked directly). Verify this fallback works during smoke testing (Task 9 in the integration plan).

### Keep OMC but disable autonomy

Delete `.claude/settings.local.json` from a project but keep the plugin installed. Without the surgery overrides, OMC's defaults take over — which means magic-keyword escalation and `persistent-mode.mjs` are active. This is **not recommended** because it loses the surgery that made OMC compatible with superpowers' discipline.

If you want OMC's wiki / skillify / HUD without the autonomy modes, write a targeted `settings.local.json` that disables only the autonomy hooks (`persistent-mode`, `keyword-detector`, `skill-injector`) and leaves the rest.

## Related

- [omc-integration-plan-2026-05-18.md](../../../docs/omc-integration-plan-2026-05-18.md) — the original integration plan
- [autonomy-surface-conditions.md](./autonomy-surface-conditions.md)
- [SYSTEM.md](../../../SYSTEM.md)
