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
 *   8. Sets up Framer landing page (optional — template duplication + API key)
 *   9. Deploys to Vercel (if CLI available)
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

function openBrowser(url) {
  const openCmd =
    process.platform === 'win32'
      ? 'start'
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open';
  try {
    execSync(`${openCmd} "${url}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
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

function installAiDevSystem(slug, description, framerConfig) {
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

  // Add Framer config if provided
  if (framerConfig) {
    projectJson.framer = {
      templateUrl: framerConfig.templateUrl,
      projectUrl: '',
      customDomain: framerConfig.domain || '',
    };
  }

  fs.mkdirSync(path.dirname(projectJsonPath), { recursive: true });
  fs.writeFileSync(
    projectJsonPath,
    JSON.stringify(projectJson, null, 2) + '\n',
    'utf-8',
  );

  console.log('  ✓ ai-dev-system (skills, commands, documentation)');
}

// ---------------------------------------------------------------------------
// shadcnblocks + shadcn MCP
// ---------------------------------------------------------------------------

function configureShadcnBlocks() {
  // Read API key from secrets
  const secretsPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.config',
    'ai-dev-system',
    'secrets.json',
  );

  let apiKey = '';
  try {
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
    apiKey = secrets.shadcnblocks_api_key || '';
  } catch {
    // secrets.json not found or doesn't have the key
  }

  if (!apiKey) {
    console.log('  ⚠ shadcnblocks API key not found in secrets.json — skipping');
    console.log('    Add "shadcnblocks_api_key" to ~/.config/ai-dev-system/secrets.json');
    return;
  }

  // Add registry to packages/ui/components.json
  const componentsPath = path.join(projectRoot, 'packages', 'ui', 'components.json');
  if (fs.existsSync(componentsPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
      config.registries = {
        '@shadcnblocks': {
          url: 'https://shadcnblocks.com/r/{name}',
          headers: {
            Authorization: 'Bearer ${SHADCNBLOCKS_API_KEY}',
          },
        },
      };
      fs.writeFileSync(
        componentsPath,
        JSON.stringify(config, null, 2) + '\n',
        'utf-8',
      );
      console.log('  ✓ packages/ui/components.json (shadcnblocks registry)');
    } catch (e) {
      console.log(`  ⚠ Failed to update components.json: ${e.message}`);
    }
  }

  // Add SHADCNBLOCKS_API_KEY to .env
  const envPath = path.join(projectRoot, 'apps', 'web', '.env');
  if (fs.existsSync(envPath)) {
    appendToFile(
      envPath,
      `\n# SHADCNBLOCKS - UI component registry (https://shadcnblocks.com)\nSHADCNBLOCKS_API_KEY=${apiKey}`,
    );
    console.log('  ✓ apps/web/.env (SHADCNBLOCKS_API_KEY)');
  }

  // Write .mcp.json with shadcn MCP server
  const mcpPath = path.join(projectRoot, '.mcp.json');
  let mcpConfig = { mcpServers: {} };
  if (fs.existsSync(mcpPath)) {
    try {
      mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    } catch {}
  }

  // Add makerkit MCP if packages/mcp-server exists
  const mkMcpDir = path.join(projectRoot, 'packages', 'mcp-server', 'build', 'index.cjs');
  if (fs.existsSync(mkMcpDir)) {
    mcpConfig.mcpServers.makerkit = {
      type: 'stdio',
      command: 'node',
      args: ['packages/mcp-server/build/index.cjs'],
    };
  }

  // Add shadcn MCP
  mcpConfig.mcpServers.shadcn = {
    type: 'stdio',
    command: 'npx',
    args: ['-y', 'shadcn@latest', 'mcp'],
  };

  fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2) + '\n', 'utf-8');
  console.log('  ✓ .mcp.json (shadcn MCP server)');
}

// ---------------------------------------------------------------------------
// Framer landing page setup
// ---------------------------------------------------------------------------

