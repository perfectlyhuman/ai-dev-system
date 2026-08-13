import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { installProject } from './install.mjs';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function options(projectRoot, overrides = {}) {
  return {
    projectRoot,
    globalRoot: join(projectRoot, '.test-global'),
    name: 'fixture-project',
    description: 'A fixture used to verify the AI Dev System installer.',
    entity: 'test',
    stage: 'prototype',
    deliveryMode: 'commit',
    mainBranch: 'main',
    integration: 'direct',
    deployment: 'none',
    refreshSkills: false,
    dryRun: false,
    ...overrides,
  };
}

test('installs, reruns idempotently, and protects drifted skills', () => {
  const projectRoot = mkdtempSync(join(tmpdir(), 'ai-dev-system-'));

  try {
    const configured = options(projectRoot, { previewBranch: 'preview' });
    const first = installProject(configured);
    assert.ok(first.created.includes('.ai-dev/project.yaml'));
    assert.ok(first.created.includes('.agents/skills/start'));
    assert.ok(first.global.created.includes('RILEY.md'));
    assert.ok(first.global.created.includes('projects.yaml'));
    assert.ok(first.global.created.includes('registry.yaml'));

    const globalRoot = configured.globalRoot;
    assert.match(readFileSync(join(globalRoot, 'RILEY.md'), 'utf8'), /`go` means proceed/);
    assert.match(readFileSync(join(globalRoot, 'registry.yaml'), 'utf8'), /Never store passwords/);
    assert.deepEqual(JSON.parse(readFileSync(join(globalRoot, 'projects.yaml'), 'utf8')), {
      schema_version: 1,
      projects: {
        'fixture-project': projectRoot,
      },
    });

    for (const skill of ['kickoff', 'start', 'update-docs', 'finish']) {
      assert.ok(existsSync(join(projectRoot, '.agents', 'skills', skill, 'SKILL.md')));
      assert.ok(existsSync(join(projectRoot, '.agents', 'skills', skill, 'agents', 'openai.yaml')));
    }

    for (const document of ['PROJECT.md', 'ROADMAP.md']) {
      assert.ok(existsSync(join(projectRoot, 'documentation', document)));
    }

    for (const directory of [
      'chapters',
      'decisions',
      'lessons',
      join('archive', 'roadmap'),
    ]) {
      assert.ok(existsSync(join(projectRoot, 'documentation', directory)));
    }

    assert.equal(existsSync(join(projectRoot, '.claude')), false);

    const config = readFileSync(join(projectRoot, '.ai-dev', 'project.yaml'), 'utf8');
    assert.match(config, /name: "fixture-project"/);
    assert.match(config, /entity: "test"/);
    assert.match(config, /preview_branch: "preview"/);
    assert.match(config, /scopes: \[\]/);

    const second = installProject(configured);
    assert.equal(second.created.length, 0);
    assert.ok(second.unchanged.includes('.agents/skills/start'));
    assert.equal(second.global.created.length, 0);
    assert.ok(second.global.unchanged.includes('RILEY.md'));
    assert.ok(second.global.unchanged.includes('projects.yaml'));

    writeFileSync(join(globalRoot, 'RILEY.md'), '# Riley\n\nPersonal guidance.\n');
    const preservedGlobal = installProject(configured);
    assert.equal(
      readFileSync(join(globalRoot, 'RILEY.md'), 'utf8'),
      '# Riley\n\nPersonal guidance.\n',
    );
    assert.ok(preservedGlobal.global.unchanged.includes('RILEY.md'));

    const installedStart = join(projectRoot, '.agents', 'skills', 'start', 'SKILL.md');
    writeFileSync(installedStart, `${readFileSync(installedStart, 'utf8')}\nlocal drift\n`);

    assert.throws(
      () => installProject(configured),
      /Installed skill has drifted/,
    );

    const refreshed = installProject({ ...configured, refreshSkills: true });
    assert.ok(refreshed.refreshed.includes('.agents/skills/start'));
    assert.doesNotMatch(readFileSync(installedStart, 'utf8'), /local drift/);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

test('dry run reports writes without creating them', () => {
  const projectRoot = mkdtempSync(join(tmpdir(), 'ai-dev-system-dry-'));

  try {
    const result = installProject(options(projectRoot, { dryRun: true }));
    assert.ok(result.created.includes('.ai-dev/project.yaml'));
    assert.ok(result.global.created.includes('RILEY.md'));
    assert.throws(() => readFileSync(join(projectRoot, '.ai-dev', 'project.yaml')));
    assert.equal(existsSync(join(projectRoot, '.test-global', 'RILEY.md')), false);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});

test('registers additional projects and updates moved paths without replacing global guidance', () => {
  const root = mkdtempSync(join(tmpdir(), 'ai-dev-system-global-'));
  const globalRoot = join(root, 'global');
  const firstProject = join(root, 'first');
  const secondProject = join(root, 'second');

  try {
    mkdirSync(firstProject);
    mkdirSync(secondProject);

    installProject(options(firstProject, { globalRoot, name: 'first' }));
    installProject(options(secondProject, { globalRoot, name: 'second' }));

    const registryPath = join(globalRoot, 'projects.yaml');
    assert.deepEqual(JSON.parse(readFileSync(registryPath, 'utf8')), {
      schema_version: 1,
      projects: {
        first: firstProject,
        second: secondProject,
      },
    });

    const movedProject = join(root, 'moved-first');
    mkdirSync(movedProject);
    const moved = installProject(options(movedProject, { globalRoot, name: 'first' }));
    assert.ok(moved.global.refreshed.includes('projects.yaml'));
    assert.equal(JSON.parse(readFileSync(registryPath, 'utf8')).projects.first, movedProject);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('uses the existing project contract name for global registration', () => {
  const root = mkdtempSync(join(tmpdir(), 'ai-dev-system-name-'));
  const projectRoot = join(root, 'directory-name');
  const globalRoot = join(root, 'global');

  try {
    mkdirSync(projectRoot);
    installProject(options(projectRoot, { globalRoot, name: 'canonical-name' }));
    installProject(options(projectRoot, { globalRoot, name: undefined }));

    const projects = JSON.parse(readFileSync(join(globalRoot, 'projects.yaml'), 'utf8')).projects;
    assert.deepEqual(projects, { 'canonical-name': projectRoot });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('project schema partitions private client scopes from shared work', () => {
  const schema = JSON.parse(
    readFileSync(join(packageRoot, 'schema', 'project.schema.json'), 'utf8'),
  );
  const scope = schema.$defs.scope;
  const scopeDocumentation = schema.$defs.scopeDocumentation;
  const sharedWork = schema.$defs.sharedWork;

  assert.ok(scope.required.includes('visibility'));
  assert.ok(scope.required.includes('documentation'));
  assert.equal(scope.properties.visibility.const, 'private');
  assert.ok(scopeDocumentation.required.includes('roadmap'));
  assert.ok(scopeDocumentation.required.includes('roadmap_archive'));
  assert.equal(sharedWork.properties.audience.const, 'client');
  assert.equal(sharedWork.properties.provider.const, 'supabase');
});
