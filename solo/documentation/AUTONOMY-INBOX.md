---
last_updated: {{DATE}}
---

# Autonomy Inbox — what the cloud agent parked for you

The cloud agent appends one entry here whenever it parks a task on a gate or surface
condition (it also pings Telegram in real time). `/start` reads this file and surfaces
open entries. Clear an entry once you've handled it.

Format (one block per parked item):

```
## [YYYY-MM-DD] <task-id> — <gate or surface-condition>
- What's done: <one line>
- Blocker / decision needed: <one line>
- Link: <PR / issue / file>
- Status: open | cleared
```

<!-- Cloud agent appends below this line -->