async function setupFramerInteractive(templateUrl, slug) {
  if (!openBrowser(templateUrl)) {
    console.log(`  → Could not open browser. Open this URL manually: ${templateUrl}`);
  }

  console.log(`
  → Opening Framer template in your browser...

  Complete these steps:
    1. Click "Use for Free" or "Duplicate" on the template page
    2. Once in the editor, copy the project URL from the address bar
       (looks like: https://framer.com/projects/Name--abc123)
    3. Go to Site Settings > General
    4. Scroll to "Server API" and click "Generate Key"
    5. Copy the API key
  `);

  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const projectUrl = await ask(rl2, 'Framer project URL (after duplicating)', '');
  const apiKey = await ask(rl2, 'Framer API key', '');
  rl2.close();

  if (!projectUrl || !apiKey) {
    console.log('  ⚠ Framer setup skipped — missing project URL or API key');
    console.log('    You can set this up later with the /landing command');
    return null;
  }

  // Store API key in .env.local (gitignored by default in Next.js)
  const envLocalPath = path.join(projectRoot, 'apps', 'web', '.env.local');
  let envLocalContent = '';
  if (fs.existsSync(envLocalPath)) {
    envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  }
  if (!envLocalContent.includes('FRAMER_API_KEY')) {
    if (envLocalContent && !envLocalContent.endsWith('\n')) envLocalContent += '\n';
    envLocalContent += `\n# Framer Server API key (per-project, keep secret)\nFRAMER_API_KEY=${apiKey}\n`;
    fs.writeFileSync(envLocalPath, envLocalContent, 'utf-8');
    console.log('  ✓ apps/web/.env.local (FRAMER_API_KEY)');
  }

  // Update project.json with the actual project URL
  const pjPath = path.join(projectRoot, '.claude', 'project.json');
  if (fs.existsSync(pjPath)) {
    try {
      const pj = JSON.parse(fs.readFileSync(pjPath, 'utf-8'));
      if (pj.framer) {
        pj.framer.projectUrl = projectUrl;
      } else {
        pj.framer = {
          templateUrl: templateUrl,
          projectUrl: projectUrl,
          customDomain: '',
        };
      }
      fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2) + '\n', 'utf-8');
    } catch {}
  }

  console.log(`  ✓ Framer project linked: ${projectUrl}`);
  return { projectUrl, apiKey };
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

  // Framer landing page (optional)
  console.log('\n  --- Landing Page (Framer) ---');
  console.log('  Provide a Framer template URL to set up a landing page.');
  console.log('  The app will deploy to app.{domain}, landing page to {domain}.');
  const framerTemplateUrl = await ask(rl, 'Framer template URL (Enter to skip)', '');
  let domain = '';
  if (framerTemplateUrl) {
    domain = await ask(rl, 'Production domain', `${slug}.com`);
  }
  console.log('');

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

  const useFramer = !!framerTemplateUrl;
  const totalSteps = useFramer ? 9 : 8;

  console.log(`
  ─────────────────────────────────────
  Summary
  ─────────────────────────────────────

  Project:      ${slug} (${displayName})
  Description:  ${description || '(none)'}
  GitHub:       ${username}/${slug}
`);

  if (useFramer) {
    console.log(`  Domain:       ${domain}`);
    console.log(`  Landing:      ${domain} → Framer`);
    console.log(`  App:          app.${domain} → Vercel`);
    console.log(`  Template:     ${framerTemplateUrl}`);
    console.log('');
  }

  console.log(`  Ports:
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

  let step = 0;
  const next = () => `[${++step}/${totalSteps}]`;

  console.log(`  ${next()} Updating config files...`);
  updateConfigToml(slug, ports);
  updateEnvFiles(slug, displayName, description, ports);

  console.log(`\n  ${next()} Installing ai-dev-system...`);
  const framerConfig = useFramer ? { templateUrl: framerTemplateUrl, domain } : null;
  installAiDevSystem(slug, description, framerConfig);

  console.log(`\n  ${next()} Configuring shadcnblocks...`);
  configureShadcnBlocks();

  console.log(`\n  ${next()} Installing dependencies...`);
  try {
    run('pnpm install', { silent: true });
    console.log('  ✓ pnpm install complete');
  } catch (e) {
    console.log('  ⚠ pnpm install failed — run it manually later');
  }

  console.log(`\n  ${next()} Initializing git...`);
  reinitGit(slug, displayName);

  console.log(`\n  ${next()} Creating GitHub repo...`);
  const githubUrl = createGithubRepo(username, slug);

  // Framer setup (interactive — opens browser, prompts for URL and API key)
  let framerResult = null;
  if (useFramer) {
    console.log(`\n  ${next()} Setting up Framer landing page...`);
    framerResult = await setupFramerInteractive(framerTemplateUrl, slug);
  }

  console.log(`\n  ${next()} Deploying to Vercel...`);
  const vercelUrl = deployVercel(slug);

  console.log(`\n  ${next()} Done!`);

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
  if (framerResult) {
    console.log(`  Framer:       ${framerResult.projectUrl}`);
  }

  if (useFramer) {
    console.log(`
  Domain Architecture:
    ${domain}         → Framer (landing page)
    app.${domain}     → Vercel (SaaS app)

  Next steps:
    1. pnpm supabase:web:start    Start local Supabase
    2. pnpm dev                   Start dev server
    3. Open Claude Code and run /kickoff or /vision
    4. Run /landing to customize your Framer landing page
    5. Configure custom domain in Framer (Site Settings > Custom Domain)
    6. Run /setup-makerkit for full Supabase + Vercel + DNS setup
`);
  } else {
    console.log(`
  Next steps:
    1. pnpm supabase:web:start    Start local Supabase
    2. pnpm dev                   Start dev server
    3. Open Claude Code and run /kickoff or /vision
`);
  }
}

main().catch((e) => {
  console.error(`\n  ❌ Setup failed: ${e.message}\n`);
  process.exit(1);
});
