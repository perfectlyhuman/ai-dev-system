#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const installerPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(installerPath), '..');
const skillNames = ['kickoff', 'start', 'access', 'update-docs', 'finish'];
const profiles = new Set(['makerkit']);
// Codex and Cursor discover .agents/skills; Claude Code discovers .claude/skills.
const skillRoots = [join('.agents', 'skills'), join('.claude', 'skills')];

const allowed = {
  stage: new Set(['prototype', 'design-partner', 'live']),
  deliveryMode: new Set(['commit', 'push', 'ship']),
  integration: new Set(['direct', 'pull-request']),
  deployment: new Set(['none', 'automatic', 'manual']),
};

function usage() {
  return `AI Dev System installer

Usage:
  node installer/install.mjs [options]

Options:
  --project <path>            Project root (default: current directory)
  --name <name>               Project name (default: directory name)
  --description <text>        Required when creating project.yaml
  --entity <alias>            Required when creating project.yaml
  --stage <value>             prototype | design-partner | live
  --delivery-mode <value>     commit | push | ship
  --main-branch <name>        Main branch (default: main)
  --preview-branch <name>     Optional continuously delivered pre-production branch
  --integration <value>       direct | pull-request
  --deployment <value>        none | automatic | manual
  --profile <name>            Optional project profile: makerkit
  --global-root <path>        Machine-wide context root (default: ~/.ai-dev-system)
  --claude-root <path>        Claude Code user directory (default: ~/.claude; skipped if absent)
  --refresh-skills            Replace drifted installed skill copies
  --dry-run                   Report actions without writing
  --help                      Show this help

The installer never overwrites .ai-dev/project.yaml, canonical project
documentation, AGENTS.md, CLAUDE.md, or Riley-global guidance. It only replaces installed skills
when --refresh-skills is set.`;
}

