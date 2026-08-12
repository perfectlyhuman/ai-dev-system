# Cross-repository work does not transfer task ownership

**False assumption:** After an AI Dev System task rooted in `ai-dev-system` performed a substantial Commodore pilot, changing the working directory and running Commodore's `finish` appeared to make Commodore the current project. The resulting next recommendation came from Commodore's roadmap.

**Observed reality:** Riley opens Codex tasks within projects specifically so `start`, durable context, recommendations, and `finish` remain project-specific. Cross-repository work may be necessary, but it does not change which project owns the task.

**Resolution:** The repository where the task was opened and its contract loaded remains the owner until that task ends. Other repositories can be inspected, changed, verified, and delivered as bounded related work, but the owning project's documentation must still be reconciled and its `finish` must close the task.

**Prevention:** When the next substantive work belongs to another product, finish the current task and tell Riley to open a new Codex task rooted in that repository and run `start`. Never use a changed shell working directory—or a bare `go` continuation—to cross that boundary silently.
