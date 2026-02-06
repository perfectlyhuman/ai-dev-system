#!/usr/bin/env node

/**
 * AI Development System - Quick Setup
 *
 * Usage:
 *   npx degit perfectlyhuman/ai-dev-system _ai-setup && node _ai-setup/setup.js --solo
 *   npx degit perfectlyhuman/ai-dev-system _ai-setup && node _ai-setup/setup.js --team
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const mode = args.includes('--team') ? 'team' : 'solo';

// We're running from _ai-setup/ — target is the parent directory (the user's project)
const setupDir = __dirname;
const projectRoot = path.dirname(setupDir);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    // Don't overwrite existing files
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
  console.log('\n  AI Development System — Solo Mode\n');
  console.log('  Installing into: ' + projectRoot);
  console.log('  ─────────────────────────────────────\n');

  const soloDir = path.join(setupDir, 'solo');

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

  // Ensure archived/ exists (empty dirs don't copy)
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
     (guided product discovery → populated docs → ready to build)

  Or if you already know what you're building:
  1. Edit .claude/project.json with your project name
  2. Run /vision to set up your documentation
  3. Run /sync to see your first tasks
`);
}

function setupTeam() {
  console.log('\n  AI Development System — Team Mode\n');
  console.log('  Installing into: ' + projectRoot);
  console.log('  ─────────────────────────────────────\n');

  // Copy skills
  console.log('  Skills:');
  copyRecursive(
    path.join(setupDir, 'skills'),
    path.join(projectRoot, '.claude', 'skills')
  );

  // Copy templates
  console.log('\n  Templates:');
  copyRecursive(
    path.join(setupDir, 'templates'),
    path.join(projectRoot, '.claude', 'templates')
  );

  // Copy examples
  console.log('\n  Examples:');
  copyRecursive(
    path.join(setupDir, 'examples'),
    path.join(projectRoot, '.claude', 'examples')
  );

  console.log(`
  ─────────────────────────────────────
  Done! Next steps:

  1. Run the interactive setup:
     node .claude/init.js

  2. Configure MCP servers (Linear + Google Drive)
     See README.md for details

  3. Run /sync to verify everything is connected
`);

  // Copy init.js for team setup
  const initSrc = path.join(setupDir, 'init.js');
  const initDest = path.join(projectRoot, '.claude', 'init.js');
  if (fs.existsSync(initSrc) && !fs.existsSync(initDest)) {
    fs.copyFileSync(initSrc, initDest);
    console.log('  Copied init.js for interactive configuration.\n');
  }
}

// Run
if (mode === 'solo') {
  setupSolo();
} else {
  setupTeam();
}

// Clean up _ai-setup directory
console.log('  Cleaning up setup files...');
fs.rmSync(setupDir, { recursive: true, force: true });
console.log('  Setup directory removed.\n');
