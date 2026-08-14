import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { inspectAccess, installSecret } from '../skills/access/scripts/access.mjs';

function fixture(requests) {
  const root = mkdtempSync(join(tmpdir(), 'ai-dev-access-'));
  mkdirSync(join(root, '.ai-dev'));
  writeFileSync(
    join(root, '.ai-dev', 'access.yaml'),
    `${JSON.stringify({ schema_version: 1, project: 'fixture', requests }, null, 2)}\n`,
  );
  return root;
}

function cliCredential(provider, account = 'fixture-account', consumers = ['fixture']) {
  return {
    provider,
    account,
    status: 'active',
    consumers,
    source: { kind: 'cli' },
  };
}

function bitwardenCredential(provider, secretId = '22222222-2222-2222-2222-222222222222') {
  return {
    provider,
    account: 'fixture-account',
    status: secretId ? 'active' : 'planned',
    consumers: ['fixture'],
    source: {
      kind: 'bitwarden',
      project: 'developer-access',
      environment: `${provider.toUpperCase()}_API_KEY`,
      secret_id: secretId,
    },
  };
}

function registryFor(credentials, { projectId = '11111111-1111-1111-1111-111111111111' } = {}) {
  const accounts = {};
  for (const credential of Object.values(credentials)) {
    accounts[credential.provider] ||= {};
    accounts[credential.provider][credential.account] = {
      identity: credential.account,
      authentication: credential.source.kind,
    };
  }
  return {
    schema_version: 1,
    accounts,
    organizations: {},
    services: {},
    credentials,
    credential_providers: {
      bitwarden: {
        projects: { 'developer-access': { id: projectId, name: 'Developer Access' } },
        machine_accounts: {
          'fixture-machine': { token_file: 'fixture-machine.bin' },
        },
        defaults: { machine_account: 'fixture-machine' },
      },
    },
  };
}

