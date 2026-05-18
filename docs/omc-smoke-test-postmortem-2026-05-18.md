# OMC Integration Smoke Test — Post-Mortem (2026-05-18)

This document captures the post-mortem of the first `/grind-phase` smoke test, run against Seek's P1.5 cleanup phase on 2026-05-18.

**Verdict:** The autonomy engine worked as designed for the path it actually took (executing-plans). The load-bearing path it was *supposed* to take (OMC `team` mode + superpowers subagent-driven-dev) was bypassed by the executor's pragmatic judgment and remains unvalidated. Run #2 will force OMC team mode to close that gap.

---

## What was tested

- **Plan:** [seek/documentation/specs/2026-05-18-p1.5-cleanup-design.md](../../seek/documentation/specs/2026-05-18-p1.5-cleanup-design.md)
- **Phase:** P1.5 — three known-leftover cleanups from the 2026-05-18 P1-006 handoff
- **Invocation:** `/grind-phase p1.5` in a fresh Seek Claude Code session
- **Outcome:** 6 commits landed (3 code + 3 docs), all acceptance gates green, 33/33 tests held, 11 commits pushed to Seek prod via subsequent `/ship`, Vercel build green

## What worked (design validations)

| Capability | How it showed up |
|---|---|
| Plan resolution from `documentation/specs/` | The `feat/omc-integration` patch (commit `a5b2e53`) landed cleanly — `/grind-phase p1.5` found `2026-05-18-p1.5-cleanup-design.md` on first try |
| Chapter survey contradiction-vs-improvement distinction | Agent correctly classified "inngest-cli Learning's Prevention currently says 'prefer npx', plan supersedes that" as improvement, NOT chapter-contradiction. Zero false-positive surface firings. |
| Pre-flight VERIFICATION-GATE | Caught nothing because nothing was wrong — gate did its job |
| Per-task `/update-docs` Iron Law | architecture.md v0.7 → v0.9 across the run, with chapter writes committed *between* task implementations. If the run had been interrupted, docs would have remained consistent up to the last completed task. |
| Status-on-demand UX | When Riley asked "are we still running?" mid-flight, the agent returned a concise current-state report including next-step preview |
| Behavioral verification (not just compilation) | Verified `200` status on home route AND analyzed Set-Cookie absence on anonymous probe as *expected* (because `updateSession` no-ops cookies for unauthenticated sessions). Not just "tests pass." |
| No-autonomous-push Iron Law | Phase close-out surfaced "Phase complete. Run `/ship` when ready" — explicit human gate held. |
| Surface-conditions policy | Zero must-surface gates fired. Zero must-not-surface false interruptions. Policy was correctly load-bearing only. |

## What didn't get exercised (real gaps)

| Capability | Why not exercised |
|---|---|
| **OMC `team` mode orchestration** | Executor chose `superpowers:executing-plans` instead, citing "tasks are tiny, subagent dispatch is overhead." Pragmatic individually but bypassed the load-bearing integration. **Fixed in `/grind-phase` Step 4 tightening (commit `399c3f0`) — executing-plans is now a surface condition.** |
| **Subagent dispatch + two-stage review** | Folded into single-thread executing-plans. Implementer + spec-reviewer + quality-reviewer dispatch never happened. |
| **ralph verify-fix loop** | No test failures triggered it. Untested. |
| **Multi-task surface conditions** (chapter contradiction, plan deviation, stalled verify) | None fired during the run. That's correct for a clean small phase but means we don't know they actually work as designed. |

## Friction log — permission prompts during the run

Seven Claude-Code-level permission prompts fired across the run. None were `/grind-phase` surface conditions (none were load-bearing decisions). All were Claude Code's tool-permission gates being asked for the first time per pattern.

| # | Pattern | Category | Fix path |
|---|---|---|---|
| 1 | `pnpm --filter web exec inngest-cli --version` | First-pnpm-exec-pattern | Project allowlist: `pnpm *` |
| 2 | `if (-not (Test-Path "scripts")) { New-Item -ItemType Directory ... }` | PowerShell brace-with-quote ("expansion obfuscation" heuristic) | Refactor to bash `mkdir -p`; or allowlist that PS pattern |
| 3 | `until powershell -NoProfile -Command "..."; do sleep 1; done` polling | First-polling-pattern | Allowlist `powershell -NoProfile *` |
| 4 | Bash-tool-wrapped PowerShell with `$_` automatic var | **Real bug** — bash parser mangled `$_` (see Learning A below) | Agent self-corrected to PowerShell tool |
| 5 | `Get-NetTCPConnection ...` clean root | First-Get-NetTCPConnection-pattern | Allowlisted in-flight (`Get-NetTCPConnection *`) |
| 6 | `Get-NetTCPConnection ... ; "---"; "Count: $(...)"` (nested `$()`) | Allowlist doesn't carry through nested script blocks | Refactor to sequential `$count = ...; "Count: $count"` |
| 7 | `"Listening: $(...)"` single-line subexpression | Same nested-script-block category as #6 | Same fix |

