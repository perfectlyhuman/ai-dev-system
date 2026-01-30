# AI Development System

A complete system for AI-assisted software development that integrates strategic planning (Google Docs), project management (Linear), and code implementation (Claude Code) into a unified workflow.

## What This Is

This system solves the fragmentation problem in development:
- **Vision lives in docs** that get stale and disconnected from reality
- **Project management** becomes a graveyard of outdated tickets
- **Code knowledge** exists only in developers' heads
- **AI assistants** start fresh every session, lacking project context

This system creates a **single source of truth** across three synchronized layers, with AI as the orchestration layer.

## The Three Pillars

```
Roadmap Doc (Strategic)     → What we want to build and why
        ↓
Linear (Tactical)           → What we're working on now
        ↓
Codebase + Docs (Implementation) → What actually exists
```

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- [Linear](https://linear.app) account with API key
- Google Cloud service account with Drive API access (for Roadmap doc)
- Node.js 18+ (for setup script)

## Installation

### 1. Install into your project

```bash
# From your project root
npx degit yourusername/ai-dev-system .claude --force
```

### 2. Run setup

```bash
node .claude/init.js
```

The setup will prompt you for:
- Project name
- Linear team name and API key
- Google Drive document ID for your Roadmap
- Documentation folder location

### 3. Configure Claude Code MCP servers

Add to your Claude Code settings (`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-drive"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      }
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-linear"],
      "env": {
        "LINEAR_API_KEY": "lin_api_xxxxx"
      }
    }
  }
}
```

### 4. Verify installation

```bash
claude
# Then type: /sync
```

You should see a status report showing all systems connected.

## Skills Reference

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/sync` | Morning check-in | Start of day, re-orient |
| `/vision` | Strategic planning | Weekly planning, priority shifts |
| `/align` | Sync Linear with Roadmap | After /vision, when drift detected |
| `/dev [ID]` | Work on an issue | Main development mode |
| `/test` | Run comprehensive tests | Before shipping |
| `/update-docs` | Update codebase docs | After completing work |
| `/check-assumptions` | Debug reflection | When stuck |
| `/branch [ID]` | Create issue branch | Start of /dev |
| `/ship` | Push, PR, close branch | End of /dev |

## Typical Daily Workflow

```
Morning:
  /sync                    → Check all systems, get oriented

Planning (weekly):
  /vision                  → Discuss strategy, update Roadmap
  /align                   → Push changes to Linear

Development (main loop):
  /dev INT-XX              → Pick issue, create branch, implement
    → /check-assumptions   → If stuck
    → /test                → Verify changes
    → /update-docs         → Capture learnings
    → /ship                → Push and close
  /dev INT-YY              → Next issue...
```

## Project Structure After Setup

```
your-project/
├── .claude/
│   ├── project.json       # Project configuration
│   ├── skills/            # Workflow skills
│   │   ├── sync.md
│   │   ├── vision.md
│   │   ├── align.md
│   │   ├── dev.md
│   │   └── ...
│   └── templates/         # Reference templates
├── docs/                  # Or app/documentation/
│   ├── MASTER.md          # Documentation entry point
│   └── chapters/          # Domain-specific docs
└── ... your code ...
```

## Creating the Roadmap Doc

1. Create a new Google Doc
2. Copy the structure from `templates/roadmap.md`
3. Share with your service account email
4. Note the document ID from the URL: `docs.google.com/document/d/[THIS-ID]/edit`

## Setting Up Linear

1. Create a Team for your project
2. Create an Initiative for your current work period
3. Create Projects matching your Roadmap projects
4. Get your API key from Linear Settings → API

## Full Documentation

See [SYSTEM.md](SYSTEM.md) for complete documentation including:
- Detailed explanation of each pillar
- Skill execution details
- Documentation templates
- Troubleshooting guide

## Updating

To update the system in an existing project:

```bash
# Backup your project.json first!
cp .claude/project.json .claude/project.json.bak

# Pull latest
npx degit yourusername/ai-dev-system .claude --force

# Restore your config
mv .claude/project.json.bak .claude/project.json
```

## License

MIT - Use freely, modify as needed.