function parseArgs(argv) {
  const options = {
    projectRoot: process.cwd(),
    stage: 'prototype',
    deliveryMode: 'commit',
    mainBranch: 'main',
    integration: 'direct',
    deployment: 'none',
    profile: undefined,
    refreshSkills: false,
    dryRun: false,
  };

  const valueFlags = new Map([
    ['--project', 'projectRoot'],
    ['--name', 'name'],
    ['--description', 'description'],
    ['--entity', 'entity'],
    ['--stage', 'stage'],
    ['--delivery-mode', 'deliveryMode'],
    ['--main-branch', 'mainBranch'],
    ['--preview-branch', 'previewBranch'],
    ['--integration', 'integration'],
    ['--deployment', 'deployment'],
    ['--profile', 'profile'],
    ['--global-root', 'globalRoot'],
    ['--claude-root', 'claudeRoot'],
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }
    if (argument === '--refresh-skills') {
      options.refreshSkills = true;
      continue;
    }
    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    const key = valueFlags.get(argument);
    if (!key) {
      throw new Error(`Unknown option: ${argument}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`${argument} requires a value`);
    }
    options[key] = value;
    index += 1;
  }

  return options;
}

function assertOption(value, values, label) {
  if (!values.has(value)) {
    throw new Error(`${label} must be one of: ${[...values].join(', ')}`);
  }
}

function readConfiguredProjectName(projectConfig) {
  const content = readFileSync(projectConfig, 'utf8');
  const match = content.match(/^name:\s*(.+?)\s*$/m);
  if (!match) return undefined;

  const scalar = match[1].trim();
  if (scalar.startsWith('"')) {
    try {
      return JSON.parse(scalar);
    } catch {
      return undefined;
    }
  }
  if (scalar.startsWith("'") && scalar.endsWith("'")) return scalar.slice(1, -1);
  return scalar.split(/\s+#/, 1)[0].trim();
}

function validateOptions(options) {
  options.projectRoot = resolve(options.projectRoot);
  options.globalRoot = resolve(options.globalRoot || join(homedir(), '.ai-dev-system'));
  options.claudeRoot = resolve(options.claudeRoot || join(homedir(), '.claude'));

  if (!existsSync(options.projectRoot) || !statSync(options.projectRoot).isDirectory()) {
    throw new Error(`Project root is not a directory: ${options.projectRoot}`);
  }

  const projectConfig = join(options.projectRoot, '.ai-dev', 'project.yaml');
  options.name ||= existsSync(projectConfig)
    ? readConfiguredProjectName(projectConfig)
    : basename(options.projectRoot);
  options.name ||= basename(options.projectRoot);

  assertOption(options.stage, allowed.stage, '--stage');
  assertOption(options.deliveryMode, allowed.deliveryMode, '--delivery-mode');
  assertOption(options.integration, allowed.integration, '--integration');
  assertOption(options.deployment, allowed.deployment, '--deployment');
  if (options.profile && !profiles.has(options.profile)) {
    throw new Error(`--profile must be one of: ${[...profiles].join(', ')}`);
  }

  if (!existsSync(projectConfig) && (!options.description || !options.entity)) {
    throw new Error(
      '--description and --entity are required when .ai-dev/project.yaml does not exist',
    );
  }
}

function yamlString(value) {
  return JSON.stringify(value);
}

function renderProjectConfig(options) {
  return `# AI Dev System v3 project contract. Never put secret values in this file.
schema_version: 3
name: ${yamlString(options.name)}
description: ${yamlString(options.description)}
entity: ${yamlString(options.entity)}
stage: ${options.stage}

documentation:
  root: documentation
  project: documentation/PROJECT.md
  roadmap: documentation/ROADMAP.md
  chapters: documentation/chapters
  decisions: documentation/decisions
  lessons: documentation/lessons
  roadmap_archive: documentation/archive/roadmap

delivery:
  mode: ${options.deliveryMode}
  main_branch: ${yamlString(options.mainBranch)}
${options.previewBranch ? `  preview_branch: ${yamlString(options.previewBranch)}\n` : ''}  integration: ${options.integration}
  deployment: ${options.deployment}
  branch_prefix: agent/

verification:
  focused: []
  required: []
  deployment: []

services:${options.profile === 'makerkit' ? `
  stack: makerkit-next-supabase-turbo
  hosting: vercel
  database: supabase
` : ' {}\n'}

scopes: []

integrations:
  trello: false
  linear: false
  intake: false
`;
}

function listTree(root) {
  if (!existsSync(root)) return [];

  const output = [];
  const visit = (current, prefix = '') => {
    for (const name of readdirSync(current).sort()) {
      const absolute = join(current, name);
      const path = prefix ? `${prefix}/${name}` : name;
      const stat = statSync(absolute);
      if (stat.isDirectory()) {
        output.push({ path, type: 'directory' });
        visit(absolute, path);
      } else {
        output.push({ path, type: 'file', content: readFileSync(absolute) });
      }
    }
  };

  visit(root);
  return output;
}

function treesEqual(left, right) {
  const leftTree = listTree(left);
  const rightTree = listTree(right);
  if (leftTree.length !== rightTree.length) return false;

  return leftTree.every((entry, index) => {
    const other = rightTree[index];
    return (
      entry.path === other.path &&
      entry.type === other.type &&
      (entry.type === 'directory' || entry.content.equals(other.content))
    );
  });
}

function record(result, kind, projectRoot, target) {
  result[kind].push(relative(projectRoot, target).replaceAll('\\', '/'));
}

function recordGlobal(result, kind, target) {
  result.global[kind].push(relative(result.globalRoot, target).replaceAll('\\', '/'));
}

function ensureDirectory(target, options, result) {
  if (existsSync(target)) return;
  record(result, 'created', options.projectRoot, target);
  if (!options.dryRun) mkdirSync(target, { recursive: true });
}

function ensureFile(target, content, options, result) {
  if (existsSync(target)) {
    record(result, 'unchanged', options.projectRoot, target);
    return;
  }

  record(result, 'created', options.projectRoot, target);
  if (!options.dryRun) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
  }
}

function ensureGlobalFile(target, content, options, result) {
  if (existsSync(target)) {
    recordGlobal(result, 'unchanged', target);
    return;
  }

  recordGlobal(result, 'created', target);
  if (!options.dryRun) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, 'utf8');
  }
}

function registerProject(options, result) {
  const target = join(options.globalRoot, 'projects.yaml');
  let registry = { schema_version: 1, projects: {} };
  let kind = 'created';

  if (existsSync(target)) {
    kind = 'unchanged';
    try {
      registry = JSON.parse(readFileSync(target, 'utf8'));
    } catch {
      recordGlobal(result, 'unchanged', target);
      result.warnings.push(
        `Skipped project registration because ${target} is not JSON-compatible YAML.`,
      );
      return;
    }

    if (
      registry?.schema_version !== 1 ||
      !registry.projects ||
      typeof registry.projects !== 'object' ||
      Array.isArray(registry.projects)
    ) {
      recordGlobal(result, 'unchanged', target);
      result.warnings.push(`Skipped project registration because ${target} has an unknown shape.`);
      return;
    }

    if (registry.projects[options.name] !== options.projectRoot) kind = 'refreshed';
  }

  registry.projects[options.name] = options.projectRoot;
  recordGlobal(result, kind, target);

  if (!options.dryRun && kind !== 'unchanged') {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  }
}

function installGlobalContext(options, result) {
  const templateRoot = join(packageRoot, 'templates', 'global');
  ensureGlobalFile(
    join(options.globalRoot, 'RILEY.md'),
    readFileSync(join(templateRoot, 'RILEY.md'), 'utf8'),
    options,
    result,
  );
  ensureGlobalFile(
    join(options.globalRoot, 'registry.yaml'),
    readFileSync(join(templateRoot, 'registry.yaml'), 'utf8'),
    options,
    result,
  );
  registerProject(options, result);
}

function installSkill(name, options, result) {
  const source = join(packageRoot, 'skills', name);

  if (!existsSync(source)) {
    throw new Error(`Missing source skill: ${source}`);
  }

  for (const root of skillRoots) {
    installSkillCopy(source, join(options.projectRoot, root, name), options, result);
  }
}

function installSkillCopy(source, target, options, result) {
  if (!existsSync(target)) {
    record(result, 'created', options.projectRoot, target);
    if (!options.dryRun) {
      mkdirSync(dirname(target), { recursive: true });
      cpSync(source, target, { recursive: true });
    }
    return;
  }

  if (treesEqual(source, target)) {
    record(result, 'unchanged', options.projectRoot, target);
    return;
  }

  if (!options.refreshSkills) {
    throw new Error(
      `Installed skill has drifted: ${relative(options.projectRoot, target)}. ` +
        'Review it, then rerun with --refresh-skills to replace it.',
    );
  }

  record(result, 'refreshed', options.projectRoot, target);
  if (!options.dryRun) {
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
  }
}

function readText(target) {
  const text = readFileSync(target, 'utf8');
  return { text, eol: text.includes('\r\n') ? '\r\n' : '\n' };
}

// Claude Code reads CLAUDE.md, not AGENTS.md; a one-line import keeps AGENTS.md the single contract.
function linkClaudeContract(options, result) {
  const target = join(options.projectRoot, 'CLAUDE.md');
  if (existsSync(target) && !/^@AGENTS\.md\s*$/m.test(readFileSync(target, 'utf8'))) {
    record(result, 'unchanged', options.projectRoot, target);
    result.warnings.push('CLAUDE.md exists without an @AGENTS.md import; Claude Code will not load AGENTS.md.');
    return;
  }
  ensureFile(target, '@AGENTS.md\n', options, result);
}

// A whole-directory `.claude/` ignore hides .claude/skills from Git; narrow it to keep local state ignored.
function trackClaudeSkills(options, result) {
  const target = join(options.projectRoot, '.gitignore');
  if (!existsSync(target)) return;

  const { text, eol } = readText(target);
  const lines = text.split(/\r?\n/);
  if (lines.some((line) => /^!\/?\.claude\/skills\/?$/.test(line.trim()))) return;

  const index = lines.findIndex((line) => /^\/?\.claude(\/|\/\*)?$/.test(line.trim()));
  if (index === -1) return;

  const prefix = lines[index].trim().startsWith('/') ? '/' : '';
  lines.splice(index, 1, `${prefix}.claude/*`, `!${prefix}.claude/skills/`);
  record(result, 'refreshed', options.projectRoot, target);
  if (!options.dryRun) writeFileSync(target, lines.join(eol), 'utf8');
}

// Load RILEY.md in every Claude Code session, as Codex and Cursor do through their global context.
function linkClaudeGlobalContext(options, result) {
  if (!existsSync(options.claudeRoot)) return;

  const target = join(options.claudeRoot, 'CLAUDE.md');
  const riley = join(options.globalRoot, 'RILEY.md');
  const home = homedir();
  const importPath = riley.startsWith(home)
    ? `~/${relative(home, riley).replaceAll('\\', '/')}`
    : riley.replaceAll('\\', '/');
  const importLine = `@${importPath}`;

  if (!existsSync(target)) {
    result.global.created.push(target);
    if (!options.dryRun) writeFileSync(target, `${importLine}\n`, 'utf8');
    return;
  }

  const { text, eol } = readText(target);
  if (text.split(/\r?\n/).some((line) => line.trim() === importLine)) {
    result.global.unchanged.push(target);
    return;
  }

  result.global.refreshed.push(target);
  if (!options.dryRun) {
    const separator = text.endsWith('\n') ? eol : `${eol}${eol}`;
    writeFileSync(
      target,
      `${text}${separator}## AI Dev System${eol}${eol}${importLine}${eol}`,
      'utf8',
    );
  }
}

function profileSkills(options) {
  return options.profile === 'makerkit' ? ['makerkit'] : [];
}

function renderAccessConfig(options) {
  const template = options.profile
    ? join(packageRoot, 'templates', 'profiles', options.profile, 'access.yaml')
    : join(packageRoot, 'templates', 'access.yaml');
  return readFileSync(template, 'utf8').replace('"project-name"', yamlString(options.name));
}

function scaffoldProject(options, result) {
  const configTarget = join(options.projectRoot, '.ai-dev', 'project.yaml');
  const configExists = existsSync(configTarget);

  if (configExists) {
    record(result, 'unchanged', options.projectRoot, configTarget);
  } else {
    ensureFile(configTarget, renderProjectConfig(options), options, result);

    const projectTemplate = readFileSync(join(packageRoot, 'templates', 'PROJECT.md'), 'utf8').replace(
      '# Project Name',
      `# ${options.name}`,
    );
    const roadmapTemplate = readFileSync(join(packageRoot, 'templates', 'ROADMAP.md'), 'utf8').replace(
      '# Project Roadmap',
      `# ${options.name} Roadmap`,
    );

    ensureFile(
      join(options.projectRoot, 'documentation', 'PROJECT.md'),
      projectTemplate,
      options,
      result,
    );
    ensureFile(
      join(options.projectRoot, 'documentation', 'ROADMAP.md'),
      roadmapTemplate,
      options,
      result,
    );

    for (const directory of [
      'documentation/chapters',
      'documentation/decisions',
      'documentation/lessons',
      'documentation/archive/roadmap',
    ]) {
      ensureDirectory(join(options.projectRoot, directory), options, result);
    }
  }

  ensureFile(
    join(options.projectRoot, '.ai-dev', 'access.yaml'),
    renderAccessConfig(options),
    options,
    result,
  );

  if (options.profile === 'makerkit') {
    const platformGuide = readFileSync(
      join(packageRoot, 'templates', 'profiles', 'makerkit', 'PLATFORM.md'),
      'utf8',
    ).replaceAll('Project Name', options.name);
    ensureFile(
      join(options.projectRoot, 'documentation', 'chapters', 'makerkit-platform.md'),
      platformGuide,
      options,
      result,
    );
  }

  const agentsTemplate = readFileSync(join(packageRoot, 'templates', 'AGENTS.md'), 'utf8').replace(
    '# Project Name',
    `# ${options.name}`,
  );
  ensureFile(join(options.projectRoot, 'AGENTS.md'), agentsTemplate, options, result);
  linkClaudeContract(options, result);
  trackClaudeSkills(options, result);
}

export function installProject(inputOptions) {
  const options = { ...inputOptions };
  validateOptions(options);

  const result = {
    projectRoot: options.projectRoot,
    globalRoot: options.globalRoot,
    created: [],
    refreshed: [],
    unchanged: [],
    global: {
      created: [],
      refreshed: [],
      unchanged: [],
    },
    warnings: [],
  };

  installGlobalContext(options, result);
  linkClaudeGlobalContext(options, result);
  scaffoldProject(options, result);
  for (const skillName of [...skillNames, ...profileSkills(options)]) {
    installSkill(skillName, options, result);
  }

  return result;
}

function printResult(result, dryRun) {
  console.log(`${dryRun ? 'Dry run for' : 'Installed AI Dev System in'} ${result.projectRoot}`);
  for (const [label, entries] of [
    ['create', result.created],
    ['refresh', result.refreshed],
    ['keep', result.unchanged],
  ]) {
    for (const entry of entries) console.log(`  ${label.padEnd(7)} ${entry}`);
  }

  console.log(`${dryRun ? 'Global context dry run for' : 'Riley-global context in'} ${result.globalRoot}`);
  for (const [label, entries] of [
    ['create', result.global.created],
    ['refresh', result.global.refreshed],
    ['keep', result.global.unchanged],
  ]) {
    for (const entry of entries) console.log(`  ${label.padEnd(7)} ${entry}`);
  }

  for (const warning of result.warnings) console.warn(`  warning ${warning}`);

  console.log('Next: run kickoff (/kickoff in Cursor or Claude Code, $kickoff in Codex) for a new or');
  console.log('undocumented product, or start when the project already has trustworthy documentation.');
  console.log('The kickoff skill is interactive and writes documentation/; it does not create a presentation.');
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }

    validateOptions(options);
    const result = installProject(options);
    printResult(result, options.dryRun);
  } catch (error) {
    console.error(`Installation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === installerPath) main();
