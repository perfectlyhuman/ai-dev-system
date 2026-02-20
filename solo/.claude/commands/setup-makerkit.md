---
description: "Set up a new Makerkit project: rename, configure ports, deploy to Supabase + Vercel + custom domain"
---

# /setup-makerkit - New Project Setup

You are setting up a freshly cloned Makerkit template as a new project. This is a guided, interactive process that automates everything the user would normally do manually.

## What This Does

1. Renames the project across all config files
2. Assigns unique local dev ports (so multiple Makerkit projects can run simultaneously)
3. Installs the ai-dev-system (skills, commands, documentation)
4. Reinitializes git with a clean history
5. Creates a private GitHub repo and pushes
6. Creates a production Supabase project, links it, and pushes migrations
7. Deploys to Vercel with all required env vars
8. Adds custom domain to Vercel and configures Cloudflare DNS automatically

---

## Step 1: Gather Information

Ask the user these questions using AskUserQuestion (or conversationally):

1. **Project slug** — lowercase, hyphenated (e.g., "intent-post")
   - Default: derive from current directory name
2. **Display name** — human-readable (e.g., "IntentPost")
   - Default: title-case of slug
3. **Domain** — production domain (e.g., "intentpost.com")
   - Default: `{slug}.com`
   - This drives: EMAIL_SENDER, NEXT_PUBLIC_SITE_URL (production), Vercel custom domain, Supabase auth redirect URLs
4. **Short description** — one sentence (optional, can be added later)
5. **GitHub username** — for repo creation
   - Auto-detect: run `gh api user -q .login`

## Step 2: Detect Available CLIs and Scopes

Run these checks in parallel to understand what automation is possible:

```bash
# Check CLIs
gh auth status
supabase --version
vercel --version
stripe --version  # for future /setup-stripe

# Detect GitHub user
gh api user -q .login

# Detect Vercel scopes
vercel teams ls  # Parse output to get team names and IDs

# Detect Supabase orgs
supabase orgs list  # Parse to get org names and IDs
```

If Vercel has multiple scopes, ask the user which one to use.
If Supabase has multiple orgs, ask the user which one to use.
Also ask which Supabase region (default: us-east-1).

## Step 3: Detect Port Range

Scan sibling directories for other Makerkit projects to avoid port conflicts.

```bash
# For each sibling directory, check if it has a Supabase config
# Read the API port from apps/web/supabase/config.toml
# Calculate which "project numbers" are already taken
```

**Port formula:** Each project gets a number (0, 1, 2, 3...). Ports shift by `number * 10`:

| Service | Formula | Default (0) | Example (1) |
|---------|---------|-------------|-------------|
| Supabase API | 54321 + N*10 | 54321 | 54331 |
| Supabase DB | 54322 + N*10 | 54322 | 54332 |
| Supabase Studio | 54323 + N*10 | 54323 | 54333 |
| Inbucket Web | 54324 + N*10 | 54324 | 54334 |
| Inbucket SMTP | 54325 + N*10 | 54325 | 54335 |
| Inbucket POP3 | 54326 + N*10 | 54326 | 54336 |
| Analytics | 54327 + N*10 | 54327 | 54337 |
| Next.js | 3000 + N | 3000 | 3001 |

Present the suggested port group number and let the user confirm or override.

## Step 4: Present Summary

Before making any changes, show the user exactly what will be modified:

```
## Setup Summary

**Project**: {slug} ({displayName})
**Domain**: {domain}
**Description**: {description}
**GitHub**: {username}/{slug}
**Port group**: {N} (Supabase {apiPort}-{analyticsPort}, Next.js {nextPort})
**Vercel scope**: {vercelScope}
**Supabase org**: {supabaseOrg} ({supabaseRegion})

### Files to modify:
- apps/web/supabase/config.toml — project_id + 7 ports + auth URLs
- apps/web/.env — site URL, product name, title, description
- apps/web/.env.development — Supabase URL, email port, sender
- apps/web/.env.test — Supabase URL, email port
- package.json — name field

### Files to create/update:
- .claude/project.json
- documentation/MASTER.md, ROADMAP.md

### Remote services:
- GitHub: private repo {username}/{slug}
- Supabase: production project in {supabaseOrg} ({supabaseRegion})
- Vercel: deploy under {vercelScope}, custom domain {domain}
```