The cumulative friction was ~30 sec per prompt × 7 prompts = ~3.5 minutes of Riley waiting on prompts during a ~10-minute autonomous run. Not catastrophic, but the whole point of the system is reducing human-attention cost.

**Single biggest UX fix for run #2:** Riley runs `/fewer-permission-prompts` in Seek to scan today's transcripts and write a baseline `.claude/settings.json` allowlist. Should cover patterns 1, 3, 5, 6, 7 in one pass.

---

## New Learnings (canonical chapter format)

### A. Bash-tool-wrapped PowerShell mangles `$_` automatic variable on Windows (2026-05-18)

**Problem:** Agent invoked PowerShell content through the Bash tool: `powershell -NoProfile -Command "Get-NetTCPConnection ... | ForEach-Object { ... '{0}: PID {1}' -f $_.LocalPort, $_.OwningProcess ... }"`. Command failed with PowerShell parse errors:
- `You must provide a value expression following the '-f' operator.`
- `Unexpected token 'extglob.LocalPort' in expression or statement.`

**Wrong assumption:** That wrapping a PowerShell command in the Bash tool's `bash -c "powershell -Command '...'"` is just as good as invoking PowerShell directly — bash should pass the string through unchanged.

**Reality:** Bash's parser eagerly interprets `$_` as a (typically empty) bash variable and performs parameter expansion before PowerShell ever sees the string. The literal `$_.LocalPort` becomes `extglob.LocalPort` (bash's `extglob` shopt is the closest match the parser finds) — a totally different identifier that PowerShell can't parse. The same mangling happens to any `$varname` PowerShell automatic variable when passed through bash.

**Solution:** Use Claude Code's **PowerShell tool directly** instead of wrapping PowerShell content in the Bash tool. The PowerShell tool routes content through `powershell.exe` natively without bash's parameter-expansion step.

**Prevention:** On Windows projects, default tool-selection rule:
- PowerShell content → PowerShell tool
- POSIX-shell content → Bash tool
- **Never wrap PowerShell in Bash via `bash -c "powershell -Command '...'"`** — bash's `$varname` expansion will mangle PowerShell's automatic vars (`$_`, `$args`, `$PSItem`, etc.) before PowerShell sees them.

This applies to ANY Windows project, not just Seek. Worth checking PR diffs for `bash -c "powershell -Command` patterns and refactoring them.

### B. `/grind-phase` executor will silently fall through to `executing-plans` when tasks are small unless explicitly forbidden (2026-05-18)

**Problem:** The first `/grind-phase` smoke test was specifically designed to validate the OMC `team` mode + superpowers `subagent-driven-development` integration. The executing agent saw three small (~5-minute) tasks in the plan and decided "subagent dispatch is overhead for tasks this size" — rerouted to `superpowers:executing-plans` and ran the whole phase single-threaded. The phase completed cleanly, but the integration path it was supposed to test stayed untested.

**Wrong assumption:** That the `/grind-phase` skill body's instruction to "invoke OMC's `team` skill with the phase plan as input" was strong enough to keep the executor on the designed path. It read as a recommendation, not a requirement.

**Reality:** The plan header from `superpowers:writing-plans` says "REQUIRED SUB-SKILL: subagent-driven-development OR executing-plans" — that "OR" gives the executor a permitted escape hatch. Combined with the executor's pragmatic-judgment training to minimize agent-dispatch overhead, executing-plans wins on small phases. The skill body's "invoke OMC's team skill" gets treated as a *recommended default*, not a hard rule.

**Solution:** Tightened `/grind-phase` Step 4 (commit `399c3f0`):
- States OMC team mode is the default orchestration path, not a suggestion
- Explicitly forbids silent fall-through to executing-plans
- Classifies the "tasks too small for team-mode" judgment as a plan-deviation **surface condition** — executor must STOP, surface reasoning, and let Riley decide
- The only auto-permitted fall-through is when OMC is genuinely not installed (no `oh-my-claudecode:team` skill loaded)

