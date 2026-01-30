#!/usr/bin/env node

/**
 * AI Development System - Interactive Setup
 *
 * Run this after installing the system to configure it for your project.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt, defaultValue = '') {
  const displayPrompt = defaultValue ? `${prompt} [${defaultValue}]: ` : `${prompt}: `;
  return new Promise((resolve) => {
    rl.question(displayPrompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function banner() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           AI Development System - Setup                       ║
║                                                               ║
║  This will configure the system for your project.             ║
║  You'll need:                                                 ║
║    • Linear team name and IDs                                 ║
║    • Google Drive Roadmap document ID                         ║
║    • Your project's testing commands                          ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

async function main() {
  banner();

  // Project basics
  console.log('\n📦 Project Configuration\n');
  const projectName = await question('Project name');
  const projectDescription = await question('One-line description');

  // Linear configuration
  console.log('\n📋 Linear Configuration\n');
  console.log('(Get team ID from Linear → Settings → Team → copy ID)');
  console.log('(Get initiative ID by clicking the initiative in Linear)\n');

  const linearTeam = await question('Linear team name');
  const linearTeamId = await question('Linear team ID (UUID)');
  const linearInitiative = await question('Current initiative name', `Roadmap | ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
  const linearInitiativeId = await question('Initiative ID (UUID, or leave blank)', '');

  // Google Drive configuration
  console.log('\n📄 Google Drive Configuration\n');
  console.log('(Get document ID from URL: docs.google.com/document/d/[THIS-ID]/edit)\n');

  const roadmapDocId = await question('Roadmap document ID');
  const roadmapDocName = await question('Roadmap document name', `${projectName} Roadmap`);
  const driveFolderId = await question('Drive folder ID (optional)', '');

  // Documentation paths
  console.log('\n📚 Documentation Configuration\n');
  const docsRoot = await question('Documentation folder path', 'docs');

  // Testing commands
  console.log('\n🧪 Testing Commands\n');
  console.log('(Enter your project\'s test commands, or press Enter for defaults)\n');

  const testFull = await question('Full test suite command', 'npm run test');
  const testTypecheck = await question('Typecheck command', 'npm run typecheck');
  const testLint = await question('Lint command', 'npm run lint');
  const testFormat = await question('Format command', 'npm run format');
  const testE2e = await question('E2E test command', 'npm run test:e2e');

  // Git configuration
  console.log('\n🔀 Git Configuration\n');
  const gitMainBranch = await question('Main branch name', 'main');
  const gitBranchPrefix = await question('Feature branch prefix', `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}/`);

  // Build the config
  const config = {
    name: projectName,
    description: projectDescription,

    linear: {
      team: linearTeam,
      teamId: linearTeamId,
      currentInitiative: linearInitiative,
      ...(linearInitiativeId && { initiativeId: linearInitiativeId })
    },

    drive: {
      roadmapDocId: roadmapDocId,
      roadmapDocName: roadmapDocName,
      ...(driveFolderId && { folderId: driveFolderId })
    },

    documentation: {
      root: docsRoot,
      master: `${docsRoot}/MASTER.md`,
      chapters: `${docsRoot}/chapters`,
      workflows: `${docsRoot}/workflows`
    },

    testing: {
      full: testFull,
      typecheck: testTypecheck,
      lint: testLint,
      format: testFormat,
      e2e: testE2e,
      quick: `${testTypecheck} && ${testLint}`
    },

    git: {
      mainBranch: gitMainBranch,
      branchPrefix: gitBranchPrefix,
      remote: 'origin'
    }
  };

  // Write project.json
  const claudeDir = path.dirname(__dirname);
  const projectJsonPath = path.join(claudeDir, 'project.json');

  fs.writeFileSync(projectJsonPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Created ${projectJsonPath}`);

  // Create documentation structure
  const projectRoot = path.dirname(claudeDir);
  const docsPath = path.join(projectRoot, docsRoot);
  const chaptersPath = path.join(docsPath, 'chapters');
  const workflowsPath = path.join(docsPath, 'workflows');
  const archivedPath = path.join(docsPath, 'archived');

  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
    console.log(`✅ Created ${docsPath}`);
  }
  if (!fs.existsSync(chaptersPath)) {
    fs.mkdirSync(chaptersPath, { recursive: true });
    console.log(`✅ Created ${chaptersPath}`);
  }
  if (!fs.existsSync(workflowsPath)) {
    fs.mkdirSync(workflowsPath, { recursive: true });
    console.log(`✅ Created ${workflowsPath}`);
  }
  if (!fs.existsSync(archivedPath)) {
    fs.mkdirSync(archivedPath, { recursive: true });
    console.log(`✅ Created ${archivedPath}`);
  }

  // Create MASTER.md if it doesn't exist
  const masterPath = path.join(docsPath, 'MASTER.md');
  if (!fs.existsSync(masterPath)) {
    const masterTemplate = fs.readFileSync(
      path.join(__dirname, 'templates', 'master.md'),
      'utf-8'
    ).replace(/\[Project Name\]/g, projectName)
     .replace(/\[YYYY-MM-DD\]/g, new Date().toISOString().split('T')[0]);

    fs.writeFileSync(masterPath, masterTemplate);
    console.log(`✅ Created ${masterPath}`);
  }

  // Copy skills to .claude/skills
  const skillsSourceDir = path.join(__dirname, 'skills');
  const skillsDestDir = path.join(claudeDir, 'skills');

  if (!fs.existsSync(skillsDestDir)) {
    fs.mkdirSync(skillsDestDir, { recursive: true });
  }

  const skillFiles = fs.readdirSync(skillsSourceDir);
  for (const file of skillFiles) {
    const source = path.join(skillsSourceDir, file);
    const dest = path.join(skillsDestDir, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
      console.log(`✅ Copied skill: ${file}`);
    }
  }

  // Summary
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    Setup Complete! 🎉                         ║
╚═══════════════════════════════════════════════════════════════╝

Next steps:

1. Configure Claude Code MCP servers (if not already done):
   - Add google-drive MCP server with your service account
   - Add linear MCP server with your API key

2. Create your Roadmap document:
   - Copy template from .claude/templates/roadmap.md
   - Share the Google Doc with your service account

3. Set up Linear:
   - Create team "${linearTeam}" (if needed)
   - Create initiative "${linearInitiative}"
   - Create projects matching your Roadmap

4. Test the setup:
   $ claude
   > /sync

5. Start working:
   > /vision   (to plan)
   > /dev      (to code)

Documentation: .claude/SYSTEM.md
`);

  rl.close();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  rl.close();
  process.exit(1);
});