**Wait for user confirmation before proceeding.**

## Step 5: Modify Config Files

Make these exact replacements:

### `apps/web/supabase/config.toml`
- `project_id = "next-supabase-saas-kit-turbo"` → `project_id = "{slug}"`
- `[api]` section: `port = 54321` → `port = {apiPort}`
- `[db]` section: `port = 54322` → `port = {dbPort}`
- `[studio]` section: `port = 54323` → `port = {studioPort}`
- `[inbucket]` section: `port = 54324` → `port = {inbucketPort}`
- `smtp_port = 54325` → `smtp_port = {smtpPort}`
- `pop3_port = 54326` → `pop3_port = {pop3Port}`
- `[analytics]` section: `port = 54327` → `port = {analyticsPort}`
- Replace ALL `localhost:3000` with `localhost:{nextPort}` (catches site_url + redirect URLs)
- Replace ALL `Makerkit` with `{displayName}` (catches email template subjects)

### `apps/web/.env`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000` → `http://localhost:{nextPort}`
- `NEXT_PUBLIC_PRODUCT_NAME=Makerkit` → `{displayName}`
- `NEXT_PUBLIC_SITE_TITLE="Makerkit - ..."` → `"{displayName} - {description}"` (or just `"{displayName}"` if no description)
- `NEXT_PUBLIC_SITE_DESCRIPTION="Makerkit is ..."` → `"{description}"` (or `"{displayName}"` if no description)

### `apps/web/.env.development`
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` → `http://127.0.0.1:{apiPort}`
- `EMAIL_PORT=54325` → `EMAIL_PORT={smtpPort}`
- `EMAIL_SENDER="Makerkit <admin@makerkit.dev>"` → `"{displayName} <noreply@{domain}>"`
- **Append** at end: `PORT={nextPort}` (only if nextPort != 3000)

### `apps/web/.env.test`
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` → `http://127.0.0.1:{apiPort}`
- `EMAIL_PORT=54325` → `EMAIL_PORT={smtpPort}`

### `package.json` (root)
- `"name": "next-supabase-saas-kit-turbo"` → `"name": "{slug}"`

### `.claude/project.json`
- Update `name` and `description` fields

### `documentation/MASTER.md` and `documentation/ROADMAP.md`
- Replace all `next-supabase-saas-kit-turbo` with `{displayName}`

## Step 6: Install Dependencies

```bash
pnpm install
```

If this fails, note the error and continue — the user can fix it later.

## Step 7: Initialize Git

```bash
# Remove template git history
rm -rf .git

# Fresh start
git init
git add .
git commit -m "Initial commit: {displayName} from Makerkit template"
git branch -M main
```

## Step 8: Create GitHub Repo

```bash
gh repo create {username}/{slug} --private --source=. --remote=origin --push
```

If `gh` is not available, print instructions for manual repo creation and continue.

## Step 9: Create Production Supabase Project

```bash
# Create project with random DB password
supabase projects create {slug} \
  --org-id {supabaseOrgId} \
  --region {supabaseRegion} \
  --db-password "$(openssl rand -base64 32)"
```

If this fails due to project limits, inform the user and list their existing projects with `supabase projects list`. They need to delete/pause one or upgrade.

On success:
```bash
# Get the project reference ID from the output
# Link local to production
cd apps/web
supabase link --project-ref {projectRef}

# Push all migrations to production
echo "y" | supabase db push

# Get API keys
supabase projects api-keys --project-ref {projectRef}
```

