#!/usr/bin/env node

/**
 * setup-nativeexpress.js
 *
 * Automated setup for new mobile app projects.
 * Creates a project with:
 *   - apps/  — NativeExpress (Expo + React Native + Supabase) mobile app
 *   - landing/ — Magic UI mobile landing page (Next.js)
 *
 * What it does:
 *   1. Asks for project details (name, domain, team, etc.)
 *   2. Clones NativeExpress fresh from GitHub into apps/
 *   3. Copies the Magic UI mobile template into landing/
 *   4. Updates all config files (config.js, .env, supabase/config.toml)
 *   5. Patches AI edge functions to use OpenRouter
 *   6. Auto-detects next available Supabase port range
 *   7. Installs ai-dev-system (skills, commands, documentation)
 *   8. Installs dependencies
 *   9. Re-initializes git with a fresh history
 *  10. Creates a private GitHub repo and pushes
 *  11. Deploys landing page to Vercel (if CLI available)
 *
 * Usage:
 *   mkdir my-app && cd my-app
 *   node /path/to/setup-nativeexpress.js
 *   npx create-ai-dev --nativeexpress
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NATIVEEXPRESS_REPO = 'https://github.com/robinfaraj/nativeexpress.git';

const MAGICUI_TEMPLATE_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  'Cursor',
  'perfectlyhuman',
  'magicuidesign-mobile-template',
);

const TEAMS = {
  perfectlyhuman: {
    name: 'Perfectly Human LLC',
    bundlePrefix: 'com.perfectlyhuman',
    appleTeamId: 'GNNA76QH2C',
    expoOwner: 'perfectlyhuman',
  },
};

// Default Supabase local dev anon key (same for all local instances)
const LOCAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const projectRoot = process.cwd();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: opts.cwd || projectRoot,
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...opts,
    });
  } catch (e) {
    if (opts.ignoreError) return null;
    throw e;
  }
}

function runSilent(cmd, cwd) {
  return run(cmd, { silent: true, ignoreError: true, cwd });
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

function toBundleId(slug) {
  // Bundle IDs: no hyphens, lowercase, alphanumeric + dots only
  return slug.replace(/-/g, '').toLowerCase();
}

// ---------------------------------------------------------------------------
// Port detection (shared with Makerkit projects)
// ---------------------------------------------------------------------------

function detectUsedProjectNumbers() {
  const parentDir = path.dirname(projectRoot);
  const used = new Set();

  // Paths where Supabase config.toml might live in sibling projects
  const configPathPatterns = [
    ['apps', 'web', 'supabase', 'config.toml'], // Makerkit
    ['apps', 'supabase', 'config.toml'], // NativeExpress
    ['supabase', 'config.toml'], // Direct
  ];

  try {
    const siblings = fs.readdirSync(parentDir);
    for (const dir of siblings) {
      if (dir === path.basename(projectRoot)) continue;
      for (const pattern of configPathPatterns) {
        const configPath = path.join(parentDir, dir, ...pattern);
        try {
          const content = fs.readFileSync(configPath, 'utf-8');
          const match = content.match(/\[api\][\s\S]*?port\s*=\s*(\d+)/);
          if (match) {
            const apiPort = parseInt(match[1], 10);
            const projectNum = Math.round((apiPort - 54321) / 10);
            if (projectNum >= 0 && projectNum < 100) {
              used.add(projectNum);
            }
          }
        } catch {
          // Not a matching project — skip
        }
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
    landing: 3000 + projectNumber, // Next.js landing page port
  };
}

// ---------------------------------------------------------------------------
// File modification
// ---------------------------------------------------------------------------

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(
      `  ⚠ Skipped ${path.relative(projectRoot, filePath)} (not found)`,
    );
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  for (const [search, replace] of replacements) {
    const before = content;
    if (search instanceof RegExp) {
      content = content.replace(search, replace);
    } else {
      content = content.split(search).join(replace);
    }
    if (content !== before) changed = true;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return changed;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      // Skip node_modules, .git, .next, out, ios, android build artifacts
      if (
        [
          'node_modules',
          '.git',
          '.next',
          'out',
          '.expo',
          '.turbo',
        ].includes(child)
      )
        continue;
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// ---------------------------------------------------------------------------
// Clone NativeExpress
// ---------------------------------------------------------------------------

function cloneNativeExpress() {
  const appsDir = path.join(projectRoot, 'apps');

  if (fs.existsSync(appsDir) && fs.readdirSync(appsDir).length > 0) {
    console.log('  ⚠ apps/ directory already exists and is not empty — skipping clone');
    return appsDir;
  }

  try {
    run(`git clone ${NATIVEEXPRESS_REPO} apps`, { silent: true });
    // Remove the template's git history
    const gitDir = path.join(appsDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }
    console.log('  ✓ Cloned NativeExpress into apps/');
  } catch (e) {
    console.log(`  ✗ Failed to clone NativeExpress: ${e.message}`);
    console.log(`    Manual: git clone ${NATIVEEXPRESS_REPO} apps`);
    process.exit(1);
  }

  return appsDir;
}

// ---------------------------------------------------------------------------
// Copy Magic UI landing template
// ---------------------------------------------------------------------------

function copyLandingTemplate() {
  const landingDir = path.join(projectRoot, 'landing');

  if (fs.existsSync(landingDir) && fs.readdirSync(landingDir).length > 0) {
    console.log('  ⚠ landing/ directory already exists and is not empty — skipping copy');
    return landingDir;
  }

  // Validate template exists and has content
  if (!fs.existsSync(MAGICUI_TEMPLATE_DIR)) {
    console.log(`  ✗ Magic UI template not found at: ${MAGICUI_TEMPLATE_DIR}`);
    console.log('    Please populate this directory with the Magic UI mobile template first.');
    process.exit(1);
  }

  const templateFiles = fs.readdirSync(MAGICUI_TEMPLATE_DIR);
  if (templateFiles.length === 0) {
    console.log(`  ✗ Magic UI template directory is empty: ${MAGICUI_TEMPLATE_DIR}`);
    console.log('    Please populate it with the paid Magic UI mobile template first.');
    console.log('    Download from: https://magicui.design/docs/templates/mobile');
    process.exit(1);
  }

  copyRecursive(MAGICUI_TEMPLATE_DIR, landingDir);
  console.log('  ✓ Copied Magic UI template into landing/');

  return landingDir;
}

// ---------------------------------------------------------------------------
// Update NativeExpress config.js
// ---------------------------------------------------------------------------

function updateNativeExpressConfig(appsDir, slug, displayName, team) {
  const configPath = path.join(appsDir, 'config.js');
  if (!fs.existsSync(configPath)) {
    // Try config.ts
    const tsPath = path.join(appsDir, 'config.ts');
    if (fs.existsSync(tsPath)) {
      return updateNativeExpressConfig_file(tsPath, slug, displayName, team);
    }
    console.log('  ⚠ config.js/config.ts not found in apps/ — skipping');
    return;
  }
  updateNativeExpressConfig_file(configPath, slug, displayName, team);
}

function updateNativeExpressConfig_file(configPath, slug, displayName, team) {
  let content = fs.readFileSync(configPath, 'utf-8');
  const bundleId = `${team.bundlePrefix}.${toBundleId(slug)}`;

  const replacements = [
    // App name
    [/appName:\s*["'].*?["']/, `appName: "${displayName}"`],
    // Expo owner
    [/owner:\s*["'].*?["']/, `owner: "${team.expoOwner}"`],
    // Slug (first occurrence — the app slug)
    [/slug:\s*["'].*?["']/, `slug: "${slug}"`],
    // Scheme (deep linking)
    [/scheme:\s*["'].*?["']/, `scheme: "${slug}"`],
    // iOS bundle identifier
    [
      /iosBundleIdentifier:\s*["'].*?["']/,
      `iosBundleIdentifier: "${bundleId}"`,
    ],
    // Android package name
    [
      /androidPackageName:\s*["'].*?["']/,
      `androidPackageName: "${bundleId}"`,
    ],
  ];

  let changed = false;
  for (const [search, replace] of replacements) {
    const before = content;
    content = content.replace(search, replace);
    if (content !== before) changed = true;
  }

  if (changed) {
    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`  ✓ ${path.relative(projectRoot, configPath)}`);
  } else {
    console.log(
      `  ⚠ No changes made to ${path.relative(projectRoot, configPath)} — template structure may have changed`,
    );
  }
}

// ---------------------------------------------------------------------------
// Update NativeExpress .env
// ---------------------------------------------------------------------------

function updateNativeExpressEnv(appsDir, ports) {
  const envExamplePath = path.join(appsDir, '.env.example');
  const envPath = path.join(appsDir, '.env');

  let content = '';
  if (fs.existsSync(envExamplePath)) {
    content = fs.readFileSync(envExamplePath, 'utf-8');
  } else {
    // Create from scratch if no .env.example
    content = `# SUPABASE
EXPO_PUBLIC_SUPABASE_URL=""
EXPO_PUBLIC_SUPABASE_ANON_KEY=""
EXPO_PUBLIC_SUPABASE_BUCKET_NAME="avatars"

# REVENUE CAT - PAYMENT (optional)
EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE=""

# SENTRY - ERROR TRACKING (optional)
EXPO_PUBLIC_SENTRY_DSN=""
EXPO_PUBLIC_SENTRY_URL=""
EXPO_PUBLIC_SENTRY_PROJECT=""
EXPO_PUBLIC_SENTRY_ORGANIZATION=""

# ONE SIGNAL - PUSH NOTIFICATIONS (optional)
EXPO_PUBLIC_ONE_SIGNAL_APP_ID=""

# POSTHOG - TRACKING (optional)
EXPO_PUBLIC_POSTHOG_HOST=""
EXPO_PUBLIC_POSTHOG_API_KEY=""
`;
  }

  // Set Supabase local dev values
  content = content.replace(
    /EXPO_PUBLIC_SUPABASE_URL=.*/,
    `EXPO_PUBLIC_SUPABASE_URL="http://127.0.0.1:${ports.api}"`,
  );
  content = content.replace(
    /EXPO_PUBLIC_SUPABASE_ANON_KEY=.*/,
    `EXPO_PUBLIC_SUPABASE_ANON_KEY="${LOCAL_SUPABASE_ANON_KEY}"`,
  );

  // Add OpenRouter section if not present
  if (!content.includes('OPENROUTER')) {
    content += `
# OPENROUTER - AI Model Gateway (https://openrouter.ai)
# Replaces direct OpenAI usage — switch models via OPENROUTER_DEFAULT_MODEL
OPENROUTER_API_KEY=""
OPENROUTER_DEFAULT_MODEL="anthropic/claude-sonnet-4-20250514"
`;
  }

  fs.writeFileSync(envPath, content, 'utf-8');
  console.log('  ✓ apps/.env (local dev Supabase + OpenRouter)');
}

