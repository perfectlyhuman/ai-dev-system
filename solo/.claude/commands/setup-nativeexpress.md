---
description: "Set up a new NativeExpress mobile app project: clone template, configure, deploy to Supabase + EAS + Vercel + custom domain"
---

# /setup-nativeexpress - New Mobile App Setup

You are setting up a new mobile app project using:
- **NativeExpress** (Expo + React Native + Supabase) for the iOS/Android app
- **Magic UI mobile template** (Next.js) for the landing page

The project structure is:
```
{project-name}/
├── apps/      ← NativeExpress (cloned fresh from GitHub)
├── landing/   ← Magic UI mobile landing page (copied from local template)
├── .claude/   ← ai-dev-system commands
└── documentation/
```

## Prerequisites

Before running this command, create a project directory:

```bash
cd C:/Users/riley/Cursor/perfectlyhuman
mkdir ProjectName
cd ProjectName
```

The NativeExpress template is always cloned fresh from `https://github.com/robinfaraj/nativeexpress.git` — it may have been updated since the last project.

The Magic UI mobile template is copied from the local directory at `C:/Users/riley/Cursor/perfectlyhuman/magicuidesign-mobile-template/`.

## What This Does

1. Clones NativeExpress fresh from GitHub into `apps/`
2. Copies Magic UI mobile template into `landing/`
3. Renames and configures all project files (config.js, .env, supabase/config.toml)
4. Patches AI edge functions to use OpenRouter (model-agnostic)
5. Assigns unique local Supabase dev ports
6. Installs the ai-dev-system (skills, commands, documentation)
7. Reinitializes git with a clean history
8. Creates a private GitHub repo and pushes
9. Creates a production Supabase project, links it, and pushes migrations
10. Creates an EAS project for iOS builds
11. Deploys the landing page to Vercel with all env vars
12. Adds custom domain to Vercel and configures Cloudflare DNS
13. Configures Supabase auth redirect URLs

---

## Teams

Each project belongs to a team that determines bundle IDs, Apple signing, and Expo account:

| Team | Bundle Prefix | Apple Team ID | Expo Owner |
|------|--------------|---------------|------------|
| perfectlyhuman | com.perfectlyhuman | GNNA76QH2C | perfectlyhuman |

More teams can be added to the TEAMS constant in setup-nativeexpress.js.

---

## Step 1: Gather Information

Ask the user these questions:

1. **Project slug** — lowercase, hyphenated (e.g., "my-cool-app")
   - Default: derive from current directory name
2. **Display name** — human-readable (e.g., "My Cool App")
   - Default: title-case of slug
3. **Short description** — one sentence (optional)
4. **Landing page domain** — production domain (e.g., "mycoolapp.com")
   - Default: `{slug}.com`
5. **Team** — which team/organization (determines bundle ID, Apple Team, Expo owner)
   - Default: `perfectlyhuman`
   - Bundle ID derived as: `{team.bundlePrefix}.{slug-no-hyphens}` (e.g., `com.perfectlyhuman.mycoolapp`)
6. **GitHub username** — for repo creation
   - Auto-detect: `gh api user -q .login`

## Step 2: Detect Available CLIs and Scopes

Run these checks in parallel:

```bash
# Check CLIs
gh auth status
supabase --version
vercel --version
eas --version

# Detect GitHub user
gh api user -q .login

# Detect Vercel scopes
vercel teams ls

# Detect Supabase orgs
supabase orgs list

# Check EAS login
eas whoami
```

If Vercel has multiple scopes, ask which one to use.
If Supabase has multiple orgs, ask which one to use.
Also ask Supabase region (default: us-east-1).

## Step 3: Detect Port Range

Scan sibling directories for other projects (both Makerkit and NativeExpress) to avoid Supabase port conflicts.

Check these paths in each sibling:
- `{sibling}/apps/web/supabase/config.toml` (Makerkit)
- `{sibling}/apps/supabase/config.toml` (NativeExpress)
- `{sibling}/supabase/config.toml` (Direct)