Save these values:
- **Supabase URL**: `https://{projectRef}.supabase.co`
- **Publishable key**: the `default` key starting with `sb_publishable_`
- **Service role key**: the `service_role` JWT (the `sb_secret` key is masked by CLI, use the JWT instead)
- **Anon key**: the `anon` JWT

## Step 10: Deploy to Vercel

### 10a: Link and Configure Project

```bash
vercel link --yes --scope {vercelScope}
```

The Vercel CLI will create the project but with wrong settings (detects "Other" framework, root directory "."). Fix via the Vercel API:

```bash
# Read the Vercel auth token
VERCEL_TOKEN=$(node -e "const fs=require('fs'); const p=process.env.HOME+'/AppData/Roaming/com.vercel.cli/Data/auth.json'; const a=JSON.parse(fs.readFileSync(p,'utf8')); console.log(a.token)")

# Read projectId and orgId from .vercel/project.json
PROJECT_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')); console.log(d.projectId)")
ORG_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')); console.log(d.orgId)")

# Update project settings: root directory, framework, and name
curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/web","framework":"nextjs","name":"{slug}"}'
```

**Note**: If the name update fails with a "conflict" error, the name is already taken on Vercel — just update rootDirectory and framework without the name.

Also update `.vercel/project.json` locally to reflect the new project name.

### 10b: Set All Required Production Env Vars

These are ALL the env vars needed for a successful Makerkit production build. Set each one:

```bash
# Core app vars (NEXT_PUBLIC_ vars from .env are inherited, but SITE_URL must be HTTPS for production)
echo "https://{domain}" | vercel env add NEXT_PUBLIC_SITE_URL production --scope {vercelScope}

# Supabase vars
echo "https://{projectRef}.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --scope {vercelScope}
echo "{publishableKey}" | vercel env add NEXT_PUBLIC_SUPABASE_PUBLIC_KEY production --scope {vercelScope}
echo "{serviceRoleJwt}" | vercel env add SUPABASE_SECRET_KEY production --scope {vercelScope}
echo "{webhookSecret}" | vercel env add SUPABASE_DB_WEBHOOK_SECRET production --scope {vercelScope}  # generate with openssl rand -hex 32

# Email vars
echo "{displayName} <noreply@{domain}>" | vercel env add EMAIL_SENDER production --scope {vercelScope}
echo "resend" | vercel env add MAILER_PROVIDER production --scope {vercelScope}
echo "re_placeholder_setup_later" | vercel env add RESEND_API_KEY production --scope {vercelScope}

# Stripe vars (placeholders — replace with /setup-stripe later)
echo "sk_test_placeholder_setup_later" | vercel env add STRIPE_SECRET_KEY production --scope {vercelScope}
echo "whsec_placeholder_setup_later" | vercel env add STRIPE_WEBHOOK_SECRET production --scope {vercelScope}
```

### 10c: Deploy

```bash
vercel --prod --scope {vercelScope} --yes
```

This will take 2-3 minutes. Wait for it to complete and verify the build succeeds.

### 10d: Add Custom Domain

After a successful deployment:

```bash
vercel domains add {domain} --scope {vercelScope}
vercel domains add www.{domain} --scope {vercelScope}
```

### 10e: Configure Cloudflare DNS

The Cloudflare API token is stored at `~/.config/ai-dev-system/secrets.json` under the key `cloudflare_api_token`. Read it:

```bash
CF_TOKEN=$(node -e "const d=JSON.parse(require('fs').readFileSync(process.env.HOME+'/.config/ai-dev-system/secrets.json','utf8'));console.log(d.cloudflare_api_token)")
```

If the token is not found, ask the user to provide it. They can create one at https://dash.cloudflare.com/profile/api-tokens with **Zone > DNS > Edit** permission on **All zones**.

**Step 1: Look up the zone ID for the domain:**

```bash
curl -s "https://api.cloudflare.com/client/v4/zones?name={domain}" \
  -H "Authorization: Bearer $CF_TOKEN"
```

