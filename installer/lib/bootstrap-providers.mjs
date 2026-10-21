import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { readAccessManifest, readRegistry } from '../../skills/access/scripts/access.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const accessScript = join(packageRoot, 'skills', 'access', 'scripts', 'access.mjs');

export function approveProjectConsumers(registry, projectName, credentialAliases) {
  const updated = structuredClone(registry);
  for (const alias of credentialAliases) {
    const credential = updated.credentials?.[alias];
    if (!credential) continue;
    if (!Array.isArray(credential.consumers)) credential.consumers = [];
    if (!credential.consumers.includes(projectName)) credential.consumers.push(projectName);
  }
  return updated;
}

export function credentialAliasesFromManifest(projectRoot) {
  const manifest = readAccessManifest(projectRoot);
  const aliases = new Set();
  for (const request of Object.values(manifest.requests || {})) {
    if (request?.credential) aliases.add(request.credential);
  }
  return { projectName: manifest.project, aliases: [...aliases] };
}

export function writeRegistry(globalRoot, registry) {
  const target = join(resolve(globalRoot), 'registry.yaml');
  writeFileSync(target, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  return target;
}

function runStep({ command, args, cwd, dryRun, label }) {
  if (dryRun) {
    return { step: label, status: 'planned', detail: `${command} ${args.join(' ')}` };
  }
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  if (result.status !== 0) {
    return { step: label, status: 'failed', detail: `exit ${result.status ?? 'unknown'}` };
  }
  return { step: label, status: 'done', detail: 'ok' };
}

function hasGitRemote(projectRoot) {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function vercelLinked(webRoot) {
  return existsSync(join(webRoot, '.vercel', 'project.json'));
}

function runAccessDoctor(projectRoot, globalRoot, { json = false } = {}) {
  const args = [accessScript, 'doctor', '--project', projectRoot, '--global-root', globalRoot];
  if (json) args.push('--json');
  const result = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    cwd: projectRoot,
  });
  return {
    status: result.status === 0 ? 'ready' : 'needs-attention',
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function tryInstallSecrets(projectRoot, globalRoot, dryRun) {
  const steps = [];
  const pairs = [
    { from: 'sentry', to: 'vercel' },
    { from: 'posthog', to: 'vercel' },
    { from: 'resend', to: 'vercel' },
  ];
  const environments = ['development', 'preview', 'production'];

  for (const { from, to } of pairs) {
    const label = `secrets:${from}->${to}`;
    if (dryRun) {
      steps.push({ step: label, status: 'planned', detail: 'when doctor reports ready' });
      continue;
    }
    const args = [
      accessScript,
      'install',
      from,
      '--to',
      to,
      '--project',
      projectRoot,
      '--global-root',
      globalRoot,
      ...environments.flatMap((environment) => ['--environment', environment]),
    ];
    const result = spawnSync(process.execPath, args, { encoding: 'utf8', cwd: projectRoot });
    if (result.status === 0) {
      steps.push({ step: label, status: 'done', detail: 'installed' });
    } else {
      steps.push({
        step: label,
        status: 'skipped',
        detail: (result.stderr || result.stdout || 'not ready').trim().split('\n')[0],
      });
    }
  }
  return steps;
}

export function provisionMakerkit(options) {
  const projectRoot = resolve(options.projectRoot);
  const globalRoot = resolve(options.globalRoot || join(homedir(), '.ai-dev-system'));
  const dryRun = Boolean(options.dryRun);
  const steps = [];
  const webRoot = join(projectRoot, 'apps', 'web');

  if (!existsSync(webRoot)) {
    throw new Error(`Makerkit web app not found at ${webRoot}`);
  }

  const { projectName, aliases } = credentialAliasesFromManifest(projectRoot);
  if (options.approveRegistry !== false) {
    const registry = readRegistry(globalRoot);
    const updated = approveProjectConsumers(registry, projectName, aliases);
    if (dryRun) {
      steps.push({
        step: 'registry:consumers',
        status: 'planned',
        detail: `approve ${projectName} for ${aliases.join(', ')}`,
      });
    } else {
      writeRegistry(globalRoot, updated);
      steps.push({ step: 'registry:consumers', status: 'done', detail: aliases.join(', ') });
    }
  }

  if (dryRun) {
    steps.push({ step: 'access:doctor', status: 'planned', detail: 'inspect declared routes' });
  } else {
    const doctor = runAccessDoctor(projectRoot, globalRoot);
    steps.push({
      step: 'access:doctor',
      status: doctor.status === 'ready' ? 'done' : 'needs-attention',
      detail: doctor.status,
    });
  }

  if (options.githubRepo) {
    if (hasGitRemote(projectRoot) && !options.forceGithub) {
      steps.push({ step: 'github', status: 'skipped', detail: 'origin remote already configured' });
    } else {
      steps.push(
        runStep({
          command: 'gh',
          args: [
            'repo',
            'create',
            options.githubRepo,
            '--private',
            '--source',
            '.',
            '--remote',
            'origin',
            '--push',
          ],
          cwd: projectRoot,
          dryRun,
          label: 'github',
        }),
      );
    }
  }

  if (options.vercelProject) {
    if (vercelLinked(webRoot) && !options.forceVercel) {
      steps.push({ step: 'vercel:link', status: 'skipped', detail: 'apps/web already linked' });
    } else {
      const args = ['link', '--yes', '--project', options.vercelProject];
      if (options.vercelScope) args.push('--scope', options.vercelScope);
      steps.push(
        runStep({
          command: 'vercel',
          args,
          cwd: webRoot,
          dryRun,
          label: 'vercel:link',
        }),
      );
    }
  }

  if (options.supabaseRef) {
    steps.push(
      runStep({
        command: 'supabase',
        args: ['link', '--project-ref', options.supabaseRef],
        cwd: webRoot,
        dryRun,
        label: 'supabase:link',
      }),
    );
  } else if (options.supabaseName && options.supabaseOrgId) {
    const args = [
      'projects',
      'create',
      options.supabaseName,
      '--org-id',
      options.supabaseOrgId,
      '--region',
      options.supabaseRegion || 'us-east-1',
    ];
    if (process.env.SUPABASE_DB_PASSWORD) {
      args.push('--db-password', process.env.SUPABASE_DB_PASSWORD);
    }
    steps.push(
      runStep({
        command: 'supabase',
        args,
        cwd: webRoot,
        dryRun,
        label: 'supabase:create',
      }),
    );
  }

  if (options.installSecrets) {
    steps.push(...tryInstallSecrets(projectRoot, globalRoot, dryRun));
  }

  if (!dryRun && options.supabaseRef) {
    steps.push(
      runStep({
        command: 'supabase',
        args: ['db', 'push'],
        cwd: webRoot,
        dryRun: false,
        label: 'supabase:db-push',
      }),
    );
  }

  const failed = steps.some((step) => step.status === 'failed');
  const needsAttention = steps.some((step) => step.status === 'needs-attention');
  return {
    steps,
    exitCode: failed ? 1 : needsAttention ? 2 : 0,
  };
}

export function printProvisionReport(report) {
  for (const step of report.steps) {
    console.log(`  ${step.status.padEnd(16)} ${step.step} — ${step.detail}`);
  }
}