**Port formula:** Each project gets a number N. Ports shift by `N * 10`:

| Service | Formula | Default (0) | Example (1) |
|---------|---------|-------------|-------------|
| Supabase API | 54321 + N*10 | 54321 | 54331 |
| Supabase DB | 54322 + N*10 | 54322 | 54332 |
| Supabase Studio | 54323 + N*10 | 54323 | 54333 |
| Inbucket Web | 54324 + N*10 | 54324 | 54334 |
| SMTP | 54325 + N*10 | 54325 | 54335 |
| POP3 | 54326 + N*10 | 54326 | 54336 |
| Analytics | 54327 + N*10 | 54327 | 54337 |
| Landing (Next.js) | 3000 + N | 3000 | 3001 |

Present the suggested port group and let the user confirm.

## Step 4: Present Summary

Before making any changes, show the user exactly what will happen:

```
## Setup Summary

**Project**: {slug} ({displayName})
**Domain**: {domain}
**Description**: {description}
**Team**: {teamName}
**Bundle ID**: {bundleId}
**Apple Team ID**: {appleTeamId}
**GitHub**: {username}/{slug}
**Port group**: {N} (Supabase {apiPort}-{analyticsPort}, Landing {landingPort})
**Vercel scope**: {vercelScope}
**Supabase org**: {supabaseOrg} ({supabaseRegion})

### Will create:
- apps/ — clone from robinfaraj/nativeexpress.git
- landing/ — copy from magicuidesign-mobile-template
- .claude/ — ai-dev-system commands
- documentation/ — project docs

### Config files to modify:
- apps/config.js — appName, slug, bundleId, owner, scheme
- apps/.env — Supabase URL, anon key, OpenRouter
- apps/supabase/config.toml — project_id + ports
- apps/supabase/functions/_utils/openai.ts — OpenRouter patch
- landing/package.json — name
- landing/ site config — name, description, domain

### Remote services:
- GitHub: private repo {username}/{slug}
- Supabase: production project in {supabaseOrg} ({supabaseRegion})
- EAS: project for iOS builds
- Vercel: landing page under {vercelScope}, custom domain {domain}
- Cloudflare: DNS records for {domain}
```

**Wait for user confirmation before proceeding.**

## Step 5: Clone & Configure Templates

### 5a: Clone NativeExpress

```bash
git clone https://github.com/robinfaraj/nativeexpress.git apps
rm -rf apps/.git
```

### 5b: Copy Magic UI Template

```bash
# Copy, excluding node_modules/.git/.next
cp -r C:/Users/riley/Cursor/perfectlyhuman/magicuidesign-mobile-template/ landing/
```

Verify the template directory has content before copying. If empty, tell the user to populate it first.

### 5c: Update NativeExpress config.js

Read `apps/config.js` and make these replacements:

- `appName: "Native Express"` → `appName: "{displayName}"`
- `owner: "..."` → `owner: "{team.expoOwner}"`
- `slug: "nativeexpress"` → `slug: "{slug}"`
- `scheme: "nativeexpress"` → `scheme: "{slug}"`
- `iosBundleIdentifier: "..."` → `iosBundleIdentifier: "{bundleId}"`
- `androidPackageName: "..."` → `androidPackageName: "{bundleId}"`

**Note**: The `easProjectId` will be updated in Step 9 after creating the EAS project.

