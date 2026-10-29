#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const defaultGlobalRoot = join(homedir(), '.ai-dev-system');
const vercelEnvironments = new Set(['development', 'preview', 'production']);

const cliChecks = {
  github: { command: 'gh', args: ['auth', 'status'] },
  vercel: { command: 'vercel', args: ['whoami'] },
  supabase: { command: 'supabase', args: ['projects', 'list', '--output', 'json'] },
  cloudflare: { command: 'wrangler', args: ['whoami'] },
  sentry: { command: 'sentry-cli', args: ['info'] },
};

function usage() {
  return `AI Dev System access broker

Usage:
  node .agents/skills/access/scripts/access.mjs doctor [options]
  node .agents/skills/access/scripts/access.mjs store-token <machine-account> [options]
  node .agents/skills/access/scripts/access.mjs install <request> --to <request> --environment <name> [options]

Commands:
  doctor       Check declared access without returning credential or provider output
  store-token  Prompt locally for a Bitwarden machine token and protect it with Windows DPAPI
  install      Copy one declared Bitwarden secret directly into a declared Vercel project

Options:
  --project <path>       Project root (default: current directory)
  --global-root <path>   Machine context root (default: ~/.ai-dev-system)
  --provider <name>      Check only one declared provider (doctor only)
  --to <request>         Declared Vercel destination request (install only)
  --environment <name>  development, preview, or production; repeatable (install only)
  --json                 Emit machine-readable doctor status
  --help                 Show this help

There is intentionally no arbitrary command runner and no command that prints a secret.`;
}

function parseArgs(argv) {
  const options = {
    command: argv[0],
    projectRoot: process.cwd(),
    globalRoot: defaultGlobalRoot,
    environments: [],
    json: false,
  };
  if (options.command === '--help' || options.command === '-h') return { ...options, help: true };
  let index = 1;

  if (options.command === 'install' || options.command === 'store-token') {
    options.name = argv[1];
    if (!options.name || options.name.startsWith('--')) {
      throw new Error(`${options.command} requires a name`);
    }
    index = 2;
  }

  for (; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }
    if (argument === '--json') {
      if (options.command !== 'doctor') throw new Error('--json is only available for doctor');
      options.json = true;
      continue;
    }
    if (
      argument === '--project' ||
      argument === '--global-root' ||
      argument === '--provider' ||
      argument === '--to' ||
      argument === '--environment'
    ) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      if (argument === '--project') options.projectRoot = value;
      else if (argument === '--global-root') options.globalRoot = value;
      else if (argument === '--provider') {
        if (options.command !== 'doctor') throw new Error('--provider is only available for doctor');
        options.provider = value;
      } else if (argument === '--to') {
        if (options.command !== 'install') throw new Error('--to is only available for install');
        options.destinationName = value;
      } else {
        if (options.command !== 'install') {
          throw new Error('--environment is only available for install');
        }
        options.environments.push(value);
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }

  return options;
}

function readJsonCompatible(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    throw new Error(`${path} must remain JSON-compatible YAML so the access broker can read it.`);
  }
}

export function readAccessManifest(projectRoot) {
  const manifestPath = join(resolve(projectRoot), '.ai-dev', 'access.yaml');
  if (!existsSync(manifestPath)) throw new Error(`Missing access manifest: ${manifestPath}`);
  const manifest = readJsonCompatible(manifestPath, 'access manifest');
  if (
    manifest?.schema_version !== 1 ||
    typeof manifest.project !== 'string' ||
    !manifest.project ||
    !manifest.requests ||
    typeof manifest.requests !== 'object' ||
    Array.isArray(manifest.requests)
  ) {
    throw new Error(`${manifestPath} does not match access schema version 1.`);
  }
  return manifest;
}

export function readRegistry(globalRoot = defaultGlobalRoot) {
  const registryPath = join(resolve(globalRoot), 'registry.yaml');
  if (!existsSync(registryPath)) throw new Error(`Missing account registry: ${registryPath}`);
  const registry = readJsonCompatible(registryPath, 'account registry');
  if (
    registry?.schema_version !== 1 ||
    !registry.accounts ||
    !registry.organizations ||
    !registry.services ||
    !registry.credentials ||
    !registry.credential_providers
  ) {
    throw new Error(`${registryPath} does not match registry schema version 1.`);
  }
  return registry;
}

