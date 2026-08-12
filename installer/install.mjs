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
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const installerPath = fileURLToPath(import.meta.url);
const packageRoot = resolve(dirname(installerPath), '..');
const skillNames = ['kickoff', 'start', 'update-docs', 'finish'];

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
  --integration <value>       direct | pull-request
  --deployment <value>        none | automatic | manual
  --refresh-skills            Replace drifted installed skill copies
  --dry-run                   Report actions without writing
  --help                      Show this help

The installer never overwrites .ai-dev/project.yaml or canonical project
documentation. It only replaces installed skills when --refresh-skills is set.`;
}

function parseArgs(argv) {
  const options = {
    projectRoot: process.cwd(),
    stage: 'prototype',
    deliveryMode: 'commit',
    mainBranch: 'main',
    integration: 'direct',
    deployment: 'none',
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
    ['--integration', 'integration'],
    ['--deployment', 'deployment'],
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

function validateOptions(options) {
  options.projectRoot = resolve(options.projectRoot);
  options.name ||= basename(options.projectRoot);

  if (!existsSync(options.projectRoot) || !statSync(options.projectRoot).isDirectory()) {
    throw new Error(`Project root is not a directory: ${options.projectRoot}`);
  }

  assertOption(options.stage, allowed.stage, '--stage');
  assertOption(options.deliveryMode, allowed.deliveryMode, '--delivery-mode');
  assertOption(options.integration, allowed.integration, '--integration');
  assertOption(options.deployment, allowed.deployment, '--deployment');

  const projectConfig = join(options.projectRoot, '.ai-dev', 'project.yaml');
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
  integration: ${options.integration}
  deployment: ${options.deployment}
  branch_prefix: codex/

verification:
  focused: []
  required: []
  deployment: []

services: {}

integrations:
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

function installSkill(name, options, result) {
  const source = join(packageRoot, 'skills', name);
  const target = join(options.projectRoot, '.agents', 'skills', name);

  if (!existsSync(source)) {
    throw new Error(`Missing source skill: ${source}`);
  }

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

function scaffoldProject(options, result) {
  const configTarget = join(options.projectRoot, '.ai-dev', 'project.yaml');
  const configExists = existsSync(configTarget);

  if (configExists) {
    record(result, 'unchanged', options.projectRoot, configTarget);
    return;
  }

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

export function installProject(inputOptions) {
  const options = { ...inputOptions };
  validateOptions(options);

  const result = {
    projectRoot: options.projectRoot,
    created: [],
    refreshed: [],
    unchanged: [],
  };

  scaffoldProject(options, result);
  for (const skillName of skillNames) installSkill(skillName, options, result);

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