### 5d: Update NativeExpress .env

Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_SUPABASE_URL="http://127.0.0.1:{apiPort}"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
```

Add OpenRouter section at the end:

```
# OPENROUTER - AI Model Gateway (https://openrouter.ai)
OPENROUTER_API_KEY=""
OPENROUTER_DEFAULT_MODEL="anthropic/claude-sonnet-4-20250514"
```

Leave all other optional service keys (RevenueCat, Sentry, PostHog, OneSignal) as empty strings — they'll be configured when needed.

### 5e: Update supabase/config.toml

Same port replacement logic as Makerkit:
- `project_id = "..."` → `project_id = "{slug}"`
- `[api]` port → `{apiPort}`
- `[db]` port → `{dbPort}`
- `[studio]` port → `{studioPort}`
- `[inbucket]` port → `{inbucketPort}`
- `smtp_port` → `{smtpPort}`
- `pop3_port` → `{pop3Port}`
- `[analytics]` port → `{analyticsPort}`

## Step 6: Patch OpenRouter

Modify the Supabase edge functions to use OpenRouter instead of OpenAI.

### 6a: Patch the OpenAI utility

Find `apps/supabase/functions/_utils/openai.ts` (or similar path). Replace:
- `Deno.env.get("OPENAI_API_KEY")` → `Deno.env.get("OPENROUTER_API_KEY")`
- Add `baseURL: "https://openrouter.ai/api/v1"` to the OpenAI constructor

### 6b: Patch the call-llm function

Find `apps/supabase/functions/call-llm/index.ts`. Replace the hardcoded model:
- `model: "gpt-4o"` → `model: Deno.env.get("OPENROUTER_DEFAULT_MODEL") || "anthropic/claude-sonnet-4-20250514"`

**If the file structure has changed**, log a warning and provide manual instructions. The NativeExpress template may evolve.

## Step 7: Update Landing Page Config

Read the Magic UI template files and update:
- `package.json` name → `{slug}-landing`
- Any site config / constants file → name, description, domain
- `app/layout.tsx` metadata → title, description

Since this is a paid template with a fixed structure, inspect the actual files to find the right config patterns.

## Step 8: Install ai-dev-system

```bash
# Copy all ai-dev-system commands into the project
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/commands/*.md {projectRoot}/.claude/commands/
```

Create `.claude/project.json` with nativeexpress-specific settings:
- `template: "nativeexpress"`
- `paths.app: "apps"`
- `paths.landing: "landing"`
- `paths.database: "apps/supabase"`
- `testing.lint: "cd apps && npx expo lint"`
- `testing.typecheck: "cd apps && npx tsc --noEmit"`

## Step 9: Create EAS Project

```bash
cd apps

# Initialize EAS project
eas init

# Or non-interactively if supported:
eas init --non-interactive
```

After EAS creates the project, it returns a project ID. Update `apps/config.js`:
- `easProjectId: "..."` → `easProjectId: "{newEasProjectId}"`

If EAS CLI isn't available, print instructions and leave `easProjectId` as a placeholder.

## Step 10: Install Dependencies

```bash
# Mobile app
cd apps && npm install

# Landing page (detect package manager from lock file)
cd landing && pnpm install   # or npm install if no pnpm-lock.yaml
```

## Step 11: Initialize Git & GitHub

```bash
# Fresh git from root
git init
git add .
git commit -m "Initial commit: {displayName} (NativeExpress + Magic UI)"
git branch -M main

# Create private GitHub repo
gh repo create {username}/{slug} --private --source=. --remote=origin --push
```

## Step 12: Create Production Supabase Project

```bash
supabase projects create {slug} \
  --org-id {supabaseOrgId} \
  --region {supabaseRegion} \
  --db-password "$(openssl rand -base64 32)"
```

On success:
```bash
cd apps
supabase link --project-ref {projectRef}
```

**Important**: After linking, check the Postgres version. New projects default to Postgres 17. Update `apps/supabase/config.toml` if needed:
```
[db]
major_version = 17
```

Push migrations and get keys:
```bash
supabase db push -p "{dbPassword}"
supabase projects api-keys --project-ref {projectRef}
```

Save:
- **Supabase URL**: `https://{projectRef}.supabase.co`
- **Anon key**: the `anon` JWT
- **Service role key**: the `service_role` JWT

## Step 13: Deploy Landing Page to Vercel

### 13a: Link and Configure

```bash
cd landing
vercel link --yes --scope {vercelScope}
```

Fix project settings via Vercel API:

```bash
VERCEL_TOKEN=$(node -e "const fs=require('fs'); const p=process.env.HOME+'/AppData/Roaming/com.vercel.cli/Data/auth.json'; const a=JSON.parse(fs.readFileSync(p,'utf8')); console.log(a.token)")
PROJECT_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('landing/.vercel/project.json','utf8')); console.log(d.projectId)")
ORG_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('landing/.vercel/project.json','utf8')); console.log(d.orgId)")

# Update settings — landing page is NOT a monorepo, so no rootDirectory override needed
curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"framework":"nextjs","name":"{slug}-landing"}'
```

### 13b: Set Env Vars (if any needed by landing page)

The landing page is mostly static. If it needs env vars (e.g., analytics):

```bash
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {"key":"NEXT_PUBLIC_SITE_URL","value":"https://{domain}","type":"plain","target":["production"]},
    {"key":"NEXT_PUBLIC_APP_NAME","value":"{displayName}","type":"plain","target":["production","preview"]}
  ]'
```

### 13c: Add Custom Domain

```bash
# Root domain
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/domains?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"{domain}"}'

# www redirect
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/domains?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"www.{domain}","redirect":"{domain}"}'
```

### 13d: Trigger Deployment

```bash
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$ORG_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"{slug}-landing","project":"'$PROJECT_ID'","target":"production","gitSource":{"type":"github","ref":"main","org":"{username}","repo":"{slug}"}}'
```

### 13e: Configure Cloudflare DNS

```bash
CF_TOKEN=$(node -e "const d=JSON.parse(require('fs').readFileSync(process.env.HOME+'/.config/ai-dev-system/secrets.json','utf8'));console.log(d.cloudflare_api_token)")

# Look up zone ID
curl -s "https://api.cloudflare.com/client/v4/zones?name={domain}" \
  -H "Authorization: Bearer $CF_TOKEN"
# Parse result[0].id

# A record for root domain → Vercel
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"{domain}","content":"76.76.21.21","proxied":false,"ttl":1}'

# CNAME for www → Vercel DNS
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/{zoneId}/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"www.{domain}","content":"cname.vercel-dns.com","proxied":false,"ttl":1}'
```

`proxied` must be `false` (DNS only). Vercel handles SSL.

## Step 14: Configure Supabase Auth URLs

Use the Supabase Management API to set redirect URLs. The mobile app uses deep linking, so the redirect URL uses the app scheme.

```bash
# Read Supabase token from Windows Credential Manager
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

# Update auth config — include the app scheme for mobile deep linking
curl -s -X PATCH "https://api.supabase.com/v1/projects/{projectRef}/config/auth" \
  -H "Authorization: Bearer $SB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://{domain}",
    "uri_allow_list": "{slug}://,{slug}://auth/callback,https://{domain},https://{domain}/auth/callback"
  }'
```

The `{slug}://` scheme URLs are for the mobile app's deep linking auth flow (Supabase + Expo AuthSession).

**Fallback**: Direct user to https://supabase.com/dashboard/project/{projectRef}/auth/url-configuration

## Step 15: Final Summary

```
## Setup Complete!

**Project**: {slug} ({displayName})
**Bundle ID**: {bundleId}
**Domain**: {domain}
**Ports**: Supabase {apiPort}-{analyticsPort} | Landing {landingPort}

### Local Dev
- Mobile:        cd apps && npx expo start
- Supabase:      cd apps && npx supabase start
- Studio:        http://localhost:{studioPort}
- Landing:       cd landing && pnpm dev → http://localhost:{landingPort}

### Remote
- GitHub:    https://github.com/{username}/{slug}
- Supabase:  https://supabase.com/dashboard/project/{projectRef}
- EAS:       https://expo.dev/accounts/{team.expoOwner}/projects/{slug}
- Landing:   https://{domain}

### Cloudflare DNS
- A @ → 76.76.21.21 (DNS only) ✓
- CNAME www → cname.vercel-dns.com (DNS only) ✓

### Supabase Auth
- Site URL: https://{domain} ✓
- Redirect URLs: {slug}://, {slug}://auth/callback, https://{domain}, https://{domain}/auth/callback ✓

### Services to Configure Later
- RevenueCat: Set EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE in apps/.env
- Sentry: Set EXPO_PUBLIC_SENTRY_* vars in apps/.env
- PostHog: Set EXPO_PUBLIC_POSTHOG_* vars in apps/.env
- OneSignal: Set EXPO_PUBLIC_ONE_SIGNAL_APP_ID in apps/.env
- OpenRouter: Set OPENROUTER_API_KEY in apps/.env (and as Supabase secret)
- Google OAuth: Configure in Google Cloud Console, update apps/config.js googleOauth section
- Apple Sign-In: Configure in Apple Developer portal

### Quick Start
1. `cd apps && npx supabase start`  — Start local Supabase
2. `cd apps && npx expo start`      — Start Expo dev server
3. Run `/kickoff` for product discovery, or `/vision` to plan
```

---

## Rules

- Always present the full summary before making changes.
- Always clone NativeExpress fresh from GitHub — never copy from an old local clone.
- The Magic UI template is always copied from the local directory — it never changes.
- All remote steps (GitHub, Supabase, EAS, Vercel, Cloudflare) are best-effort — skip gracefully if CLIs aren't installed or steps fail.
- Don't modify files the user didn't approve.
- Use the Edit tool for config file modifications (not Write) to preserve structure.
- The mobile app uses Supabase URLs directly — no custom API subdomain needed.
- iOS only for now — Android configuration can come later.
- AI features use OpenRouter for model-agnostic switching, not direct OpenAI.

### NativeExpress gotchas
- The template may change between clones. Config file patching should be resilient — log warnings if expected patterns aren't found.
- `config.js` feeds into `app.config.js` dynamically. Only modify `config.js`, not `app.config.js`.
- Bundle IDs cannot have hyphens. Use `{bundlePrefix}.{slugnohyphens}` (e.g., `com.perfectlyhuman.mycoolapp`).
- The `easProjectId` in config.js must match the EAS project. Update it after running `eas init`.
- Supabase edge functions run on Deno — use `Deno.env.get()` not `process.env`.

### Vercel gotchas (landing page)
- The landing page is a standalone Next.js app (NOT a monorepo) — no rootDirectory override needed.
- Use the Vercel REST API for non-interactive env var and domain setup.
- The Vercel auth token is at `~/AppData/Roaming/com.vercel.cli/Data/auth.json` on Windows.

### Supabase gotchas
- New projects use Postgres 17. Update `config.toml` `major_version` after linking if it says 15.
- `supabase db push` needs `-p` flag with the DB password.
- The `service_role` JWT is what you want for `SUPABASE_SERVICE_ROLE_KEY` — the `sb_secret_*` is always masked.
- For the mobile app, auth redirect URLs must include the app scheme (`{slug}://`) for deep linking.

### Supabase Management API gotchas
- The CLI stores its access token in Windows Credential Manager under `Supabase CLI:supabase`.
- Read it via a temp PowerShell script using Win32 `CredRead` API (see Step 14).
- Base URL: `https://api.supabase.com/v1/`
- Auth config: `PATCH /v1/projects/{ref}/config/auth` with `site_url` and `uri_allow_list`.

### OpenRouter gotchas
- OpenRouter is API-compatible with OpenAI — just change `baseURL` and API key.
- Model names use provider prefix: `openai/gpt-4o`, `anthropic/claude-sonnet-4-20250514`, etc.
- Set `OPENROUTER_API_KEY` both in `.env` (for Expo) and as a Supabase secret (for edge functions):
  ```bash
  cd apps && supabase secrets set OPENROUTER_API_KEY="sk-or-..."
  supabase secrets set OPENROUTER_DEFAULT_MODEL="anthropic/claude-sonnet-4-20250514"
  ```

### Cloudflare DNS gotchas
- Same as Makerkit: `proxied: false`, A record for root, CNAME for www.
- Token from `~/.config/ai-dev-system/secrets.json` key `cloudflare_api_token`.