function spawnPortable(command, args, options) {
  if (process.platform !== 'win32') {
    const result = spawnSync(command, args, options);
    return { found: result.error?.code !== 'ENOENT', result };
  }

  const lookup = spawnSync('where.exe', [command], {
    encoding: 'utf8',
    timeout: 5_000,
    windowsHide: true,
  });
  if (lookup.status !== 0) return { found: false };

  const candidates = lookup.stdout.split(/\r?\n/).filter(Boolean);
  const executable =
    candidates.find((candidate) => candidate.toLowerCase().endsWith('.exe')) ||
    candidates.find((candidate) => /\.(cmd|bat|ps1)$/i.test(candidate)) ||
    candidates[0];

  if (!/\.(cmd|bat|ps1)$/i.test(executable)) {
    return { found: true, result: spawnSync(executable, args, options) };
  }

  const payload = Buffer.from(JSON.stringify({ command: executable, arguments: args })).toString(
    'base64',
  );
  const environment = { ...(options.env || process.env), AI_DEV_EXECUTION: payload };
  const script =
    '$spec = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:AI_DEV_EXECUTION)) | ConvertFrom-Json; ' +
    '$env:AI_DEV_EXECUTION = $null; & $spec.command @($spec.arguments); exit $LASTEXITCODE';
  return {
    found: true,
    result: spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      ...options,
      env: environment,
    }),
  };
}

function defaultRunner(command, args, environment = process.env) {
  const { found, result } = spawnPortable(command, args, {
    encoding: 'utf8',
    env: environment,
    timeout: 20_000,
    windowsHide: true,
  });
  if (!found || result.error?.code === 'ENOENT' || result.status === 127 || result.status === 9009) {
    return { found: false, ok: false };
  }
  return { found: true, ok: !result.error && result.status === 0 };
}

function defaultSecretResolver(secretId, accessToken) {
  const { found, result } = spawnPortable('bws', ['secret', 'get', secretId, '--output', 'json'], {
    encoding: 'utf8',
    env: { ...process.env, BWS_ACCESS_TOKEN: accessToken },
    timeout: 20_000,
    windowsHide: true,
  });
  if (!found) throw new Error('bws is not installed.');
  if (result.error || result.status !== 0) {
    throw new Error('Bitwarden could not resolve the declared secret.');
  }

  let secret;
  try {
    secret = JSON.parse(result.stdout);
  } catch {
    throw new Error('Bitwarden returned an unreadable secret response.');
  }
  if (typeof secret?.value !== 'string' || typeof secret?.projectId !== 'string') {
    throw new Error('Bitwarden returned an incomplete secret response.');
  }
  return secret;
}

function resolveMachineAccount(registry, alias, globalRoot) {
  const machineAccount = registry.credential_providers?.bitwarden?.machine_accounts?.[alias];
  if (!machineAccount) throw new Error(`Bitwarden machine account is not registered: ${alias}`);
  if (typeof machineAccount.token_file !== 'string' || !machineAccount.token_file) {
    throw new Error(`Bitwarden machine account has no protected token file: ${alias}`);
  }
  const tokenFile = isAbsolute(machineAccount.token_file)
    ? machineAccount.token_file
    : resolve(globalRoot, machineAccount.token_file);
  return { machineAccount, tokenFile };
}

function defaultMachineTokenResolver(alias, registry, globalRoot) {
  if (process.platform !== 'win32') {
    throw new Error('Protected Bitwarden token resolution is currently configured for Windows.');
  }
  const { tokenFile } = resolveMachineAccount(registry, alias, globalRoot);
  if (!existsSync(tokenFile)) throw new Error(`Protected Bitwarden token is not stored: ${alias}`);

  const script =
    'Add-Type -AssemblyName System.Security; ' +
    '$tokenFile = $env:AI_DEV_TOKEN_FILE; $env:AI_DEV_TOKEN_FILE = $null; ' +
    '$cipher = [IO.File]::ReadAllBytes($tokenFile); ' +
    '$plain = [Security.Cryptography.ProtectedData]::Unprotect($cipher, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser); ' +
    '[Console]::Out.Write([Text.Encoding]::UTF8.GetString($plain)); ' +
    '[Array]::Clear($plain, 0, $plain.Length)';
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    env: { ...process.env, AI_DEV_TOKEN_FILE: tokenFile },
    timeout: 10_000,
    windowsHide: true,
  });
  if (result.error || result.status !== 0 || !result.stdout) {
    throw new Error(`Protected Bitwarden token could not be read: ${alias}`);
  }
  return result.stdout;
}

