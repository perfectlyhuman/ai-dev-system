#!/usr/bin/env node

/**
 * create-ai-dev
 *
 * Usage:
 *   npx create-ai-dev --solo       # Solo mode (all in-repo, no external tools)
 *   npx create-ai-dev --team       # Team mode (Linear + Google Drive integration)
 *   pnpm create ai-dev --solo      # Same thing via pnpm
 *
 * This installs the AI Development System into the current directory.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  create-ai-dev — AI Development System

  Usage:
    npx create-ai-dev --solo     Solo mode (documentation-driven, no external tools)
    npx create-ai-dev --team     Team mode (integrates Linear + Google Drive)

  Options:
    --solo    Install solo mode (recommended for solopreneurs)
    --team    Install team mode (requires Linear + Google Drive setup)
    --help    Show this help message

  After installing:
    1. Open Claude Code in your project
    2. Run /kickoff to bootstrap your project (solo mode)
    3. Or run /sync to check the current state

  Learn more: https://github.com/perfectlyhuman/ai-dev-system
`);
  process.exit(0);
}

const mode = args.includes('--team') ? 'team' : 'solo';

if (!args.includes('--solo') && !args.includes('--team')) {
  console.log(`
  create-ai-dev — AI Development System

  Please specify a mode:

    npx create-ai-dev --solo     Solo mode (all in-repo, no external tools)
    npx create-ai-dev --team     Team mode (Linear + Google Drive integration)

  Run with --help for more info.
`);
  process.exit(1);
}

// Package directory (where the npm package is installed)
const packageDir = __dirname;
// User's project directory (where they ran the command)
const projectRoot = process.cwd();

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      const relative = path.relative(projectRoot, dest);
      console.log(`  + ${relative}`);
    } else {
      const relative = path.relative(projectRoot, dest);
      console.log(`  ~ ${relative} (already exists, skipped)`);
    }
  }
}

function setupSolo() {
  console.log(`
  AI Development System — Solo Mode

  Installing into: ${projectRoot}
  ─────────────────────────────────────
`);

  const soloDir = path.join(packageDir, 'solo');

  // Copy .claude/ (skills + project.json)
  console.log('  Skills & config:');
  copyRecursive(
    path.join(soloDir, '.claude'),
    path.join(projectRoot, '.claude')
  );

  // Copy documentation/
  console.log('\n  Documentation:');
  copyRecursive(
    path.join(soloDir, 'documentation'),
    path.join(projectRoot, 'documentation')
  );

  // Ensure archived/ exists
  const archivedDir = path.join(projectRoot, 'documentation', 'archived');
  if (!fs.existsSync(archivedDir)) {
    fs.mkdirSync(archivedDir, { recursive: true });
    console.log('  + documentation/archived/');
  }

  console.log(`
  ─────────────────────────────────────
  Done! Next steps:

  1. Open Claude Code in this project
  2. Run /kickoff to bootstrap your project
     (guided product discovery -> populated docs -> ready to build)

  Or if you already know what you're building:
  1. Edit .claude/project.json with your project name
  2. Run /vision to set up your documentation
  3. Run /sync to see your first tasks
`);
}

function setupTeam() {
  console.log(`
  AI Development System — Team Mode

  Installing into: ${projectRoot}
  ─────────────────────────────────────
`);

  // Copy skills
  console.log('  Skills:');
  copyRecursive(
    path.join(packageDir, 'skills'),
    path.join(projectRoot, '.claude', 'skills')
  );

  // Copy templates
  console.log('\n  Templates:');
  copyRecursive(
    path.join(packageDir, 'templates'),
    path.join(projectRoot, '.claude', 'templates')
  );

  // Copy examples
  console.log('\n  Examples:');
  copyRecursive(
    path.join(packageDir, 'examples'),
    path.join(projectRoot, '.claude', 'examples')
  );

  // Copy init.js
  const initSrc = path.join(packageDir, 'init.js');
  const initDest = path.join(projectRoot, '.claude', 'init.js');
  if (fs.existsSync(initSrc) && !fs.existsSync(initDest)) {
    fs.mkdirSync(path.dirname(initDest), { recursive: true });
    fs.copyFileSync(initSrc, initDest);
    console.log('  + .claude/init.js');
  }

  console.log(`
  ─────────────────────────────────────
  Done! Next steps:

  1. Run the interactive setup:
     node .claude/init.js

  2. Configure MCP servers (Linear + Google Drive)
     See https://github.com/perfectlyhuman/ai-dev-system for details

  3. Run /sync to verify everything is connected
`);
}

// Run
if (mode === 'solo') {
  setupSolo();
} else {
  setupTeam();
}