// ---------------------------------------------------------------------------
// Update Supabase config.toml
// ---------------------------------------------------------------------------

function updateSupabaseConfig(appsDir, slug, ports) {
  const configPath = path.join(appsDir, 'supabase', 'config.toml');
  if (!fs.existsSync(configPath)) {
    console.log('  ⚠ supabase/config.toml not found — skipping port config');
    return;
  }

  let content = fs.readFileSync(configPath, 'utf-8');

  // Project ID
  content = content.replace(
    /project_id\s*=\s*"[^"]*"/,
    `project_id = "${slug}"`,
  );

  // Ports — replace section by section
  content = content.replace(
    /(\[api\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.api}`,
  );
  content = content.replace(
    /(\[db\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.db}`,
  );
  content = content.replace(
    /(\[studio\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.studio}`,
  );
  content = content.replace(
    /(\[inbucket\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.inbucket}`,
  );
  content = content.replace(
    /smtp_port\s*=\s*\d+/,
    `smtp_port = ${ports.smtp}`,
  );
  content = content.replace(
    /pop3_port\s*=\s*\d+/,
    `pop3_port = ${ports.pop3}`,
  );
  content = content.replace(
    /(\[analytics\][\s\S]*?)port\s*=\s*\d+/,
    `$1port = ${ports.analytics}`,
  );

  fs.writeFileSync(configPath, content, 'utf-8');
  console.log('  ✓ apps/supabase/config.toml');
}

// ---------------------------------------------------------------------------
// Patch OpenAI → OpenRouter in edge functions
// ---------------------------------------------------------------------------

function patchOpenRouter(appsDir) {
  // Look for the OpenAI utility file in edge functions
  const possiblePaths = [
    path.join(appsDir, 'supabase', 'functions', '_utils', 'openai.ts'),
    path.join(appsDir, 'supabase', 'functions', '_shared', 'openai.ts'),
  ];

  let utilsPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      utilsPath = p;
      break;
    }
  }

  if (!utilsPath) {
    console.log('  ⚠ OpenAI edge function utils not found — skipping OpenRouter patch');
    console.log('    Manually configure OpenRouter in your Supabase edge functions');
    return;
  }

  let content = fs.readFileSync(utilsPath, 'utf-8');
  let changed = false;

  // Replace OPENAI_API_KEY with OPENROUTER_API_KEY
  if (content.includes('OPENAI_API_KEY')) {
    content = content.replace(
      /Deno\.env\.get\(["']OPENAI_API_KEY["']\)/g,
      'Deno.env.get("OPENROUTER_API_KEY")',
    );
    changed = true;
  }

  // Add baseURL for OpenRouter if not already present
  if (changed && !content.includes('openrouter.ai')) {
    // Try to add baseURL to the OpenAI constructor
    content = content.replace(
      /(new\s+OpenAI\s*\(\s*\{)/,
      '$1\n  baseURL: "https://openrouter.ai/api/v1",',
    );
  }

  if (changed) {
    fs.writeFileSync(utilsPath, content, 'utf-8');
    console.log(`  ✓ ${path.relative(projectRoot, utilsPath)} (OpenRouter patch)`);
  }

  // Patch the call-llm function to use configurable model
  const callLlmPaths = [
    path.join(appsDir, 'supabase', 'functions', 'call-llm', 'index.ts'),
  ];

  for (const llmPath of callLlmPaths) {
    if (!fs.existsSync(llmPath)) continue;

    let llmContent = fs.readFileSync(llmPath, 'utf-8');
    // Replace hardcoded model with env var
    const modelMatch = llmContent.match(/model:\s*["'](gpt-[^"']+)["']/);
    if (modelMatch) {
      llmContent = llmContent.replace(
        /model:\s*["']gpt-[^"']+["']/,
        'model: Deno.env.get("OPENROUTER_DEFAULT_MODEL") || "anthropic/claude-sonnet-4-20250514"',
      );
      fs.writeFileSync(llmPath, llmContent, 'utf-8');
      console.log(`  ✓ ${path.relative(projectRoot, llmPath)} (configurable model)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Update landing page config
// ---------------------------------------------------------------------------

function updateLandingConfig(landingDir, slug, displayName, description, domain) {
  // Update package.json name
  const pkgPath = path.join(landingDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      pkg.name = `${slug}-landing`;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
      console.log('  ✓ landing/package.json');
    } catch (e) {
      console.log(`  ⚠ Failed to update landing package.json: ${e.message}`);
    }
  }

  // Search for site config / constants files and update them
  const configCandidates = [
    'config/site.ts',
    'config/site.js',
    'lib/config.ts',
    'lib/config.js',
    'lib/site.ts',
    'src/config.ts',
    'constants.ts',
    'config.ts',
  ];

  for (const candidate of configCandidates) {
    const filePath = path.join(landingDir, candidate);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Replace common site config patterns
    const patterns = [
      [/name:\s*["'].*?["']/, `name: "${displayName}"`],
      [/title:\s*["'].*?["']/, `title: "${displayName}"`],
      [/description:\s*["'].*?["']/, `description: "${description || displayName + ' mobile app'}"`],
      [/url:\s*["']https?:\/\/[^"']*["']/, `url: "https://${domain}"`],
    ];

    for (const [search, replace] of patterns) {
      const before = content;
      content = content.replace(search, replace);
      if (content !== before) modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ landing/${candidate}`);
    }
  }

  // Update layout.tsx metadata if present
  const layoutCandidates = [
    'app/layout.tsx',
    'app/layout.ts',
    'src/app/layout.tsx',
  ];

  for (const candidate of layoutCandidates) {
    const filePath = path.join(landingDir, candidate);
    if (!fs.existsSync(filePath)) continue;

    if (
      replaceInFile(filePath, [
        [/title:\s*["'].*?["']/, `title: "${displayName}"`],
        [
          /description:\s*["'].*?["']/,
          `description: "${description || displayName + ' - Download the app'}"`,
        ],
      ])
    ) {
      console.log(`  ✓ landing/${candidate}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Create root project structure
// ---------------------------------------------------------------------------

function createRootProject(slug, displayName, description) {
  // Root .gitignore
  const gitignorePath = path.join(projectRoot, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(
      gitignorePath,
      `# Dependencies
node_modules/

# Build artifacts
.next/
out/
.expo/
dist/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel/

# Supabase
supabase/.temp/
`,
      'utf-8',
    );
  }

  // Root README
  const readmePath = path.join(projectRoot, 'README.md');
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      `# ${displayName}

${description || `${displayName} mobile application.`}

## Structure

- \`apps/\` — Mobile app (Expo + React Native + Supabase)
- \`landing/\` — Landing page (Next.js + Magic UI)

## Quick Start

### Mobile App
\`\`\`bash
cd apps
npm install
npx expo start
\`\`\`

### Landing Page
\`\`\`bash
cd landing
pnpm install
pnpm dev
\`\`\`

## Deployment

- **Landing Page**: Deployed to Vercel
- **Mobile App**: Built via EAS Build, deployed to App Store / Google Play
`,
      'utf-8',
    );
  }
}

// ---------------------------------------------------------------------------
// ai-dev-system installation
// ---------------------------------------------------------------------------

function installAiDevSystem(slug, description) {
  const packageDir = path.dirname(__filename);
  const soloDir = path.join(packageDir, 'solo');

  if (fs.existsSync(soloDir)) {
    copyRecursive(
      path.join(soloDir, '.claude'),
      path.join(projectRoot, '.claude'),
    );
    copyRecursive(
      path.join(soloDir, 'documentation'),
      path.join(projectRoot, 'documentation'),
    );
  } else {
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

  fs.mkdirSync(path.join(projectRoot, 'documentation', 'archived'), {
    recursive: true,
  });

  // Write project.json tailored for nativeexpress projects
  const projectJsonPath = path.join(projectRoot, '.claude', 'project.json');
  const projectJson = {
    name: slug,
    description: description || `${slug} mobile application`,
    template: 'nativeexpress',
    documentation: {
      root: 'documentation',
      master: 'documentation/MASTER.md',
      roadmap: 'documentation/ROADMAP.md',
      chapters: 'documentation/chapters',
      workflows: 'documentation/workflows',
    },
    testing: {
      lint: 'cd apps && npx expo lint',
      typecheck: 'cd apps && npx tsc --noEmit',
      quick: 'cd apps && npx expo lint && npx tsc --noEmit',
    },
    git: {
      mainBranch: 'main',
      previewBranch: 'preview',
      branchPrefix: '',
      remote: 'origin',
    },
    paths: {
      app: 'apps',
      landing: 'landing',
      database: 'apps/supabase',
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
  const gitDir = path.join(projectRoot, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  run('git init', { silent: true });
  run('git add .', { silent: true });
  run(
    `git commit -m "Initial commit: ${displayName} (NativeExpress + Magic UI)"`,
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

function deployVercel(slug, landingDir) {
  if (!hasCommand('vercel')) {
    console.log('  ⚠ Vercel CLI not found — skipping landing page deployment');
    console.log('    Install: npm i -g vercel');
    return null;
  }

  try {
    // Link the landing directory to Vercel
    run(`vercel link --yes -p ${slug}-landing`, {
      silent: true,
      cwd: landingDir,
    });
    console.log(`  ✓ Vercel project linked: ${slug}-landing`);
    return `https://${slug}-landing.vercel.app`;
  } catch (e) {
    console.log(`  ⚠ Vercel linking failed: ${e.message}`);
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
  ║   NativeExpress Project Setup       ║
  ║   Mobile App + Landing Page         ║
  ║   Powered by ai-dev-system          ║
  ╚══════════════════════════════════════╝
`);

  // ---------------------------------------------------------------------------
  // Detect defaults
  // ---------------------------------------------------------------------------

  const dirName = path.basename(projectRoot);
  const defaultSlug = toSlug(dirName);

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

  const usedNumbers = detectUsedProjectNumbers();
  const suggestedNumber = suggestProjectNumber(usedNumbers);

  // List available teams
  const teamKeys = Object.keys(TEAMS);
  const defaultTeam = teamKeys[0];

  // ---------------------------------------------------------------------------
  // Prompts
  // ---------------------------------------------------------------------------

  const slug = toSlug(await ask(rl, 'Project slug', defaultSlug));
  const displayName = await ask(rl, 'Display name', toTitleCase(slug));
  const description = await ask(rl, 'Short description (optional)', '');
  const domain = await ask(rl, 'Landing page domain', `${slug}.com`);

  // Team selection
  let teamKey = defaultTeam;
  if (teamKeys.length > 1) {
    console.log(
      `\n  Available teams: ${teamKeys.map((k) => `${k} (${TEAMS[k].name})`).join(', ')}`,
    );
    teamKey = await ask(rl, 'Team', defaultTeam);
  } else {
    console.log(`  Team: ${TEAMS[defaultTeam].name}`);
  }
  const team = TEAMS[teamKey] || TEAMS[defaultTeam];
  const bundleId = `${team.bundlePrefix}.${toBundleId(slug)}`;

  const username = await ask(rl, 'GitHub username', defaultUsername);

  const usedStr =
    usedNumbers.size > 0
      ? ` (used: ${[...usedNumbers].sort((a, b) => a - b).join(', ')})`
      : '';
  const projectNumStr = await ask(
    rl,
    `Supabase port group${usedStr}`,
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
  Domain:       ${domain}
  Team:         ${team.name}
  Bundle ID:    ${bundleId}
  Apple Team:   ${team.appleTeamId}
  GitHub:       ${username}/${slug}

  Ports:
    Supabase API:     ${ports.api}
    Supabase DB:      ${ports.db}
    Supabase Studio:  ${ports.studio}
    Inbucket (email): ${ports.inbucket}
    SMTP:             ${ports.smtp}
    Landing (Next.js):${ports.landing}

  ─────────────────────────────────────
`);

  // ---------------------------------------------------------------------------
  // Execute
  // ---------------------------------------------------------------------------

  console.log('  [1/10] Cloning NativeExpress template...');
  const appsDir = cloneNativeExpress();

  console.log('\n  [2/10] Copying landing page template...');
  const landingDir = copyLandingTemplate();

  console.log('\n  [3/10] Updating NativeExpress config...');
  updateNativeExpressConfig(appsDir, slug, displayName, team);
  updateNativeExpressEnv(appsDir, ports);
  updateSupabaseConfig(appsDir, slug, ports);

  console.log('\n  [4/10] Patching AI for OpenRouter...');
  patchOpenRouter(appsDir);

  console.log('\n  [5/10] Updating landing page config...');
  updateLandingConfig(landingDir, slug, displayName, description, domain);

  console.log('\n  [6/10] Creating project structure...');
  createRootProject(slug, displayName, description);

  console.log('\n  [7/10] Installing ai-dev-system...');
  installAiDevSystem(slug, description);

  console.log('\n  [8/10] Installing dependencies...');
  // Detect package manager for each subdir
  const appsLock = fs.existsSync(path.join(appsDir, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : fs.existsSync(path.join(appsDir, 'yarn.lock'))
      ? 'yarn'
      : 'npm';
  const landingLock = fs.existsSync(path.join(landingDir, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : fs.existsSync(path.join(landingDir, 'yarn.lock'))
      ? 'yarn'
      : 'npm';

  try {
    run(`${appsLock} install`, { silent: true, cwd: appsDir });
    console.log(`  ✓ apps/ (${appsLock} install)`);
  } catch {
    console.log(`  ⚠ apps/ install failed — run \`${appsLock} install\` in apps/ manually`);
  }

  try {
    run(`${landingLock} install`, { silent: true, cwd: landingDir });
    console.log(`  ✓ landing/ (${landingLock} install)`);
  } catch {
    console.log(`  ⚠ landing/ install failed — run \`${landingLock} install\` in landing/ manually`);
  }

  console.log('\n  [9/10] Initializing git & GitHub...');
  reinitGit(slug, displayName);
  const githubUrl = createGithubRepo(username, slug);

  console.log('\n  [10/10] Deploying landing page to Vercel...');
  const vercelUrl = deployVercel(slug, landingDir);

  // ---------------------------------------------------------------------------
  // Final summary
  // ---------------------------------------------------------------------------

  console.log(`
  ╔══════════════════════════════════════╗
  ║   ✅ Setup Complete!                 ║
  ╚══════════════════════════════════════╝

  Project:    ${slug} (${displayName})
  Bundle ID:  ${bundleId}
  Domain:     ${domain}
  Ports:      Supabase ${ports.api}-${ports.analytics} | Landing ${ports.landing}

  Local Dev:
    Mobile:       cd apps && npx expo start
    Supabase:     cd apps && npx supabase start
    Studio:       http://localhost:${ports.studio}
    Landing:      cd landing && ${landingLock} dev
`);

  if (githubUrl) console.log(`  GitHub:       ${githubUrl}`);
  if (vercelUrl) console.log(`  Vercel:       ${vercelUrl}`);

  console.log(`
  Next steps:
    1. cd apps && npx supabase start     Start local Supabase
    2. cd apps && npx expo start          Start Expo dev server
    3. Run /setup-nativeexpress in Claude Code for full cloud setup:
       - Create production Supabase project
       - Create EAS project & configure builds
       - Deploy landing page to Vercel with env vars
       - Configure Cloudflare DNS
       - Register iOS bundle ID with Apple
    4. Run /kickoff for product discovery, or /vision to plan
`);
}

main().catch((e) => {
  console.error(`\n  ✗ Setup failed: ${e.message}\n`);
  process.exit(1);
});
