---
description: "Use when setting up a freshly cloned Makerkit template as a new project — renames everything, configures ports, deploys to Supabase + Vercel + custom domain"
---

# /setup-makerkit - New Project Setup

You are setting up a freshly cloned Makerkit template as a new project. This is a guided, interactive process that automates everything the user would normally do manually.

## Prerequisites

Before running this command, clone a fresh copy of the Makerkit template:

```bash
cd C:/Users/riley/Cursor/perfectlyhuman
git clone https://github.com/makerkit/next-supabase-saas-kit-turbo.git ProjectName
cd ProjectName
```

Always clone fresh from `https://github.com/makerkit/next-supabase-saas-kit-turbo.git` — do NOT copy from local templates.

## What This Does

1. Renames the project across all config files
2. Assigns unique local dev ports (so multiple Makerkit projects can run simultaneously)
3. Installs the ai-dev-system (skills, commands, documentation, hook)
4. Reinitializes git with a clean history
5. Creates a private GitHub repo and pushes
6. Creates a production Supabase project, links it, and pushes migrations
7. Deploys to Vercel with all required env vars
8. Configures Cloudflare DNS: `{domain}` → Vercel
9. Configures Supabase auth redirect URLs

### Domain Architecture

```
{domain}    → Vercel    (Makerkit serves both marketing pages and the app)
```

Makerkit's built-in route groups handle both marketing (`/`, `/pricing`, etc.) and app (`/home`, `/account`, etc.) under one domain. We keep Makerkit's foundation and build on top of it — no separate landing page service.

---

## Step 1: Gather Information

Ask the user these questions using AskUserQuestion (or conversationally):

1. **Project slug** — lowercase, hyphenated (e.g., "intent-post")
   - Default: derive from current directory name
2. **Display name** — human-readable (e.g., "IntentPost")
   - Default: title-case of slug
3. **Domain** — production domain (e.g., "intentpost.com")
   - Default: `{slug}.com`
   - This drives: EMAIL_SENDER, NEXT_PUBLIC_SITE_URL, Vercel custom domain, Supabase auth redirect URLs
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
supabase orgs list
```

If a CLI is missing, note it but continue — those steps will be skipped or done manually later.

## Step 3: Choose Vercel Scope and Supabase Org

If multiple Vercel scopes / Supabase orgs are detected, present them to the user and let them choose. If only one of each, use it as the default.

## Step 4: Assign Ports

Look at the user's other Makerkit projects (likely in `C:/Users/riley/Cursor/perfectlyhuman/`) to find ports already in use. Pick the next free port group.

A "port group" is `{groupNumber}` where:
- `apiPort` = 54321 + (groupNumber * 10)
- `dbPort` = 54322 + (groupNumber * 10)
- `studioPort` = 54323 + (groupNumber * 10)
- `inbucketPort` = 54324 + (groupNumber * 10)
- `smtpPort` = 54325 + (groupNumber * 10)
- `pop3Port` = 54326 + (groupNumber * 10)
- `analyticsPort` = 54327 + (groupNumber * 10)
- `nextPort` = 3000 + groupNumber

For example, group 1 → API 54331, DB 54332, ..., Next.js 3001.

## Step 5: Present Setup Plan

Show the user the full plan and wait for approval:

```
## Setup Plan

**Project**: {slug} ({displayName})
**Description**: {description}
**Domain**: {domain}

**Local Ports** (group {N}):
- Supabase API:    {apiPort}
- Supabase DB:     {dbPort}
- Supabase Studio: {studioPort}
- Inbucket (mail): {inbucketPort}
- Next.js:         {nextPort}

**Remote**:
- GitHub:    {username}/{slug} (private repo)
- Supabase:  {supabaseOrg} ({region}, Postgres 17)
- Vercel:    {vercelScope}
- Cloudflare: {domain} → Vercel

**Local files I'll modify**:
- `apps/web/supabase/config.toml`     — port assignments
- `apps/web/.env`, `.env.development` — local URLs, project name
- `apps/web/.env.test`                — local URLs
- `package.json` (root)               — project name
- `.claude/project.json`              — name, description
- `documentation/MASTER.md, ROADMAP.md` — replace template name