test('reports an authenticated first-party CLI as ready without returning command output', () => {
  const requests = {
    source: {
      credential: 'github.fixture',
      resource: 'fixture/repository',
      capabilities: ['repository:write'],
    },
  };
  const root = fixture(requests);
  try {
    const report = inspectAccess({
      projectRoot: root,
      registry: registryFor({ 'github.fixture': cliCredential('github') }),
      runner: () => ({ found: true, ok: true, stdout: 'sensitive output is ignored' }),
    });
    assert.equal(report.status, 'ready');
    assert.equal(report.results[0].status, 'ready');
    assert.doesNotMatch(JSON.stringify(report), /sensitive output/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('distinguishes missing tooling from failed authentication', () => {
  const requests = {
    deploy: { credential: 'vercel.fixture', capabilities: ['deploy:preview'] },
  };
  const root = fixture(requests);
  const registry = registryFor({ 'vercel.fixture': cliCredential('vercel') });
  try {
    const missing = inspectAccess({
      projectRoot: root,
      registry,
      runner: () => ({ found: false, ok: false }),
    });
    assert.equal(missing.results[0].status, 'missing');

    const blocked = inspectAccess({
      projectRoot: root,
      registry,
      runner: () => ({ found: true, ok: false }),
    });
    assert.equal(blocked.results[0].status, 'blocked');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reports an unfinished Bitwarden route as planned without attempting retrieval', () => {
  const requests = {
    email: { credential: 'resend.fixture', capabilities: ['email:send'] },
  };
  const root = fixture(requests);
  let called = false;
  try {
    const report = inspectAccess({
      projectRoot: root,
      registry: registryFor({ 'resend.fixture': bitwardenCredential('resend', null) }),
      runner: () => {
        called = true;
        return { found: true, ok: true };
      },
    });
    assert.equal(report.results[0].status, 'planned');
    assert.match(report.results[0].detail, /secret reference/);
    assert.equal(called, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('checks Bitwarden references without exposing provider or secret output', () => {
  const requests = {
    email: { credential: 'resend.fixture', capabilities: ['email:send'] },
  };
  const root = fixture(requests);
  const calls = [];
  try {
    const report = inspectAccess({
      projectRoot: root,
      registry: registryFor({ 'resend.fixture': bitwardenCredential('resend') }),
      machineTokenResolver: () => 'fixture-access-token',
      runner: (command, args) => {
        calls.push([command, args]);
        return { found: true, ok: true, stdout: 'never include this output' };
      },
    });
    assert.equal(report.status, 'ready');
    assert.deepEqual(
      calls.map(([, args]) => args.slice(0, 2)),
      [
        ['project', 'get'],
        ['secret', 'get'],
      ],
    );
    assert.doesNotMatch(JSON.stringify(report), /never include/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('filters checks by the provider resolved from the credential route', () => {
  const root = fixture({
    source: { credential: 'github.fixture', capabilities: ['repository:read'] },
    deploy: { credential: 'vercel.fixture', capabilities: ['deploy:preview'] },
  });
  try {
    const report = inspectAccess({
      projectRoot: root,
      provider: 'github',
      registry: registryFor({
        'github.fixture': cliCredential('github'),
        'vercel.fixture': cliCredential('vercel'),
      }),
      runner: () => ({ found: true, ok: true }),
    });
    assert.deepEqual(report.results.map((result) => result.provider), ['github']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an unregistered credential alias before checking a provider', () => {
  const root = fixture({
    source: { credential: 'github.unknown', capabilities: ['repository:read'] },
  });
  let called = false;
  try {
    const report = inspectAccess({
      projectRoot: root,
      registry: registryFor({}),
      runner: () => {
        called = true;
        return { found: true, ok: true };
      },
    });
    assert.equal(report.results[0].status, 'invalid');
    assert.match(report.results[0].detail, /not registered/);
    assert.equal(called, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a credential that is not approved for the requesting project', () => {
  const root = fixture({
    source: { credential: 'github.fixture', capabilities: ['repository:read'] },
  });
  try {
    const report = inspectAccess({
      projectRoot: root,
      registry: registryFor({
        'github.fixture': cliCredential('github', 'fixture-account', ['another-project']),
      }),
      runner: () => ({ found: true, ok: true }),
    });
    assert.equal(report.results[0].status, 'invalid');
    assert.match(report.results[0].detail, /not approved/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('installs one Bitwarden secret into declared Vercel environments without returning its value', () => {
  const root = fixture({
    llm: { credential: 'openai.fixture', capabilities: ['responses:create'] },
    deploy: {
      credential: 'vercel.fixture',
      resource: 'fixture',
      capabilities: ['deploy:production', 'environment:write'],
    },
  });
  const registry = registryFor({
    'openai.fixture': bitwardenCredential('openai'),
    'vercel.fixture': cliCredential('vercel'),
  });
  const installations = [];
  try {
    const result = installSecret({
      projectRoot: root,
      requestName: 'llm',
      destinationName: 'deploy',
      environments: ['preview', 'production', 'preview'],
      registry,
      machineTokenResolver: () => 'fixture-access-token',
      secretResolver: () => ({
        projectId: '11111111-1111-1111-1111-111111111111',
        value: 'fixture-secret-value',
      }),
      vercelInstaller: (installation) => installations.push(installation),
    });

    assert.deepEqual(result, {
      request: 'llm',
      destination: 'deploy',
      environments: ['preview', 'production'],
    });
    assert.deepEqual(
      installations.map(({ environmentName, targetEnvironment, value }) => ({
        environmentName,
        targetEnvironment,
        value,
      })),
      [
        {
          environmentName: 'OPENAI_API_KEY',
          targetEnvironment: 'preview',
          value: 'fixture-secret-value',
        },
        {
          environmentName: 'OPENAI_API_KEY',
          targetEnvironment: 'production',
          value: 'fixture-secret-value',
        },
      ],
    );
    assert.doesNotMatch(JSON.stringify(result), /fixture-secret-value/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('refuses to install a secret outside its registered Bitwarden project', () => {
  const root = fixture({
    email: { credential: 'resend.fixture', capabilities: ['email:send'] },
    deploy: {
      credential: 'vercel.fixture',
      capabilities: ['environment:write'],
    },
  });
  const registry = registryFor({
    'resend.fixture': bitwardenCredential('resend'),
    'vercel.fixture': cliCredential('vercel'),
  });
  try {
    assert.throws(
      () =>
        installSecret({
          projectRoot: root,
          requestName: 'email',
          destinationName: 'deploy',
          environments: ['production'],
          registry,
          machineTokenResolver: () => 'fixture-access-token',
          secretResolver: () => ({
            projectId: '99999999-9999-9999-9999-999999999999',
            value: 'wrong-project-secret',
          }),
          vercelInstaller: () => {},
        }),
      /does not belong/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('requires an explicit environment-write capability on the Vercel destination', () => {
  const root = fixture({
    email: { credential: 'resend.fixture', capabilities: ['email:send'] },
    deploy: { credential: 'vercel.fixture', capabilities: ['deploy:production'] },
  });
  const registry = registryFor({
    'resend.fixture': bitwardenCredential('resend'),
    'vercel.fixture': cliCredential('vercel'),
  });
  try {
    assert.throws(
      () =>
        installSecret({
          projectRoot: root,
          requestName: 'email',
          destinationName: 'deploy',
          environments: ['production'],
          registry,
        }),
      /does not allow environment writes/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
