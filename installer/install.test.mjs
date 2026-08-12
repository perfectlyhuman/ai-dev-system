import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { installProject } from './install.mjs';

function options(projectRoot, overrides = {}) {
  return {
    projectRoot,
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
    const first = installProject(options(projectRoot));
    assert.ok(first.created.includes('.ai-dev/project.yaml'));
    assert.ok(first.created.includes('.agents/skills/start'));

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

    const second = installProject(options(projectRoot));
    assert.equal(second.created.length, 0);
    assert.ok(second.unchanged.includes('.agents/skills/start'));

    const installedStart = join(projectRoot, '.agents', 'skills', 'start', 'SKILL.md');
    writeFileSync(installedStart, `${readFileSync(installedStart, 'utf8')}\nlocal drift\n`);

    assert.throws(
      () => installProject(options(projectRoot)),
      /Installed skill has drifted/,
    );

    const refreshed = installProject(options(projectRoot, { refreshSkills: true }));
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
    assert.throws(() => readFileSync(join(projectRoot, '.ai-dev', 'project.yaml')));
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});