OK to proceed?
```

Wait for approval before continuing.

## Step 5a: Update Local Config Files

For each file below, make the listed changes:

### `apps/web/supabase/config.toml`

The Supabase config has multiple sections (`[api]`, `[db]`, `[studio]`, `[inbucket]`, `[analytics]`) each with their own `port =`. Replace each section's port to use the assigned value:

- `[api] port = 54321` → `port = {apiPort}`
- `[db] port = 54322` → `port = {dbPort}`
- `[db.shadow] port = 54320` → `port = {apiPort - 1}` (or +0 if pattern differs — verify)
- `[studio] port = 54323` → `port = {studioPort}`
- `[inbucket] port = 54324` → `port = {inbucketPort}`
- `[inbucket] smtp_port = 54325` → `smtp_port = {smtpPort}`
- `[inbucket] pop3_port = 54326` → `pop3_port = {pop3Port}`
- `[analytics] port = 54327` → `port = {analyticsPort}`

Also update site_url and any redirect URLs:
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
- Update `name` and `description` fields. Other fields (`launch`, `intake`, `git`, `paths`, etc.) keep the ai-dev-system defaults.

### `documentation/MASTER.md` and `documentation/ROADMAP.md`
- Replace all `next-supabase-saas-kit-turbo` with `{displayName}`

## Step 5b: Install ai-dev-system

Copy the ai-dev-system Claude commands, skills, hooks, and settings into the new project. This is **mandatory** — every Makerkit project must have ai-dev-system installed.

```bash
# Copy commands and skills (NOT cp -r on the .claude dir — that nests .claude/.claude/)
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/commands/*.md {projectRoot}/.claude/commands/
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/skills/*.md {projectRoot}/.claude/skills/

# Copy hooks (preserves session-start hook)
mkdir -p {projectRoot}/.claude/hooks
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/hooks/* {projectRoot}/.claude/hooks/
chmod +x {projectRoot}/.claude/hooks/session-start

# Copy settings.json (wires up the SessionStart hook)
# Only copy if the project doesn't already have one — Makerkit's template may include settings
if [ ! -f {projectRoot}/.claude/settings.json ]; then
  cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/settings.json {projectRoot}/.claude/settings.json
fi

# Copy documentation templates (only if not present)
if [ ! -d {projectRoot}/documentation ]; then
  cp -r C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/documentation {projectRoot}/documentation
fi
```

**IMPORTANT**: Do NOT use `cp -r solo/.claude/ project/.claude/` — if `.claude/` already exists (Makerkit template has one), `cp -r` will nest it as `.claude/.claude/` and commands won't be found. Always copy the *contents* of each subdirectory.

This installs the ai-dev-system v2 slash commands (`/start`, `/reflect`, `/update-docs`, `/closeout`, `/vision`, `/kickoff`, `/ship`, `/go-live`, `/finish`, `/setup-makerkit`, `/setup-nativeexpress`), the SessionStart hook, and the documentation system. (`/grind-phase` is retired — batch autonomy is the cloud agent's job.)

**Do NOT skip this step.** Without it, Claude Code loses access to the project lifecycle workflow.

## Step 5c: Configure shadcnblocks

Wire in shadcnblocks.com as a UI component provider. If the user has an API key in `~/.config/ai-dev-system/secrets.json` (key: `shadcnblocks_api_key`), use the authenticated config. Otherwise, use the public registry URL.

### `packages/ui/components.json`
Add a `registries` key. **With API key** (pro blocks):
```json
{
  "registries": {
    "@shadcnblocks": {
      "url": "https://shadcnblocks.com/r/{name}",
      "headers": {
        "Authorization": "Bearer ${SHADCNBLOCKS_API_KEY}"
      }
    }
  }
}
```

**Without API key** (free blocks only):
```json
{
  "registries": {
    "shadcnblocks": {
      "url": "https://www.shadcnblocks.com/r"
    }
  }
}
```

### `apps/web/.env` (only if API key exists)
Append:
```
SHADCNBLOCKS_API_KEY={key from secrets.json}
```

### `.mcp.json`
Add the shadcn MCP server (enables Claude to browse and install components):
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

### Installing blocks
Once configured, blocks can be installed via:
```bash
npx shadcn add @shadcnblocks/hero2   # pro blocks (@ prefix, requires API key)
```

The shadcn CLI (v3+) reads the registry config from `components.json` and authenticates using the `SHADCNBLOCKS_API_KEY` env var automatically.

If the API key is not found in secrets.json, use the public registry config and inform the user that pro blocks require a key.

## Step 5d: Wire v2 autonomy scaffolding

The copied `documentation/` already includes the v2 templates (`ROADMAP.md` with
`Owner`/`Gate` columns, `workflows/rulebook.md`, `AUTONOMY-INBOX.md`). Now finalize config:

1. **Confirm the gate command.** In `.claude/project.json`, the `autonomy.gateCommand`
   defaults to `pnpm typecheck && pnpm build && pnpm lint`. Verify those scripts exist in
   the project's `package.json`; adjust the command to match what the project actually has.
   This single command is the shared quality bar for both you and the cloud agent.

2. **Set the base branch.** Confirm `git.mainBranch` in `project.json` matches the repo's
   default branch (`main`).

3. **Engine registration (STUB — completed by Plan 2).** Leave `autonomy.registered: false`.
   Registering the repo into the shared engine (`perfectlyhuman/agents` REPOS) is done by
   the Plan 2 engine integration — it opens a PR to the engine repo with this project's
   `RepoConfig`. Until that lands, the project runs local-only (you work it in Claude Code;
   no background agent yet). Tell the user: "Autonomy scaffolding is in place; the cloud
   agent will be wired when the engine-integration step runs."

## Step 5e: Validate canonical structure (engine compatibility gate)

The cloud engine refuses to drain a repo missing any canonical path (`perfectlyhuman/agents` → `lib/validate-repo-config.ts`). Confirm all 8 exist before registering:

```bash
cd {projectRoot}
for p in documentation/MASTER.md documentation/ROADMAP.md documentation/HANDOFF.md \
         documentation/AUTONOMY-INBOX.md documentation/handoffs \
         documentation/chapters/README.md documentation/decisions/README.md \
         documentation/lessons/README.md; do
  [ -e "$p" ] && echo "OK  $p" || echo "MISSING  $p"
done
```

Any `MISSING` means the Step 5b `documentation/` copy was incomplete — re-copy from `solo/documentation/` before proceeding.

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
```

**Important**: After linking, `supabase link` may warn about a Postgres version mismatch. New Supabase projects default to Postgres 17, but the Makerkit template `config.toml` may say `major_version = 15`. Update `apps/web/supabase/config.toml`:
```
[db]
major_version = 17
```

**Wait for the project to finish provisioning** before pushing migrations. If you push too early, the storage schema isn't ready and you'll get `relation "storage.buckets" does not exist`. Poll the link command until it no longer prints "COMING_UP":

```bash
# Wait until no COMING_UP warning
until ! (supabase link --project-ref {projectRef} 2>&1 | grep -q "COMING_UP"); do sleep 20; done

# Re-link once more to force IPv4 (avoids IPv6 timeout on db push)
supabase link --project-ref {projectRef}
```

Then push migrations and get keys:
```bash
# Push all migrations to production (needs the DB password from project creation)
supabase db push -p "{dbPassword}"

# Get API keys
supabase projects api-keys --project-ref {projectRef}
```

Save these values:
- **Supabase URL**: `https://{projectRef}.supabase.co`
- **Anon key**: the `anon` JWT — used as `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY`
- **Service role key**: the `service_role` JWT — used as `SUPABASE_SECRET_KEY` (the `sb_secret` key is masked by CLI, use the JWT instead)

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

# Update project settings: root directory, framework, build commands, and name
curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/web","framework":"nextjs","buildCommand":"cd ../.. && pnpm build","installCommand":"cd ../.. && pnpm install","name":"{slug}"}'
```

**Note**: The `buildCommand` and `installCommand` are required because this is a monorepo — Vercel needs to install and build from the root, not from `apps/web`.

If the name update fails with a "conflict" error, the name is already taken on Vercel — just update rootDirectory, framework, and commands without the name.

### 10b: Set All Required Production Env Vars

These are ALL the env vars needed for a successful Makerkit production build.

**Important**: The `vercel env add` CLI command prompts interactively ("Mark as sensitive?") even with piped input, so use the Vercel REST API instead for non-interactive setup:

```bash
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"key":"NEXT_PUBLIC_SITE_URL","value":"https://{domain}","type":"plain","target":["production"]},
    {"key":"NEXT_PUBLIC_SUPABASE_URL","value":"https://{projectRef}.supabase.co","type":"plain","target":["production","preview"]},
    {"key":"NEXT_PUBLIC_SUPABASE_PUBLIC_KEY","value":"{anonJwt}","type":"plain","target":["production","preview"]},
    {"key":"SUPABASE_SECRET_KEY","value":"{serviceRoleJwt}","type":"encrypted","target":["production","preview"]},
    {"key":"EMAIL_SENDER","value":"{displayName} <noreply@{domain}>","type":"plain","target":["production","preview"]},
    {"key":"MAILER_PROVIDER","value":"resend","type":"plain","target":["production","preview"]},
    {"key":"RESEND_API_KEY","value":"PLACEHOLDER_REPLACE_LATER","type":"encrypted","target":["production"]},
    {"key":"STRIPE_SECRET_KEY","value":"PLACEHOLDER_REPLACE_LATER","type":"encrypted","target":["production"]},
    {"key":"STRIPE_WEBHOOK_SECRET","value":"PLACEHOLDER_REPLACE_LATER","type":"encrypted","target":["production"]}
  ]'
```

**Env var naming** (must match what the Makerkit code expects):
- `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` — NOT `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY`
- `SUPABASE_SECRET_KEY` — NOT `SUPABASE_SECRET_KEY`
- Use `type: "encrypted"` for secrets, `type: "plain"` for public values
- Include `"preview"` target for Supabase/email vars so preview deployments work too

### 10c: Add Custom Domain

The whole Makerkit app (marketing pages + app routes) lives on `{domain}`. Add the root domain via Vercel API:

```bash
# Root domain — Makerkit serves marketing at / and the app at /home, /account, etc.
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/domains?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"{domain}"}'

# Optional: also add www.{domain} if the user wants a www variant
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/domains?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"www.{domain}","redirect":"{domain}"}'
```

### 10c.1: Disable SSO Protection (if testing via `*.vercel.app`)

New Vercel projects in team scopes default to SSO-protected `*.vercel.app` URLs — requests return HTTP 401 unless you're signed in to the team. If the user has no custom domain yet and wants to test the Vercel-provided URL publicly:

```bash
curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}'
```

**Ask the user first** whether to disable SSO protection. If they have a custom domain already, leave it enabled — SSO only gates non-custom-domain URLs.

### 10d: Trigger Production Deployment

Since the GitHub repo is connected via `vercel link`, pushing to main triggers automatic deployments. If the first push already happened, a deployment may already be in progress.

To trigger manually via API:
```bash
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"{slug}","project":"'$PROJECT_ID'","target":"production","gitSource":{"type":"github","ref":"main","org":"{username}","repo":"{slug}"}}'
```

This will take 2-3 minutes. Check status with:
```bash
curl -s "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$ORG_ID&limit=1" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
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

**Step 2: Create DNS records pointing to Vercel:**

```bash
# Root domain (apex) — A record pointing to Vercel's anycast IP
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"{domain}","content":"76.76.21.21","proxied":false,"ttl":1}'

# www subdomain — CNAME to Vercel (optional but standard)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"www.{domain}","content":"cname.vercel-dns.com","proxied":false,"ttl":1}'
```

Verify each returns `"success":true`. If a record already exists, the API returns an error — that's fine, skip it.

**Important**: `proxied` must be `false` (DNS only / grey cloud). Vercel handles SSL — Cloudflare proxy causes conflicts.

**Note on Vercel's apex IP**: Vercel uses `76.76.21.21` for apex domains. If Vercel changes this, the user can check their custom domain dashboard for the current value.

### 10f: Update Production Supabase Auth URLs

The Supabase production project needs the correct redirect URLs for auth. Use the Supabase Management API:

```bash
# Read the Supabase access token from Windows Credential Manager using PowerShell + Win32 CredRead API.
# Write a temp .ps1 script (avoids bash escaping issues), run it, then delete it.

cat > "$TEMP/get-sb-token.ps1" << 'PSEOF'
Add-Type -Namespace 'CM' -Name 'C' -MemberDefinition '
[DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
public static extern bool CredRead(string target, int type, int reserved, out IntPtr credential);
[DllImport("advapi32.dll")] public static extern void CredFree(IntPtr credential);
[StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
public struct CRED { public int Flags; public int Type; public string TargetName; public string Comment; public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob; public int Persist; public int AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
'
$p = [IntPtr]::Zero
[CM.C]::CredRead('Supabase CLI:supabase', 1, 0, [ref]$p) | Out-Null
$c = [Runtime.InteropServices.Marshal]::PtrToStructure($p, [Type][CM.C+CRED])
$bytes = New-Object byte[] $c.CredentialBlobSize
[Runtime.InteropServices.Marshal]::Copy($c.CredentialBlob, $bytes, 0, $c.CredentialBlobSize)
[CM.C]::CredFree($p)
[System.Text.Encoding]::UTF8.GetString($bytes)
PSEOF

SB_TOKEN=$(powershell -NoProfile -ExecutionPolicy Bypass -File "$TEMP/get-sb-token.ps1")
rm "$TEMP/get-sb-token.ps1"

# Update auth config via Management API
curl -s -X PATCH "https://api.supabase.com/v1/projects/{projectRef}/config/auth" \
  -H "Authorization: Bearer $SB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://{domain}",
    "uri_allow_list": "https://{domain},https://{domain}/auth/callback,https://{domain}/update-password"
  }'
```

The API returns the full auth config on success. Verify `site_url` and `uri_allow_list` are set correctly in the response.

**Fallback** (if keytar/token extraction fails): Direct the user to https://supabase.com/dashboard/project/{projectRef}/auth/url-configuration

## Step 11: Final Summary

```
## Setup Complete!

**Project**: {slug} ({displayName})
**Domain**: {domain}
**Ports**: Supabase {apiPort}-{analyticsPort} | Next.js {nextPort}

### Domain Architecture
- {domain}     → Vercel (Makerkit serves marketing + app)
- www.{domain} → redirects to {domain}

### Local Dev URLs
- App:          http://localhost:{nextPort}
- Supabase API: http://localhost:{apiPort}
- Studio:       http://localhost:{studioPort}
- Email inbox:  http://localhost:{inbucketPort}

### Remote
- GitHub:   https://github.com/{username}/{slug}
- Supabase: https://supabase.com/dashboard/project/{projectRef}
- Vercel:   https://{domain}

### Cloudflare DNS
- A record:    {domain} → 76.76.21.21 (Vercel apex)        ✓ configured automatically
- CNAME:       www.{domain} → cname.vercel-dns.com         ✓ configured automatically

### Supabase Auth
- Site URL: https://{domain} ✓ configured automatically
- Redirect URLs: https://{domain}, https://{domain}/auth/callback, https://{domain}/update-password ✓ configured automatically

### Env Vars with Placeholder Values (replace later)
- STRIPE_SECRET_KEY → run /setup-stripe when ready
- STRIPE_WEBHOOK_SECRET → run /setup-stripe when ready
- RESEND_API_KEY → get from https://resend.com/api-keys

### Quick Start
1. `pnpm supabase:web:start`  — Start local Supabase
2. `pnpm dev`                 — Start dev server
3. Run `/kickoff` for product discovery, or `/start` to orient
4. Customize Makerkit's marketing pages in `apps/web/app/(marketing)/` (or wherever the route group lives)
```

---

## Rules

- Always present the full summary before making changes.
- All remote steps (GitHub, Supabase, Vercel, Cloudflare) are best-effort — skip gracefully if CLIs aren't installed or steps fail.
- Don't modify any files the user didn't approve.
- Use the Edit tool for config file modifications (not Write) to preserve file structure.
- For config.toml port replacements, be careful to replace the right port in the right section (multiple sections have `port = XXXXX`).
- The whole app (marketing + app routes) lives at `{domain}` (Vercel). Single domain, no subdomain split.
- EMAIL_SENDER uses `noreply@{domain}`, NEXT_PUBLIC_SITE_URL uses `https://{domain}`.

### Vercel gotchas
- `vercel link` doesn't detect the monorepo correctly — it sets framework to "Other" and root to ".". Must fix via the Vercel REST API.
- The correct API settings are: `framework="nextjs"`, `rootDirectory="apps/web"`, `buildCommand="cd ../.. && pnpm build"`, `installCommand="cd ../.. && pnpm install"`.
- `vercel env add` prompts interactively even with piped input — use the REST API `POST /v10/projects/{id}/env` to set env vars non-interactively.
- `vercel domains add` can also prompt — use REST API `POST /v10/projects/{id}/domains`.
- The Vercel auth token is stored at `~/AppData/Roaming/com.vercel.cli/Data/auth.json` on Windows.
- Vercel's apex IP for A records is `76.76.21.21`. If this stops working, check the Vercel dashboard for the current value.

### Supabase gotchas
- The `sb_secret_*` key is always masked by the Supabase CLI. Use the `service_role` JWT for `SUPABASE_SECRET_KEY`.
- New Supabase projects use Postgres 17, but the Makerkit template config.toml may say `major_version = 15`. Always update after linking.
- `supabase db push` needs the `-p` flag with the DB password. It does NOT accept `--project-ref`.
- The Makerkit lite template does NOT use `SUPABASE_DB_WEBHOOK_SECRET` — don't set it.

### Supabase Management API gotchas
- The Supabase CLI stores its access token in the Windows Credential Manager under target `Supabase CLI:supabase`.
- Read it via PowerShell using the Win32 `CredRead` API (see Step 10f). Do NOT use `keytar` — it has install issues on Windows.
- Write a temp `.ps1` script file to avoid bash escaping problems with PowerShell inline commands.
- The Management API base URL is `https://api.supabase.com/v1/`.
- Auth config endpoint: `PATCH /v1/projects/{ref}/config/auth` with fields `site_url` and `uri_allow_list` (comma-separated string).

### Env var naming (must match current Makerkit code)
- `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` — **new name** (Makerkit migrated from the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Code reads it from `packages/supabase/src/get-supabase-client-keys.ts`.
- `SUPABASE_SECRET_KEY` — **new name** (Makerkit migrated from the legacy `SUPABASE_SERVICE_ROLE_KEY`). Code reads it from `packages/supabase/src/get-secret-key.ts`.
- The JWT format works for both (Supabase SDK accepts both JWT `eyJ...` and new `sb_publishable_*` / `sb_secret_*` formats). Using JWTs is simpler since the `sb_secret_*` key is always masked by the CLI.
- Set MAILER_PROVIDER to "resend" for production (simpler than nodemailer — single API key).
- Stripe keys are placeholders until `/setup-stripe` is run.

### Vercel team SSO protection
- New Vercel projects in team scopes (IntentPost, Perfectly Human, etc.) default to `ssoProtection: { deploymentType: 'all_except_custom_domains' }`. This blocks public access to `*.vercel.app` URLs and returns HTTP 401.
- If testing via the Vercel-assigned URL (no custom domain yet), disable SSO protection: `PATCH /v9/projects/{id}` with body `{"ssoProtection": null}`.
- If using a custom domain, leave SSO protection on — it only gates non-custom-domain URLs.

### Supabase project readiness race
- `supabase projects create` returns quickly but the project takes 60-120s to become `ACTIVE_HEALTHY`. During this window, `supabase link` prints `WARNING: Project status is COMING_UP`.
- `supabase db push` during this window fails with `relation "storage.buckets" does not exist` because the storage schema is provisioned asynchronously.
- Wait until `supabase link` no longer prints "COMING_UP" before running `supabase db push`. Then re-link once more to force IPv4 (see below).

### Supabase IPv6 db push issue
- Default Supabase project URLs resolve to both IPv6 and IPv4. On networks without IPv6 (or misconfigured IPv6), `supabase db push` fails with `dial tcp [...]:5432: i/o timeout`.
- Fix: re-run `supabase link --project-ref {ref}` — the CLI detects the IPv6 timeout on subsequent connections and falls back to IPv4.

### Vercel monorepo project naming
- `vercel link` creates the project with the name of the directory it's run from. For Makerkit, that's `web` (the `apps/web` dir).
- Rename via the REST API in step 10a (the `name` field in the PATCH). If the desired name is already taken in the scope, the rename fails with a conflict error — just drop the `name` field and retry.

### Node path on Windows
- Node.js on Windows does NOT resolve `/tmp/` — it translates to `C:\tmp\` which usually doesn't exist, causing `ENOENT` errors.
- When passing values between steps, use `$TEMP/` (Windows) or inline the value directly in the next command. Do not use `/tmp/`.
