---
description: "Prep and run a long autonomous work session (e.g. before an away stretch). Scope a coherent, reversible-safe chunk of work; run it continuously while accumulating a decisions+learnings ledger; hard-stop at any fork needing Riley's judgment or money; then close with /update-docs + /finish so the debrief lands in HANDOFF for /start."
user_invocable: true
---

# /prep-engines — Prep the engines for a long autonomous run

**Announce at start:** "I'm using the /prep-engines skill to line up and run a long autonomous session."

Run this before an away stretch (classically, before bed). It "primes the engines": identify a chunk of work you can do **confidently and autonomously** for a long stretch, run it continuously without Riley in the loop, accumulate every decision + learning + parked question as you go, and stop only when you hit a genuine fork (his judgment / money / irreversibility) or you finish the thread. Then close the loop (`/update-docs` → `/finish`) so Riley wakes to a tight debrief.

The goal Riley named: **"more juice out of the squeeze"** — turn away-time into real, safe progress, not idle waiting.

## Why this skill exists

Left to ad-hoc prompting, an away period is wasted or spent on scattered busywork, and the autonomy boundary is fuzzy — what's safe to just do vs. what needs a human? This makes the ritual repeatable: a clear autonomy contract, one scoped thread, a running ledger, and a structured debrief — the exact shape that worked the night of 2026-08-03.

## The autonomy contract (the heart of this skill)

One principle: **reversible + repo-local + non-customer-facing + no-money = GO. Irreversible, or money, or customer-facing, or product-judgment = PARK for Riley.** When unsure, PARK (with a crisp question + your recommendation) and keep working on something clearly GO.

**GO — do it; make best-judgment calls; log each:**

| Class | Examples |
|---|---|
| Repo-local code/docs/tests | features, refactors, experiment scripts, prototypes, benchmarks, analysis |
| Read-only against prod/cloud | queries, `EXPLAIN`, measurement, verification |
| Local dev-DB work | schema/RLS on **local** Supabase, proven with pgTAP (NOT pushed to cloud) |
| Reversible decisions | param choices, structure, naming, which approach — **log what · why · how to unwind** |
| Inner-loop discipline | TDD, systematic-debugging, subagents, worktrees |

**PARK — stop and hand to Riley (do NOT do unsupervised):**

| Class | Why |
|---|---|
| Push / merge / PR / **commit** | Iron Law: no push/merge without explicit auth; global rule: commit only when asked → leave work in the tree, document it |
| Money | new spend, compute-tier upgrades, paid-API at scale, provisioning billable resources |
| Production / customer-facing | live user surfaces, prod deploys, external comms |
| Live-data mutations at scale | applying schema/RLS to the **cloud** DB, big loads, anything risking the disk or irreversibility (writing + proving locally is GO; applying to cloud is PARK) |
| Secrets / security ops | rotating credentials, auth changes |
| Product judgment | thresholds, UX, priorities, what-to-build, pricing |
| Irreversible / hard-to-unwind | anything you can't cheaply revert |
| Thrash | 3+ failed fixes on the same thing → park per systematic-debugging, don't spin |

The project **Iron Laws still apply** (survey chapters before proposing; no deploy without fresh test output; `/update-docs` before "done"; RLS/schema → `/rls-review`). See the rulebook.

## Phase 1 — Prep (scope the run)

1. **Orient** (fast): current HANDOFF "where to start", in-flight work, `TaskList`, ROADMAP / Linear, and each relevant chapter's **Open Questions**.
2. **Pick the thread.** Prefer, in order: (a) continue the current direction where a clean autonomous chunk exists; (b) a confidently-autonomous item from the roadmap / tasks / open-questions. Favor **one coherent thread with a thesis** over scattered tasks — sized to fill the away window (≥1h, ideally more), with natural checkpoints.
3. **Resolve-don't-defer bias:** prefer work that *answers* an open question with evidence (a benchmark, a test, an `EXPLAIN`, a prototype) over work that restates it. If last session deferred something answerable, that's prime material.
4. **Announce the plan + boundaries** in one tight message: the thread, what you'll do, the reversible calls you expect to make yourself, and the specific forks you'll PARK. If Riley is still around he can redirect; **invoking /prep-engines is his authorization to proceed** — don't block waiting on him. Only ask (AskUserQuestion) up front if the thread choice is genuinely ambiguous or the first real step is itself a fork.
5. **Open the ledger** — a running scratch you append to all run (DECISIONS · LEARNINGS · PARKED-FOR-RILEY). A notepad or scratch file is fine; it becomes the debrief.

## Phase 2 — Run (execute + accumulate)

- Work the thread with the inner-loop skills. Use **background jobs** for long tasks and **checkpoint** at meaningful moments — especially the instant any spend begins or big state changes.
- **Evidence before assertions** — verify every state mutation with a fresh read; never claim done from an unmatched tool result.
- **Accumulate the ledger continuously**, not at the end:
  - **DECISION** (reversible call you made): what · why · how to unwind.
  - **LEARNING** (finding, esp. one that changes direction): what you now know that you didn't.
  - **PARKED** (fork for Riley): the crisp plain-language question · your recommendation · reversibility/cost.
- **Don't let one fork halt the run.** Park that atom and continue other GO work. Fully stop only when: the thread is done, a blocker gates *everything*, or nothing autonomous remains.
- **Right-size rigor** (Riley's posture): heavy process only for genuinely high-stakes / irreversible work; otherwise bias hard to action.

## Phase 3 — Close (debrief → /update-docs → /finish)

1. **`/update-docs`** — fold the run's decisions + learnings into the chapters / decision-docs (Iron Law: nothing "done" without it).
2. **Assemble the DEBRIEF** from the ledger (template below).
3. **`/finish`** — write the debrief into HANDOFF under a clear, unmissable header so `/start` surfaces it first. Leave code uncommitted (document it as a leftover) unless Riley opted into committing.
4. Post the debrief to Riley in **plain language** — lead with what it means / why it matters, then the mechanism (he's sharp but not a veteran dev).

## The debrief format

Put this in HANDOFF (its own section) and echo it to Riley:

```
## ⚡ Autonomous run debrief (<date>)

**What I did** — shipped / advanced, concrete: files, tables, commits-if-any
**What I learned** — findings; call out any that change our direction
**Judgment calls I made** (reversible) — each: the call · why · how to unwind
**⛳ NEEDS RILEY** — each parked fork: plain-language question · my recommendation · cost/reversibility
```

The **NEEDS RILEY** block is the payload: it's what `/start` foregrounds next session, and often the first thing to deal with.

## Rules

- **/prep-engines does not commit or push.** Leave work in the tree; the debrief lists it. (Committing is Riley's call — unless he explicitly opts in when invoking.)
- **When unsure whether something is GO or PARK, PARK it** and keep moving on clearly-safe work.
- **Resolve, don't defer.** If an open question is answerable by doing the work, do the work.
- **One thread, not scattered busywork.** Depth over breadth.
- **Don't fabricate progress to fill the window.** If you genuinely run out of safe autonomous work, stop early and say so in the debrief.

## Related skills

- `/start` — reads the HANDOFF debrief this skill writes; foregrounds the NEEDS-RILEY items.
- `/finish` — writes the bridge; /prep-engines feeds it the debrief.
- `/update-docs` — persists the run's decisions + learnings before finishing.
- superpowers inner loop (TDD, systematic-debugging, subagents) — the execution discipline during the run.
