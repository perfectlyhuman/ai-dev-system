#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = join(packageRoot, 'templates', 'global', 'RILEY.md');
const targetPath = join(homedir(), '.ai-dev-system', 'RILEY.md');
const preserveHeading = '## Own temporary artifacts through cleanup';

function extractSection(markdown, heading) {
  const start = markdown.indexOf(heading);
  if (start === -1) return '';
  const rest = markdown.slice(start);
  const next = rest.slice(heading.length).search(/\n## /);
  return next === -1 ? rest.trim() : rest.slice(0, heading.length + next).trim();
}

function main() {
  if (!existsSync(targetPath)) {
    copyFileSync(templatePath, targetPath);
    console.log(`Created ${targetPath} from template.`);
    return;
  }

  const backup = `${targetPath}.bak-${new Date().toISOString().replaceAll(':', '').slice(0, 15)}`;
  copyFileSync(targetPath, backup);

  const existing = readFileSync(targetPath, 'utf8');
  const template = readFileSync(templatePath, 'utf8');
  const preserved = extractSection(existing, preserveHeading);
  let merged = template.trimEnd();
  if (preserved && !template.includes(preserveHeading)) {
    merged += `\n\n${preserved}\n`;
  }
  writeFileSync(targetPath, `${merged}\n`, 'utf8');
  console.log(`Merged ${targetPath} (backup: ${backup})`);
}

main();
