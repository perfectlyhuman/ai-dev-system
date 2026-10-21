#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { installProject } from './install.mjs';
import { printProvisionReport, provisionMakerkit } from './lib/bootstrap-providers.mjs';

function usage() {
  return `Bootstrap a new Makerkit project with AI Dev System

Usage:
  node installer/bootstrap-makerkit.mjs --project <dir> --description <text> --entity <alias> [options]

Core:
  --project <path>         Target directory (clone target when empty)
  --name <name>            Project name (default: directory name)
  --description <text>     Required for new project.yaml
  --entity <alias>         Required for new project.yaml
  --template <git-url>     Clone when project directory is missing or empty

Provisioning (--provision):
  --github-repo <owner/name>   Create and push GitHub repository
  --vercel-project <name>      Link Vercel project at apps/web
  --vercel-scope <team>        Optional Vercel team scope
  --supabase-ref <ref>         Link existing Supabase project and run db push
  --supabase-name <name>       Create Supabase project (requires --supabase-org-id)
  --supabase-org-id <id>       Supabase organization id for create
  --supabase-region <region>   Default us-east-1
  --install-secrets            Try Bitwarden -> Vercel installs for declared observability routes
  --global-root <path>         Default ~/.ai-dev-system

Other:
  --stage <value>            prototype | design-partner | live (default: prototype)
  --delivery-mode <value>    commit | push | ship (default: ship)
  --dry-run                  Print planned actions only
  --help                     Show this help

Set SUPABASE_DB_PASSWORD in the environment when using --supabase-name.`;
}

function parseArgs(argv) {
  const options = {
    projectRoot: process.cwd(),
    globalRoot: join(homedir(), '.ai-dev-system'),
    stage: 'prototype',
    deliveryMode: 'ship',
    mainBranch: 'main',
    integration: 'direct',
    deployment: 'manual',
    profile: 'makerkit',
    refreshSkills: false,
    provision: false,
    installSecrets: false,
    dryRun: false,
  };

  const flags = new Map([
    ['--project', 'projectRoot'],
    ['--name', 'name'],
    ['--description', 'description'],
    ['--entity', 'entity'],
    ['--template', 'template'],
    ['--stage', 'stage'],
    ['--delivery-mode', 'deliveryMode'],
    ['--github-repo', 'githubRepo'],
    ['--vercel-project', 'vercelProject'],
    ['--vercel-scope', 'vercelScope'],
    ['--supabase-ref', 'supabaseRef'],
    ['--supabase-name', 'supabaseName'],
    ['--supabase-org-id', 'supabaseOrgId'],
    ['--supabase-region', 'supabaseRegion'],
    ['--global-root', 'globalRoot'],
  ]);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (arg === '--provision') {
      options.provision = true;
      continue;
    }
    if (arg === '--install-secrets') {
      options.installSecrets = true;
      continue;
    }
    const key = flags.get(arg);
    if (!key) throw new Error(`Unknown option: ${arg}`);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
    options[key] = value;
    i += 1;
  }

  options.projectRoot = resolve(options.projectRoot);
  options.name ||= basename(options.projectRoot);
  return options;
}

function needsClone(projectRoot) {
  if (!existsSync(projectRoot)) return true;
  if (!statSync(projectRoot).isDirectory()) {
    throw new Error(`--project is not a directory: ${projectRoot}`);
  }
  return readdirSync(projectRoot).length === 0;
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(usage());
      return;
    }

    if (!options.description || !options.entity) {
      throw new Error('--description and --entity are required');
    }

    if (needsClone(options.projectRoot) && !options.template) {
      throw new Error('--template is required when the project directory is missing or empty');
    }

    if (needsClone(options.projectRoot)) {
      if (options.dryRun) {
        console.log(`Would clone ${options.template} into ${options.projectRoot}`);
      } else {
        mkdirSync(options.projectRoot, { recursive: true });
        const clone = spawnSync('git', ['clone', options.template, options.projectRoot], {
          stdio: 'inherit',
        });
        if (clone.status !== 0) throw new Error('git clone failed');
      }
    }

    if (options.dryRun) {
      console.log(`Would install AI Dev System (makerkit profile) in ${options.projectRoot}`);
    } else {
      installProject(options);
      console.log(`Installed AI Dev System in ${options.projectRoot}`);
    }

    const shouldProvision =
      options.provision ||
      options.githubRepo ||
      options.vercelProject ||
      options.supabaseRef ||
      (options.supabaseName && options.supabaseOrgId);

    if (!shouldProvision) {
      console.log('Next: add --provision with --github-repo / --vercel-project / --supabase-ref (see docs/makerkit-bootstrap.md)');
      return;
    }

    console.log('Provisioning providers:');
    const report = provisionMakerkit({
      projectRoot: options.projectRoot,
      globalRoot: options.globalRoot,
      dryRun: options.dryRun,
      githubRepo: options.githubRepo,
      vercelProject: options.vercelProject,
      vercelScope: options.vercelScope,
      supabaseRef: options.supabaseRef,
      supabaseName: options.supabaseName,
      supabaseOrgId: options.supabaseOrgId,
      supabaseRegion: options.supabaseRegion,
      installSecrets: options.installSecrets,
    });
    printProvisionReport(report);
    if (report.exitCode) process.exitCode = report.exitCode;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

const entry = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === entry) main();
