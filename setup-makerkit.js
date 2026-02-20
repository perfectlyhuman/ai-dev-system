#!/usr/bin/env node

/**
 * setup-makerkit.js
 *
 * Automated setup for new Makerkit SaaS projects.
 * Run from within a freshly cloned Makerkit template directory.
 *
 * What it does:
 *   1. Asks for project details (name, display name, description, GitHub user)
 *   2. Auto-detects next available port range (scans sibling projects)
 *   3. Updates all config files (config.toml, .env files, package.json)
 *   4. Installs ai-dev-system solo mode (skills, commands, documentation)
 *   5. Runs pnpm install
 *   6. Re-initializes git with a fresh history
 *   7. Creates a private GitHub repo and pushes
 *   8. Deploys to Vercel (if CLI available)
 *
 * Usage:
 *   node setup-makerkit.js
 *   npx create-ai-dev --makerkit
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const projectRoot = process.cwd();

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: projectRoot,
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...opts,
    });
  } catch (e) {
    if (opts.ignoreError) return null;
    throw e;
  }
}

function runSilent(cmd) {
  return run(cmd, { silent: true, ignoreError: true });
}

function hasCommand(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`, {
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function ask(rl, question, defaultValue) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

function toTitleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Port detection
// ---------------------------------------------------------------------------

function detectUsedProjectNumbers() {
  const parentDir = path.dirname(projectRoot);
  const used = new Set();

  try {
    const siblings = fs.readdirSync(parentDir);
    for (const dir of siblings) {
      if (dir === path.basename(projectRoot)) continue;
      const configPath = path.join(
        parentDir,
        dir,
        'apps',
        'web',
        'supabase',
        'config.toml',
      );
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const match = content.match(
          /\[api\][\s\S]*?port\s*=\s*(\d+)/,
        );
        if (match) {
          const apiPort = parseInt(match[1], 10);
          const projectNum = Math.round((apiPort - 54321) / 10);
          if (projectNum >= 0 && projectNum < 100) {
            used.add(projectNum);
          }
        }
      } catch {
        // Not a Makerkit project or can't read — skip
      }
    }
  } catch {
    // Can't read parent directory
  }

  return used;
}

function suggestProjectNumber(used) {
  for (let i = 0; i < 100; i++) {
    if (!used.has(i)) return i;
  }
  return 0;
}

function getPorts(projectNumber) {
  const base = 54321 + projectNumber * 10;
  return {
    api: base,
    db: base + 1,
    studio: base + 2,
    inbucket: base + 3,
    smtp: base + 4,
    pop3: base + 5,
    analytics: base + 6,
    next: 3000 + projectNumber,
  };
}

// ---------------------------------------------------------------------------
// File modification
// ---------------------------------------------------------------------------

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Skipped ${path.relative(projectRoot, filePath)} (not found)`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
      content = content.replace(search, replace);
    } else {
      content = content.split(search).join(replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function appendToFile(filePath, line) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes(line)) {
    if (!content.endsWith('\n')) content += '\n';
    content += line + '\n';
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

function updateConfigToml(slug, ports) {
  const configPath = path.join(
    projectRoot,
    'apps',
    'web',
    'supabase',
    'config.toml',
  );
  if (!fs.existsSync(configPath)) {
    console.log('  ⚠ config.toml not found — skipping');
    return;
  }

  let content = fs.readFileSync(configPath, 'utf-8');

  // Project ID
  content = content.replace(
    /project_id\s*=\s*"[^"]*"/,
    `project_id = "${slug}"`,
  );

  // Ports — replace section by section to avoid ambiguity
  // [api] port
  content = content.replace(
    /(\[api\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.api}`,
  );

  // [db] port
  content = content.replace(
    /(\[db\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.db}`,
  );

  // [studio] port
  content = content.replace(
    /(\[studio\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.studio}`,
  );

  // [inbucket] port, smtp_port, pop3_port
  content = content.replace(
    /(\[inbucket\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.inbucket}`,
  );
  content = content.replace(/smtp_port\s*=\s*\d+/, `smtp_port = ${ports.smtp}`);
  content = content.replace(/pop3_port\s*=\s*\d+/, `pop3_port = ${ports.pop3}`);

  // [analytics] port
  content = content.replace(
    /(\[analytics\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.analytics}`,
  );

  // Auth site_url and redirect URLs
  content = content.replace(
    /site_url\s*=\s*"http:\/\/localhost:\d+"/,
    `site_url = "http://localhost:${ports.next}"`,
  );
  content = content.replace(
    /localhost:3000/g,
    `localhost:${ports.next}`,
  );

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log('  ✓ apps/web/supabase/config.toml');
}

function updateEnvFiles(slug, displayName, description, ports) {
  // .env (shared)
  const envPath = path.join(projectRoot, 'apps', 'web', '.env');
  if (
    replaceInFile(envPath, [
      ['NEXT_PUBLIC_SITE_URL=http://localhost:3000', `NEXT_PUBLIC_SITE_URL=http://localhost:${ports.next}`],
      ['NEXT_PUBLIC_PRODUCT_NAME=Makerkit', `NEXT_PUBLIC_PRODUCT_NAME=${displayName}`],
      [
        /NEXT_PUBLIC_SITE_TITLE="[^"]*"/,
        `NEXT_PUBLIC_SITE_TITLE="${displayName}${description ? ' - ' + description : ''}"`,
      ],
      [
        /NEXT_PUBLIC_SITE_DESCRIPTION="[^"]*"/,
        `NEXT_PUBLIC_SITE_DESCRIPTION="${description || displayName + ' SaaS application'}"`,
      ],
    ])
  ) {
    console.log('  ✓ apps/web/.env');
  }

  // .env.development
  const envDevPath = path.join(projectRoot, 'apps', 'web', '.env.development');
  if (
    replaceInFile(envDevPath, [
      [
        'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321',
        `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${ports.api}`,
      ],
      ['EMAIL_PORT=54325', `EMAIL_PORT=${ports.smtp}`],
      [
        /EMAIL_SENDER="[^"]*"/,
        `EMAIL_SENDER="${displayName} <admin@${slug}.dev>"`,
      ],
    ])
  ) {
    console.log('  ✓ apps/web/.env.development');
  }

  // Add PORT to .env.development for Next.js
  if (ports.next !== 3000) {
    appendToFile(envDevPath, `\n# Next.js dev server port\nPORT=${ports.next}`);
  }

  // .env.test
  const envTestPath = path.join(projectRoot, 'apps', 'web', '.env.test');
  if (
    replaceInFile(envTestPath, [
      [
        'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321',
        `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${ports.api}`,
      ],
      ['EMAIL_PORT=54325', `EMAIL_PORT=${ports.smtp}`],
    ])
  ) {
    console.log('  ✓ apps/web/.env.test');
  }

  // package.json (root)
  const pkgPath = path.join(projectRoot, 'package.json');
  if (
    replaceInFile(pkgPath, [
      [
        /"name":\s*"next-supabase-saas-kit-turbo"/,
        `"name": "${slug}"`,
      ],
    ])
  ) {
    console.log('  ✓ package.json');
  }
}

// ---------------------------------------------------------------------------
// ai-dev-system installation
// ---------------------------------------------------------------------------

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function installAiDevSystem(slug, description) {
  // Determine where the solo mode files are
  // Could be running from the ai-dev-system package or from a local copy
  const packageDir = path.dirname(__filename);
  const soloDir = path.join(packageDir, 'solo');

  if (fs.existsSync(soloDir)) {
    // Copy from package
    copyRecursive(
      path.join(soloDir, '.claude'),
      path.join(projectRoot, '.claude'),
    );
    copyRecursive(
      path.join(soloDir, 'documentation'),
      path.join(projectRoot, 'documentation'),
    );
  } else {
    // Fallback: create minimal structure
    const dirs = [
      'documentation',
      'documentation/chapters',
      'documentation/workflows',
      'documentation/archived',
    ];
    for (const dir of dirs) {
      fs.mkdirSync(path.join(projectRoot, dir), { recursive: true });
    }
  }

  // Ensure archived directory exists
  fs.mkdirSync(path.join(projectRoot, 'documentation', 'archived'), {
    recursive: true,
  });

  // Write project.json with actual project details
  const projectJsonPath = path.join(projectRoot, '.claude', 'project.json');
  const projectJson = {
    name: slug,
    description: description || `${slug} SaaS application`,
    documentation: {
      root: 'documentation',
      master: 'documentation/MASTER.md',
      roadmap: 'documentation/ROADMAP.md',
      chapters: 'documentation/chapters',
      workflows: 'documentation/workflows',
    },
    testing: {
      typecheck: 'pnpm typecheck',
      lint: 'pnpm lint:fix',
      format: 'pnpm format:fix',
      quick: 'pnpm typecheck && pnpm lint:fix && pnpm format:fix',
    },
    git: {
      mainBranch: 'main',
      previewBranch: 'preview',
      branchPrefix: '',
      remote: 'origin',
    },
    paths: {
      app: 'apps/web',
      database: 'apps/web/supabase',
    },
  };

  fs.mkdirSync(path.dirname(projectJsonPath), { recursive: true });
  fs.writeFileSync(
    projectJsonPath,
    JSON.stringify(projectJson, null, 2) + '\n',
    'utf-8',
  );

  console.log('  ✓ ai-dev-system (skills, commands, documentation)');
}

// ---------------------------------------------------------------------------
// Git, GitHub, Vercel
// ---------------------------------------------------------------------------

function reinitGit(slug, displayName) {
  // Remove existing git history (from template)
  const gitDir = path.join(projectRoot, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  run('git init', { silent: true });
  run('git add .', { silent: true });
  run(
    `git commit -m "Initial commit: ${displayName} from Makerkit template"`,
    { silent: true },
  );
  run('git branch -M main', { silent: true });

  console.log('  ✓ Git initialized with clean history');
}

function createGithubRepo(username, slug) {
  if (!hasCommand('gh')) {
    console.log('  ⚠ GitHub CLI (gh) not found — skipping repo creation');
    console.log('    Install: https://cli.github.com/');
    return null;
  }

  // Check if authenticated
  const authStatus = runSilent('gh auth status');
  if (authStatus === null) {
    console.log('  ⚠ GitHub CLI not authenticated — run: gh auth login');
    return null;
  }

  try {
    run(
      `gh repo create ${username}/${slug} --private --source=. --remote=origin --push`,
      { silent: true },
    );
    const repoUrl = `https://github.com/${username}/${slug}`;
    console.log(`  ✓ GitHub repo created: ${repoUrl}`);
    return repoUrl;
  } catch (e) {
    console.log(`  ⚠ GitHub repo creation failed: ${e.message}`);
    return null;
  }
}

function deployVercel(slug) {
  if (!hasCommand('vercel')) {
    console.log('  ⚠ Vercel CLI not found — skipping deployment');
    console.log('    Install: npm i -g vercel');
    console.log('    Or connect manually: https://vercel.com/new');
    return null;
  }

  try {
    run(`vercel link --yes -p ${slug}`, { silent: true });
    run('vercel --prod --yes', { silent: true });
    const vercelUrl = `https://${slug}.vercel.app`;
    console.log(`  ✓ Vercel deployment started: ${vercelUrl}`);
    return vercelUrl;
  } catch (e) {
    console.log(`  ⚠ Vercel deployment failed: ${e.message}`);
    console.log('    Connect manually: https://vercel.com/new');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
  ╔══════════════════════════════════════╗
  ║   Makerkit Project Setup            ║
  ║   Powered by ai-dev-system          ║
  ╚══════════════════════════════════════╝
`);

  // Detect defaults
  const dirName = path.basename(projectRoot);
  const defaultSlug = toSlug(dirName);

  // Get GitHub username
  let defaultUsername = '';
  try {
    const ghUser = runSilent('gh api user -q .login');
    if (ghUser) defaultUsername = ghUser.trim();
  } catch {}
  if (!defaultUsername) {
    try {
      const gitUser = runSilent('git config user.name');
      if (gitUser) defaultUsername = gitUser.trim();
    } catch {}
  }

  // Detect used ports
  const usedNumbers = detectUsedProjectNumbers();
  const suggestedNumber = suggestProjectNumber(usedNumbers);

  // ---------------------------------------------------------------------------
  // Prompts
  // ---------------------------------------------------------------------------

  const slug = toSlug(await ask(rl, 'Project slug', defaultSlug));
  const displayName = await ask(rl, 'Display name', toTitleCase(slug));
  const description = await ask(rl, 'Short description (optional)', '');
  const username = await ask(rl, 'GitHub username', defaultUsername);

  const usedStr =
    usedNumbers.size > 0
      ? ` (used: ${[...usedNumbers].sort((a, b) => a - b).join(', ')})`
      : '';
  const projectNumStr = await ask(
    rl,
    `Port group number${usedStr}`,
    String(suggestedNumber),
  );
  const projectNumber = parseInt(projectNumStr, 10) || suggestedNumber;
  const ports = getPorts(projectNumber);

  rl.close();

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log(`
  ─────────────────────────────────────
  Summary
  ─────────────────────────────────────

  Project:      ${slug} (${displayName})
  Description:  ${description || '(none)'}
  GitHub:       ${username}/${slug}

  Ports:
    Supabase API:     ${ports.api}
    Supabase DB:      ${ports.db}
    Supabase Studio:  ${ports.studio}
    Inbucket (email): ${ports.inbucket}
    SMTP:             ${ports.smtp}
    POP3:             ${ports.pop3}
    Analytics:        ${ports.analytics}
    Next.js:          ${ports.next}

  ─────────────────────────────────────
`);

  // ---------------------------------------------------------------------------
  // Execute
  // ---------------------------------------------------------------------------

  console.log('  [1/7] Updating config files...');
  updateConfigToml(slug, ports);
  updateEnvFiles(slug, displayName, description, ports);

  console.log('\n  [2/7] Installing ai-dev-system...');
  installAiDevSystem(slug, description);

  console.log('\n  [3/7] Installing dependencies...');
  try {
    run('pnpm install', { silent: true });
    console.log('  ✓ pnpm install complete');
  } catch (e) {
    console.log('  ⚠ pnpm install failed — run it manually later');
  }

  console.log('\n  [4/7] Initializing git...');
  reinitGit(slug, displayName);

  console.log('\n  [5/7] Creating GitHub repo...');
  const githubUrl = createGithubRepo(username, slug);

  console.log('\n  [6/7] Deploying to Vercel...');
  const vercelUrl = deployVercel(slug);

  console.log('\n  [7/7] Done!');

  // ---------------------------------------------------------------------------
  // Final summary
  // ---------------------------------------------------------------------------

  console.log(`
  ╔══════════════════════════════════════╗
  ║   ✅ Setup Complete!                 ║
  ╚══════════════════════════════════════╝

  Project:    ${slug} (${displayName})
  Ports:      Supabase ${ports.api}-${ports.analytics} | Next.js ${ports.next}

  Local Dev:
    App:          http://localhost:${ports.next}
    Supabase API: http://localhost:${ports.api}
    Studio:       http://localhost:${ports.studio}
    Email inbox:  http://localhost:${ports.inbucket}
`);

  if (githubUrl) {
    console.log(`  GitHub:       ${githubUrl}`);
  }
  if (vercelUrl) {
    console.log(`  Vercel:       ${vercelUrl}`);
  }

  console.log(`
  Next steps:
    1. pnpm supabase:web:start    Start local Supabase
    2. pnpm dev                   Start dev server
    3. Open Claude Code and run /kickoff or /vision
`);
}

main().catch((e) => {
  console.error(`\n  ❌ Setup failed: ${e.message}\n`);
  process.exit(1);
});