**Prevention:**
- When designing a `/grind-phase` skill body (or analogous orchestrator), distinguish between "this is the recommended default" (advisory) and "this is the designed path; deviation is a surface condition" (binding). The latter requires explicit surface-condition framing, not just emphasis.
- When the load-bearing integration point exists *because* the orchestrator exists, deviation from it makes the orchestrator pointless. Treat the deviation as either a bug-in-routing or a real design question that needs human input — never as a silent pragmatic shortcut.
- For run #2 (and any phase until OMC team mode is validated end-to-end at least once), force OMC team mode regardless of phase size. After that single validation run, re-evaluate whether to relax to a size-threshold rule.

---

## Decisions made

| Decision | Rationale | Revisit if |
|---|---|---|
| **Option (c) for run #2: force OMC team mode regardless of phase size** | The integration's load-bearing path needs at least one successful end-to-end validation before we can trust the executor's pragmatic-judgment routing | After one successful OMC team-mode run, re-evaluate whether a size-threshold rule (≥3 tasks → team mode, 1-2 tasks → executing-plans) is appropriate |
| **`/grind-phase` Step 4 hardened — executing-plans is now a surface condition** | Smoke test showed the recommendation language was too soft; needed binding-rule framing | If after several runs the surface-condition fires too often (i.e. real phases really are too small for team-mode), revisit the routing rule rather than weakening the gate |
| **Permission-prompt fatigue is a real cost worth fixing** | 7 prompts in a 10-minute run = ~35% of wall-clock spent on permission gates. Riley's "I hate rubber-stamping" complaint was vindicated by data. | `/fewer-permission-prompts` baseline should reduce this to ≤2 prompts per run. If not, escalate to broader allowlist or settings.json restructure |
| **Defer adding P1.5 to Seek's ROADMAP as a completed milestone** | Bookkeeping; can land in next `/start` session. Not load-bearing for the integration assessment. | If we run a Phase 1.6 cleanup or similar smoke test, capture both at once |

## Recommendations for run #2

1. **Riley runs `/fewer-permission-prompts` in Seek** to scan today's transcripts and produce a baseline `.claude/settings.json` allowlist. Cleanest single fix for the permission friction.
2. **Pick a slightly larger phase** for run #2 — 5-8 tasks rather than 3 — so team-mode overhead is amortized over more work AND so multi-task surface conditions have realistic chance to fire (chapter contradiction, stalled verify, etc.).
3. **Watch for OMC team mode artifacts** that didn't appear in run #1:
   - `.omc/state/` files (agent state tracking)
   - `.omc/sessions/*.json` (session replay)
   - Per-task agent dispatch in Claude Code's task panel
   - `team-verify` and `team-fix` ralph loop visibility
4. **If OMC team mode genuinely breaks** when invoked, that's a real failure mode worth investigating — it could mean OMC's `team` skill expects entry conditions `/grind-phase` doesn't set up, or there's an integration-layer bug. Don't paper over by falling back to executing-plans; surface the failure and we patch.
5. **The `/update-docs` wiki-pre-scan step was not triggered** during run #1 because `.omc/wiki/` was empty (no OMC working memory had accumulated yet). Run #2 may produce wiki entries — watch whether `/update-docs` promotes them correctly to chapters.

## Open questions for future runs

- **When does executing-plans become the right choice?** Right now it's surface-conditioned (= "always ask"). At what phase size or task complexity should it become the auto-default? Possibly never (always prefer team mode), possibly small phases of 1-2 tasks. Data over 3-5 runs will inform.
- **Is OMC's `team` skill load-bearing on `.omc/state/` initialization?** If `/grind-phase` invokes it cold, does it bootstrap correctly, or does it need a prior `/team` invocation to set up state files?
- **What does the chapter-contradiction surface look like when it actually fires?** Run #1 had zero — the smart distinction was made entirely in pre-flight. Run #2 in a phase that legitimately touches a prior decision will be the first real test.
- **How does the wiki promotion ceremony in `/update-docs` perform** when there's actual OMC wiki content to ingest? Run #1 had nothing to promote.

## Related

- [omc-integration-plan-2026-05-18.md](omc-integration-plan-2026-05-18.md) — the original 11-task integration plan (Task 11 is this post-mortem)
- [solo/.claude/skills/grind-phase.md](../solo/.claude/skills/grind-phase.md) — the orchestrator skill (Step 4 hardened post-mortem)
- [solo/documentation/workflows/autonomy-surface-conditions.md](../solo/documentation/workflows/autonomy-surface-conditions.md) — the surface-condition policy
- Seek's `documentation/chapters/architecture.md` v0.9 — the project-level chapter that captured the technical Learnings (em-dash encoding, pnpm.onlyBuiltDependencies, port-cleanup script) during the run itself