export function storeMachineToken({ alias, globalRoot = defaultGlobalRoot, registry }) {
  const effectiveRegistry = registry || readRegistry(globalRoot);
  if (process.platform !== 'win32') {
    throw new Error('Protected Bitwarden token storage is currently configured for Windows.');
  }
  const { tokenFile } = resolveMachineAccount(effectiveRegistry, alias, globalRoot);
  const script =
    'Add-Type -AssemblyName System.Security; ' +
    '$tokenFile = $env:AI_DEV_TOKEN_FILE; $env:AI_DEV_TOKEN_FILE = $null; ' +
    '$secret = Read-Host "Paste the Bitwarden machine-account access token" -AsSecureString; ' +
    '$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret); ' +
    'try { ' +
    '$value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer); ' +
    '$plain = [Text.Encoding]::UTF8.GetBytes($value); ' +
    '$cipher = [Security.Cryptography.ProtectedData]::Protect($plain, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser); ' +
    '[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($tokenFile)) | Out-Null; ' +
    '[IO.File]::WriteAllBytes($tokenFile, $cipher); ' +
    '[Array]::Clear($plain, 0, $plain.Length) ' +
    '} finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }';
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', script], {
    env: { ...process.env, AI_DEV_TOKEN_FILE: tokenFile },
    stdio: 'inherit',
    windowsHide: false,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Bitwarden machine token was not stored: ${alias}`);
  }
  console.log(`Stored protected Bitwarden machine credential: ${alias}`);
}

function invalidResult(name, provider, detail) {
  return { name, provider: provider || 'unknown', status: 'invalid', detail };
}

function resolveRequest(name, manifest, registry) {
  const request = manifest.requests[name];
  if (!request || typeof request !== 'object') {
    throw new Error(`Access request is not declared: ${name}`);
  }
  if (typeof request.credential !== 'string' || !request.credential) {
    throw new Error(`Access request has no credential alias: ${name}`);
  }
  const credential = registry.credentials[request.credential];
  if (!credential) throw new Error(`Credential alias is not registered: ${request.credential}`);
  return { request, credential };
}

function registeredIdentityExists(credential, registry) {
  return Boolean(
    registry.accounts[credential.provider]?.[credential.account] ||
      registry.organizations[credential.provider]?.[credential.account],
  );
}

function resolveBitwardenRoute(credential, registry) {
  const source = credential.source;
  if (source?.kind !== 'bitwarden') throw new Error('Credential is not backed by Bitwarden.');
  const bitwarden = registry.credential_providers?.bitwarden;
  const project = bitwarden?.projects?.[source.project];
  const machineAlias = bitwarden?.defaults?.machine_account;
  const machineAccount = bitwarden?.machine_accounts?.[machineAlias];
  if (!project?.id) throw new Error(`Bitwarden project is not ready: ${source.project}`);
  if (!machineAlias || !machineAccount) {
    throw new Error('The default Bitwarden machine account is not configured.');
  }
  if (!source.secret_id) throw new Error('The Bitwarden secret reference is not configured.');
  return { source, projectId: project.id, machineAlias };
}

function inspectCli(name, credential, runner) {
  const check = cliChecks[credential.provider];
  if (!check) {
    return invalidResult(
      name,
      credential.provider,
      `No first-party CLI check is defined for ${credential.provider}.`,
    );
  }
  const result = runner(check.command, check.args);
  if (!result.found) {
    return { name, provider: credential.provider, status: 'missing', detail: `${check.command} is not installed.` };
  }
  if (!result.ok) {
    return {
      name,
      provider: credential.provider,
      status: 'blocked',
      detail: `${check.command} is installed but its authentication check failed.`,
    };
  }
  return {
    name,
    provider: credential.provider,
    status: 'ready',
    detail: `${check.command} authentication is ready.`,
  };
}

function inspectBitwarden(name, credential, runner, registry, globalRoot, machineTokenResolver) {
  let route;
  try {
    route = resolveBitwardenRoute(credential, registry);
  } catch (error) {
    return {
      name,
      provider: credential.provider,
      status: 'planned',
      detail: error.message,
    };
  }

  let accessToken;
  try {
    accessToken = machineTokenResolver(route.machineAlias, registry, globalRoot);
  } catch {
    return {
      name,
      provider: credential.provider,
      status: 'blocked',
      detail: `Protected Bitwarden machine credential is unavailable: ${route.machineAlias}`,
    };
  }

  const environment = { ...process.env, BWS_ACCESS_TOKEN: accessToken };
  const project = runner('bws', ['project', 'get', route.projectId, '--output', 'none'], environment);
  if (!project.found) {
    return { name, provider: credential.provider, status: 'missing', detail: 'bws is not installed.' };
  }
  if (!project.ok) {
    return {
      name,
      provider: credential.provider,
      status: 'blocked',
      detail: 'The declared Bitwarden project is not accessible.',
    };
  }
  const secret = runner('bws', ['secret', 'get', route.source.secret_id, '--output', 'none'], environment);
  if (!secret.ok) {
    return {
      name,
      provider: credential.provider,
      status: 'blocked',
      detail: 'The declared Bitwarden secret is not accessible.',
    };
  }
  return {
    name,
    provider: credential.provider,
    status: 'ready',
    detail: 'The declared Bitwarden secret is accessible to the local broker.',
  };
}

export function inspectAccess({
  projectRoot,
  globalRoot = defaultGlobalRoot,
  provider,
  runner = defaultRunner,
  registry,
  machineTokenResolver = defaultMachineTokenResolver,
}) {
  const manifest = readAccessManifest(projectRoot);
  const effectiveRegistry = registry || readRegistry(globalRoot);
  const results = [];

  for (const [name, request] of Object.entries(manifest.requests)) {
    if (!request || typeof request !== 'object') {
      results.push(invalidResult(name, null, 'Request must be an object.'));
      continue;
    }
    const credential = effectiveRegistry.credentials[request.credential];
    const requestProvider = credential?.provider;
    if (provider && requestProvider !== provider) continue;
    if (!credential) {
      results.push(invalidResult(name, null, `Credential alias is not registered: ${request.credential}`));
      continue;
    }
    if (!registeredIdentityExists(credential, effectiveRegistry)) {
      results.push(
        invalidResult(
          name,
          credential.provider,
          `Account alias is not registered: ${credential.account}`,
        ),
      );
      continue;
    }
    if (!Array.isArray(request.capabilities) || request.capabilities.length === 0) {
      results.push(invalidResult(name, credential.provider, 'Request must declare capabilities.'));
      continue;
    }
    if (!credential.consumers?.includes(manifest.project)) {
      results.push(
        invalidResult(name, credential.provider, `Credential is not approved for ${manifest.project}.`),
      );
      continue;
    }
    if (credential.status === 'disabled') {
      results.push({
        name,
        provider: credential.provider,
        status: 'blocked',
        detail: 'Credential is disabled.',
      });
      continue;
    }
    if (credential.source?.kind === 'cli') {
      results.push(inspectCli(name, credential, runner));
    } else if (credential.source?.kind === 'bitwarden') {
      results.push(
        inspectBitwarden(
          name,
          credential,
          runner,
          effectiveRegistry,
          globalRoot,
          machineTokenResolver,
        ),
      );
    } else {
      results.push(invalidResult(name, credential.provider, 'Credential source is unsupported.'));
    }
  }

  return {
    schema_version: 1,
    project: manifest.project,
    provider: provider || null,
    status: results.every((result) => result.status === 'ready') ? 'ready' : 'needs-attention',
    results,
  };
}

function defaultVercelInstaller({ environmentName, targetEnvironment, value, projectRoot }) {
  const { found, result } = spawnPortable(
    'vercel',
    [
      'env',
      'add',
      environmentName,
      targetEnvironment,
      '--force',
      '--sensitive',
      '--cwd',
      projectRoot,
    ],
    {
      encoding: 'utf8',
      env: process.env,
      input: value,
      timeout: 30_000,
      windowsHide: true,
    },
  );
  if (!found) throw new Error('vercel is not installed.');
  if (result.error || result.status !== 0) {
    throw new Error('Vercel rejected the environment-variable installation.');
  }
}

export function installSecret({
  projectRoot,
  globalRoot = defaultGlobalRoot,
  requestName,
  destinationName,
  environments,
  registry,
  machineTokenResolver = defaultMachineTokenResolver,
  secretResolver = defaultSecretResolver,
  vercelInstaller = defaultVercelInstaller,
}) {
  const manifest = readAccessManifest(projectRoot);
  const effectiveRegistry = registry || readRegistry(globalRoot);
  const { credential } = resolveRequest(requestName, manifest, effectiveRegistry);
  const { request: destination, credential: destinationCredential } = resolveRequest(
    destinationName,
    manifest,
    effectiveRegistry,
  );

  if (!credential.consumers?.includes(manifest.project)) {
    throw new Error(`Credential is not approved for ${manifest.project}: ${requestName}`);
  }
  if (destinationCredential.provider !== 'vercel' || destinationCredential.source?.kind !== 'cli') {
    throw new Error('The install destination must use a declared Vercel CLI credential.');
  }
  if (!destination.capabilities?.includes('environment:write')) {
    throw new Error(`Destination request does not allow environment writes: ${destinationName}`);
  }
  if (!Array.isArray(environments) || environments.length === 0) {
    throw new Error('Install requires at least one --environment.');
  }
  for (const environment of environments) {
    if (!vercelEnvironments.has(environment)) {
      throw new Error(`Unsupported Vercel environment: ${environment}`);
    }
  }

  const route = resolveBitwardenRoute(credential, effectiveRegistry);
  const accessToken = machineTokenResolver(route.machineAlias, effectiveRegistry, globalRoot);
  const secret = secretResolver(route.source.secret_id, accessToken);
  if (secret.projectId !== route.projectId) {
    throw new Error('The declared secret does not belong to the registered Bitwarden project.');
  }

  for (const targetEnvironment of [...new Set(environments)]) {
    vercelInstaller({
      environmentName: route.source.environment,
      targetEnvironment,
      value: secret.value,
      projectRoot: resolve(projectRoot),
    });
  }

  return {
    request: requestName,
    destination: destinationName,
    environments: [...new Set(environments)],
  };
}

function printHuman(report) {
  console.log(`Access for ${report.project}`);
  if (report.results.length === 0) {
    console.log(report.provider ? `  no declared ${report.provider} request` : '  no requests declared');
    return;
  }
  for (const result of report.results) {
    console.log(`  ${result.status.padEnd(15)} ${result.name} (${result.provider}) - ${result.detail}`);
  }
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help || !options.command) {
      console.log(usage());
      return;
    }
    if (options.command === 'store-token') {
      storeMachineToken({ alias: options.name, globalRoot: resolve(options.globalRoot) });
      return;
    }
    if (options.command === 'install') {
      if (!options.destinationName) throw new Error('install requires --to <request>');
      const result = installSecret({
        projectRoot: resolve(options.projectRoot),
        globalRoot: resolve(options.globalRoot),
        requestName: options.name,
        destinationName: options.destinationName,
        environments: options.environments,
      });
      console.log(
        `Installed ${result.request} into ${result.destination} for ${result.environments.join(', ')}.`,
      );
      return;
    }
    if (options.command !== 'doctor') throw new Error(`Unknown command: ${options.command}`);
    const report = inspectAccess({
      projectRoot: resolve(options.projectRoot),
      globalRoot: resolve(options.globalRoot),
      provider: options.provider,
    });
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else printHuman(report);
    if (report.status !== 'ready') process.exitCode = 1;
  } catch (error) {
    console.error(`Access broker failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) main();