Parse `result[0].id` from the response. If no zone is found, the domain isn't in their Cloudflare account yet — inform the user and skip.

**Step 2: Create DNS records:**

```bash
# Root domain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"{domain}","content":"76.76.21.21","proxied":false,"ttl":1}'

# www subdomain
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"www.{domain}","content":"76.76.21.21","proxied":false,"ttl":1}'
```

Verify both return `"success":true`. If a record already exists, the API returns an error — that's fine, skip it.

**Important**: `proxied` must be `false` (DNS only / grey cloud). Vercel handles SSL — Cloudflare proxy causes conflicts.

### 10f: Update Production Supabase Auth URLs

The Supabase production project needs the correct redirect URLs for auth:

```bash
# This is done via Supabase dashboard or API — inform the user:
```

Print instructions:
```
Go to https://supabase.com/dashboard/project/{projectRef}/auth/url-configuration
Set:
- Site URL: https://{domain}
- Redirect URLs:
  - https://{domain}
  - https://{domain}/auth/callback
  - https://{domain}/update-password
```

## Step 11: Final Summary

```
## Setup Complete!

**Project**: {slug} ({displayName})
**Domain**: {domain}
**Ports**: Supabase {apiPort}-{analyticsPort} | Next.js {nextPort}

### Local Dev URLs
- App:          http://localhost:{nextPort}
- Supabase API: http://localhost:{apiPort}
- Studio:       http://localhost:{studioPort}
- Email inbox:  http://localhost:{inbucketPort}

### Remote
- GitHub:   https://github.com/{username}/{slug}
- Supabase: https://supabase.com/dashboard/project/{projectRef}
- Vercel:   https://{domain} (pending DNS)

### Cloudflare DNS
- A @ → 76.76.21.21 (DNS only) ✓ configured automatically
- A www → 76.76.21.21 (DNS only) ✓ configured automatically

### Supabase Auth Setup Required

Go to: https://supabase.com/dashboard/project/{projectRef}/auth/url-configuration
Set:
- Site URL: https://{domain}
- Redirect URLs: https://{domain}, https://{domain}/auth/callback, https://{domain}/update-password

### Env Vars with Placeholder Values (replace later)
- STRIPE_SECRET_KEY → run /setup-stripe when ready
- STRIPE_WEBHOOK_SECRET → run /setup-stripe when ready
- RESEND_API_KEY → get from https://resend.com/api-keys

### Quick Start
1. `pnpm supabase:web:start`  — Start local Supabase
2. `pnpm dev`                 — Start dev server
3. Run `/kickoff` for product discovery, or `/vision` to plan
```

---

## Rules

- Always present the full summary before making changes.
- All remote steps (GitHub, Supabase, Vercel) are best-effort — skip gracefully if CLIs aren't installed or steps fail.
- Don't modify any files the user didn't approve.
- Use the Edit tool for config file modifications (not Write) to preserve file structure.
- For config.toml port replacements, be careful to replace the right port in the right section (multiple sections have `port = XXXXX`).
- Use the domain throughout: EMAIL_SENDER uses `noreply@{domain}`, NEXT_PUBLIC_SITE_URL uses `https://{domain}`.
- For Vercel project configuration, the API is needed because `vercel link` doesn't detect the monorepo correctly — it sets framework to "Other" and root to ".". The correct settings are framework="nextjs" and rootDirectory="apps/web".
- The Vercel auth token is stored at `~/AppData/Roaming/com.vercel.cli/Data/auth.json` on Windows.
- The `sb_secret_*` key is always masked by the Supabase CLI. Use the `service_role` JWT for `SUPABASE_SECRET_KEY` instead.
- Generate `SUPABASE_DB_WEBHOOK_SECRET` with `openssl rand -hex 32`.
- Set MAILER_PROVIDER to "resend" for production (simpler than nodemailer — single API key).
- Stripe keys are placeholders until `/setup-stripe` is run.
