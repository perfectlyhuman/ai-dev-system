---
description: "Scaffold a new Perfectly Human mobile app: clone the NativeExpress (robinfaraj) Expo template, rename, provision Supabase, create the EAS project, wire Sentry + RevenueCat foundations, install ai-dev-system v2, register with the cloud engine. Run from inside a fresh, empty project folder. (Web apps: use /setup-web.)"
---

# /setup-mobile - New Mobile App Setup

You are setting up a new Perfectly Human **mobile app** from the NativeExpress template
(`https://github.com/robinfaraj/nativeexpress` — Expo + React Native + TypeScript + NativeWind +
GlueStack UI + Supabase + RevenueCat + Sentry + PostHog + i18n). This is a guided, interactive
process that automates everything the user would normally do manually — including cloning the
template (Step 0). The user is running you from inside a fresh, (near-)empty project folder named
after the app (e.g. `empower`).

This is the mobile sibling of `/setup-web`. It reaches the same end state — a private GitHub repo,
a production Supabase project, `preview`/`main` branch discipline, the ai-dev-system v2 bundle, and
registration with the cloud autonomy engine — but for an Expo app instead of a Makerkit web app.

**iOS is the focus for now.** The template also configures Android (`androidPackageName`, adaptive
icons), so Android config is written, but iOS is what we build and ship first. Android comes later
if it proves out.

**No landing page / no Vercel / no Cloudflare.** A mobile app ships through the App Store via EAS,
not through Vercel. Marketing pages (if any) live elsewhere. This command scaffolds the app only.

## Step 0: Clone the NativeExpress template (you do this — don't ask the user)

You are running inside the new project's folder (e.g. `.../perfectlyhuman/empower`), which should be
empty or nearly empty. The template is **private** — the user's `gh`/git auth has access. Clone it
into the current folder and flatten it to the repo root (the Expo app IS the repo — there's no
`apps/` nesting, because there's no landing page sibling):

```bash
# Sanity check: if this already looks like a project, stop and confirm with the user.
if [ -f package.json ]; then echo "package.json already exists — is this really a fresh project folder? Confirm before proceeding."; fi

# git clone refuses a non-empty target, so clone into a temp dir and move contents up.
git clone --depth 1 https://github.com/robinfaraj/nativeexpress.git .ne-template
rm -rf .ne-template/.git          # drop template history (Step 7 re-inits fresh)
shopt -s dotglob; mv .ne-template/* .; shopt -u dotglob
rmdir .ne-template
```

If the clone fails (network/auth), STOP and report — nothing else can proceed. The template is
private; if auth fails, tell the user to confirm `gh auth status` shows access to `robinfaraj`.
Always clone fresh from the canonical URL above — the template evolves. The project slug defaults to
the current folder name.

## What This Does

1. Clones NativeExpress fresh at the repo root (Step 0)
2. Renames/configures the app across `config.js` (name, slug, scheme, bundle ID, owner)
3. Assigns unique local Supabase dev ports (so multiple projects can run simultaneously)
4. Wires `.env` (Supabase, Sentry + RevenueCat placeholders, OpenRouter for edge-function AI)
5. Patches the AI edge functions to use OpenRouter (model-agnostic), if present
6. Installs the ai-dev-system (skills, commands, documentation, hook) + mobile `project.json`
7. Reinitializes git with a clean history; creates the `preview` branch
8. Creates a private GitHub repo, pushes, and protects `main`
9. Creates a production Supabase project, links it, and pushes migrations
10. Creates an EAS project for iOS builds and writes its ID into `config.js`
11. Lays the **Sentry** foundation (env wiring; the Expo plugin auto-activates when keys are set)
12. Lays the **RevenueCat** foundation (env wiring + a checklist to finish in the dashboard)
13. Configures Supabase auth redirect URLs (including the app's deep-link scheme)
14. Registers the repo in the cloud engine (dormant + shadow)

### Architecture

```
{slug} (the repo root)   → Expo app, shipped to the App Store via EAS
Supabase                 → auth + Postgres + edge functions (Deno)
```

The mobile app talks to Supabase directly over HTTPS — there is no custom API subdomain, no Vercel,
no Cloudflare. Deep-link auth uses the app scheme (`{scheme}://`).

---

## Teams

Each project belongs to a team that determines the iOS bundle prefix, Apple signing, and Expo
account. Default is `perfectlyhuman`:

| Team | Bundle Prefix | Apple Team ID | Expo Owner |
|------|--------------|---------------|------------|
| perfectlyhuman | `com.perfectlyhuman` | `GNNA76QH2C` | `perfectlyhuman` |

The iOS bundle ID is derived as `{bundlePrefix}.{slug-with-hyphens-removed}` (e.g.
`com.perfectlyhuman.empower`). **Bundle IDs cannot contain hyphens.**

---

## Step 1: Gather Information

Ask the user these questions using AskUserQuestion (or conversationally):

1. **Project slug** — lowercase, hyphenated (e.g., "intent-post")
   - Default: derive from the current directory name
2. **Display name** — human-readable (e.g., "IntentPost")
   - Default: title-case of slug
3. **App scheme** — the deep-link URL scheme (letters/numbers, no hyphens)
   - Default: slug with hyphens removed
   - Drives deep-link auth (`{scheme}://auth/callback`) and iOS URL types
4. **Short description** — one sentence (optional, can be added later)
5. **Team** — determines bundle prefix, Apple Team ID, Expo owner
   - Default: `perfectlyhuman`
   - Bundle ID derived as `{bundlePrefix}.{slug-no-hyphens}`
6. **GitHub username** — for repo creation
   - Auto-detect: run `gh api user -q .login`

## Step 2: Detect Available CLIs and Scopes

Run these checks in parallel to understand what automation is possible:

```bash
# Check CLIs
gh auth status
supabase --version
eas --version        # Expo Application Services (npm i -g eas-cli)
npx expo --version   # Expo CLI (bundled via npx)

# Detect GitHub user
gh api user -q .login

# Detect Supabase orgs
supabase orgs list

# Check EAS login
eas whoami
```

If a CLI is missing, note it but continue — those steps will be skipped or done manually later.
(No Vercel CLI is needed — there is no web deployment.)

## Step 3: Choose Supabase Org and Region

If multiple Supabase orgs are detected, present them and let the user choose; if only one, use it.
Ask the Supabase region (default: `us-east-1`). Confirm the Expo owner (default: the team's
`expoOwner`, `perfectlyhuman`).

## Step 4: Assign Ports

Look at the user's other projects (both Makerkit web and NativeExpress mobile, likely in
`C:/Users/riley/Cursor/perfectlyhuman/`) to find ports already in use. Check each sibling for:
- `{sibling}/apps/web/supabase/config.toml` (Makerkit web)
- `{sibling}/supabase/config.toml` (NativeExpress mobile, cloned at root)

Pick the next free port group. A "port group" is `{groupNumber}` where:
- `apiPort` = 54321 + (groupNumber * 10)
- `dbPort` = 54322 + (groupNumber * 10)
- `studioPort` = 54323 + (groupNumber * 10)
- `inbucketPort` = 54324 + (groupNumber * 10)
- `smtpPort` = 54325 + (groupNumber * 10)
- `pop3Port` = 54326 + (groupNumber * 10)
- `analyticsPort` = 54327 + (groupNumber * 10)

For example, group 1 → API 54331, DB 54332, ... (Mobile apps have no Next.js dev port.)

## Step 5: Present Setup Plan

Show the user the full plan and wait for approval:

```
## Setup Plan

**Project**: {slug} ({displayName})
**Description**: {description}
**Scheme**: {scheme}://
**Team**: {teamName}
**Bundle ID**: {bundleId}
**Apple Team ID**: {appleTeamId}

**Local Ports** (group {N}):
- Supabase API:    {apiPort}
- Supabase DB:     {dbPort}
- Supabase Studio: {studioPort}
- Inbucket (mail): {inbucketPort}

**Remote**:
- GitHub:    {username}/{slug} (private repo)
- Supabase:  {supabaseOrg} ({region}, Postgres 17)
- EAS:       {expoOwner}/{slug} (iOS builds)

**Local files I'll modify**:
- `config.js`               — appName, slug, scheme, bundleId, owner (easProjectId in Step 10)
- `.env`                    — Supabase URL/key, Sentry + RevenueCat placeholders, OpenRouter
- `supabase/config.toml`    — project_id + port assignments
- `supabase/functions/…`    — OpenRouter patch (if AI functions present)
- `.claude/project.json`    — name, description, mobile paths + gate command
- `documentation/MASTER.md, ROADMAP.md` — replace template name

OK to proceed?
```

Wait for approval before continuing.

## Step 5a: Configure `config.js`

Read `config.js` and make these replacements in the `general` block (the template ships TODO
comments on each line — replace the value, the comment can stay or go):

- `appName: 'Native Express'` → `appName: '{displayName}'`
- `owner: "your-expo-account-username"` → `owner: '{expoOwner}'`
- `slug: 'native-express'` → `slug: '{slug}'`
- `scheme: 'nativeexpress'` → `scheme: '{scheme}'`
- `iosBundleIdentifier: 'com.robinfaraj.nativeexpress'` → `iosBundleIdentifier: '{bundleId}'`
- `androidPackageName: 'com.robinfaraj.nativeexpress'` → `androidPackageName: '{bundleId}'`

Leave `easProjectId` for now — Step 10 fills it after `eas init`. Leave the `googleOauth` block
alone (Google/Apple sign-in is configured later, per Step 14's "Configure later" list).

**Note**: `config.js` feeds `app.config.js` dynamically. Only edit `config.js`, never
`app.config.js`.

## Step 5b: Configure `.env`

Copy `.env.example` to `.env` and set the local Supabase values plus service placeholders. The
template's `.env.example` has these keys:

```
# SUPABASE
EXPO_PUBLIC_SUPABASE_URL="http://127.0.0.1:{apiPort}"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
EXPO_PUBLIC_SUPABASE_BUCKET_NAME="avatars"

# REVENUE CAT - PAYMENT (foundation ready; fill in Step 12)
EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE=""

# SENTRY - ERROR TRACKING (foundation ready; fill in Step 11)
EXPO_PUBLIC_SENTRY_DSN=""
EXPO_PUBLIC_SENTRY_URL=""
EXPO_PUBLIC_SENTRY_PROJECT=""
EXPO_PUBLIC_SENTRY_ORGANIZATION=""

# ONE SIGNAL - PUSH NOTIFICATIONS (optional)
EXPO_PUBLIC_ONE_SIGNAL_APP_ID=""

# POSTHOG - TRACKING (optional)
EXPO_PUBLIC_POSTHOG_HOST=""
EXPO_PUBLIC_POSTHOG_API_KEY=""
```

The local anon key above is the standard Supabase demo key — the same for every local instance;
it is NOT a secret. The production Supabase keys go into EAS (build env/secrets) later, not into
`.env` (Step 9 captures them).

**Append** an OpenRouter section at the end (used by the edge functions in Step 5d):

```
# OPENROUTER - AI Model Gateway (https://openrouter.ai) — for Supabase edge functions
OPENROUTER_API_KEY=""
OPENROUTER_DEFAULT_MODEL="anthropic/claude-sonnet-4-6"
```

Leave Sentry/RevenueCat/OneSignal/PostHog values as empty strings here — Steps 11 and 12 handle
Sentry and RevenueCat; the others are wired when the user needs them.

## Step 5c: Configure `supabase/config.toml`

The config has multiple sections (`[api]`, `[db]`, `[studio]`, `[inbucket]`, `[analytics]`) each
with their own `port =`. Replace carefully per section, and set the project id:

- `project_id = "..."` → `project_id = "{slug}"`
- `[api] port = 54321` → `port = {apiPort}`
- `[db] port = 54322` → `port = {dbPort}`
- `[db.shadow] port = 54320` → `port = {apiPort - 1}` (verify the pattern first)
- `[studio] port = 54323` → `port = {studioPort}`
- `[inbucket] port = 54324` → `port = {inbucketPort}`
- `[inbucket] smtp_port = 54325` → `smtp_port = {smtpPort}`
- `[inbucket] pop3_port = 54326` → `pop3_port = {pop3Port}`
- `[analytics] port = 54327` → `port = {analyticsPort}`

## Step 5d: Patch AI edge functions to OpenRouter (resilient — skip if absent)

The template ships Supabase edge functions under `supabase/functions/` (`_utils`, `call-llm`,
`delete-account`). Make the AI calls model-agnostic via OpenRouter (OpenAI-API-compatible):

1. In the shared OpenAI util (e.g. `supabase/functions/_utils/openai.ts`):
   - `Deno.env.get("OPENAI_API_KEY")` → `Deno.env.get("OPENROUTER_API_KEY")`
   - Add `baseURL: "https://openrouter.ai/api/v1"` to the OpenAI client constructor
2. In `supabase/functions/call-llm/index.ts`, replace any hardcoded model:
   - `model: "gpt-4o"` → `model: Deno.env.get("OPENROUTER_DEFAULT_MODEL") || "anthropic/claude-sonnet-4-6"`

**If these files or patterns have moved/changed**, log a warning and leave manual instructions —
the template evolves. Edge functions run on Deno: use `Deno.env.get()`, never `process.env`.

## Step 5e: Install ai-dev-system

Copy the ai-dev-system Claude commands, skills, hooks, and settings into the new project. This is
**mandatory** — every Perfectly Human project must have ai-dev-system installed.

```bash
# Copy commands and skills (NOT cp -r on the .claude dir — that nests .claude/.claude/)
mkdir -p {projectRoot}/.claude/commands {projectRoot}/.claude/skills
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/commands/*.md {projectRoot}/.claude/commands/
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/skills/*.md {projectRoot}/.claude/skills/

# Copy hooks (preserves session-start hook)
mkdir -p {projectRoot}/.claude/hooks
cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/hooks/* {projectRoot}/.claude/hooks/
chmod +x {projectRoot}/.claude/hooks/session-start 2>/dev/null || true

# Copy settings.json (wires up the SessionStart hook) — only if not already present
if [ ! -f {projectRoot}/.claude/settings.json ]; then
  cp C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/.claude/settings.json {projectRoot}/.claude/settings.json
fi

# Copy documentation templates (only if not present)
if [ ! -d {projectRoot}/documentation ]; then
  cp -r C:/Users/riley/Cursor/perfectlyhuman/ai-dev-system/solo/documentation {projectRoot}/documentation
fi
```

**IMPORTANT**: Do NOT use `cp -r solo/.claude/ project/.claude/` — always copy the *contents* of
each subdirectory, or `.claude/` nests as `.claude/.claude/` and commands won't be found.

This installs the ai-dev-system v2 slash commands (`/start`, `/reflect`, `/update-docs`,
`/closeout`, `/vision`, `/kickoff`, `/promote`, `/finish`, `/setup-web`, `/setup-mobile`), the
SessionStart hook, and the documentation system. **Do NOT skip this step.**

The template ships its own root `CLAUDE.md` and `.cursorrules` — leave them in place; the
ai-dev-system lives under `.claude/` and `documentation/` and doesn't conflict.

Then replace the template name in the seed docs:
- `documentation/MASTER.md` and `documentation/ROADMAP.md`: replace any `Native Express` /
  `nativeexpress` occurrences with `{displayName}`.

## Step 5f: Write the mobile `project.json`

The copied `.claude/project.json` has web defaults. Update it for a mobile (Expo) project. Set:

- `name` = `{slug}`, `description` = `{description}`
- `testing.typecheck` = `"npx tsc --noEmit"`
- `testing.lint` = `"npx expo lint"`
- `testing.quick` = `"npx tsc --noEmit && npx expo lint"`
- `testing.format` — drop it (no template formatter) or leave the ai-dev-system default unused
- `autonomy.gateCommand` = `"npx tsc --noEmit && npx expo lint"`
  (No `pnpm build` — Expo apps build in the cloud via EAS, not in the gate.)
- `paths.app` = `"."` (the Expo app IS the repo root)
- `paths.database` = `"supabase"`
- Keep `launch`, `intake`, `git` (mainBranch `main`, previewBranch `preview`), and the rest of the
  `autonomy` block at the ai-dev-system defaults.

## Step 5g: Validate canonical structure (engine compatibility gate)

The cloud engine refuses to drain a repo missing any canonical path. Confirm all 8 exist before
registering:

```bash
cd {projectRoot}
for p in documentation/MASTER.md documentation/ROADMAP.md documentation/HANDOFF.md \
         documentation/AUTONOMY-INBOX.md documentation/handoffs \
         documentation/chapters/README.md documentation/decisions/README.md \
         documentation/lessons/README.md; do
  [ -e "$p" ] && echo "OK  $p" || echo "MISSING  $p"
done
```

Any `MISSING` means the Step 5e `documentation/` copy was incomplete — re-copy from
`solo/documentation/` before proceeding.

## Step 6: Install Dependencies

The template uses yarn (ships `yarn.lock`):

```bash
yarn install    # or: npm install, if the user prefers / yarn is unavailable
```

If this fails, note the error and continue — the user can fix it later.

## Step 7: Initialize Git + Create `preview` Branch

```bash
# Fresh start (template history already dropped in Step 0)
git init
git add .
git commit -m "Initial commit: {displayName} from NativeExpress template"
git branch -M main

# preview is the cloud agent's drain target — created from main
git branch preview main
# (pushed in Step 8, after the GitHub repo exists)
```

The cloud agent always opens PRs into `preview` (never `main`). Pre-launch you promote
`preview → main` yourself (fast-merge is fine — zero blast radius with no users).

## Step 8: Create GitHub Repo + Protect `main`

```bash
gh repo create {username}/{slug} --private --source=. --remote=origin --push
git push -u origin preview
```

`main` is production. Protect it immediately so only a reviewed, gate-passing `preview → main` PR
can change it — the cloud agent (and a stray local push) can never reach production:

```bash
gh api -X PUT "repos/{username}/{slug}/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -F "enforce_admins=false" \
  -f "required_pull_request_reviews[required_approving_review_count]=0" \
  -F "restrictions=null" 2>/dev/null || echo "Set main protection manually if the API call fails (private-repo plan limits)."
```

`enforce_admins=false` lets you `/promote` (you're admin). If `gh` isn't available, print manual
instructions and continue.

## Step 9: Create Production Supabase Project

```bash
supabase projects create {slug} \
  --org-id {supabaseOrgId} \
  --region {supabaseRegion} \
  --db-password "$(openssl rand -base64 32)"
```

If this fails due to project limits, list existing projects with `supabase projects list` — the
user needs to delete/pause one or upgrade.

On success, link local to production (the Expo repo's Supabase config is at the root):

```bash
supabase link --project-ref {projectRef}
```

**Postgres version**: new Supabase projects default to Postgres 17. If `supabase/config.toml` says
`major_version = 15`, update it to `17`.

**Wait for provisioning** before pushing migrations (else `relation "storage.buckets" does not
exist`). Poll the link command until it stops warning `COMING_UP`, then re-link once to force IPv4:

```bash
until ! (supabase link --project-ref {projectRef} 2>&1 | grep -q "COMING_UP"); do sleep 20; done
supabase link --project-ref {projectRef}   # re-link forces IPv4 (avoids IPv6 timeout on db push)
```

Then push migrations and get keys:

```bash
supabase db push -p "{dbPassword}"
supabase projects api-keys --project-ref {projectRef}
```

Save these values (used for EAS secrets, and for the auth URL step):
- **Supabase URL**: `https://{projectRef}.supabase.co`
- **Anon key**: the `anon` JWT → `EXPO_PUBLIC_SUPABASE_ANON_KEY` for production builds
- **Service role key**: the `service_role` JWT → server/edge secret (the `sb_secret_*` key is
  masked by the CLI; use the JWT)

**Deploy edge functions** (the template ships `call-llm`, `delete-account`) and set their secrets:

```bash
supabase functions deploy --project-ref {projectRef}
supabase secrets set OPENROUTER_API_KEY="{key or PLACEHOLDER}" \
                     OPENROUTER_DEFAULT_MODEL="anthropic/claude-sonnet-4-6" \
                     --project-ref {projectRef}
```

## Step 10: Create the EAS Project

```bash
eas init --non-interactive   # falls back to interactive if the flag isn't supported
```

EAS returns a project ID. Write it into `config.js`:
- `easProjectId: 'c3746970-...'` (the template's placeholder) → `easProjectId: '{newEasProjectId}'`

If the EAS CLI isn't available or you're not logged in, leave the template's `easProjectId` as a
placeholder and print manual instructions (`npm i -g eas-cli && eas login && eas init`).

## Step 11: Sentry foundation

The template already ships `@sentry/react-native` (`src/sentry.js` init + the
`@sentry/react-native/expo` config plugin in `app.config.js`). The plugin **auto-activates** when
`EXPO_PUBLIC_SENTRY_URL`, `EXPO_PUBLIC_SENTRY_PROJECT`, and `EXPO_PUBLIC_SENTRY_ORGANIZATION` are
set — so "foundation ready" means wiring those keys, not adding any code.

**If a Sentry auth token exists** at `~/.config/ai-dev-system/secrets.json` (key
`sentry_auth_token`), offer to create the project and fill the env vars automatically via the
Sentry API:

```bash
SENTRY_TOKEN=$(node -e "const d=JSON.parse(require('fs').readFileSync(process.env.HOME+'/.config/ai-dev-system/secrets.json','utf8'));console.log(d.sentry_auth_token||'')")
# Create a react-native project under the org (org slug from the user, default the PH org):
curl -s -X POST "https://sentry.io/api/0/teams/{orgSlug}/{teamSlug}/projects/" \
  -H "Authorization: Bearer $SENTRY_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"{slug}","slug":"{slug}","platform":"react-native"}'
# Then read the project's client key (DSN):
curl -s "https://sentry.io/api/0/projects/{orgSlug}/{slug}/keys/" \
  -H "Authorization: Bearer $SENTRY_TOKEN"
```

Fill `.env` from the response:
- `EXPO_PUBLIC_SENTRY_DSN` = the key's `dsn.public`
- `EXPO_PUBLIC_SENTRY_ORGANIZATION` = `{orgSlug}`
- `EXPO_PUBLIC_SENTRY_PROJECT` = `{slug}`
- `EXPO_PUBLIC_SENTRY_URL` = `https://sentry.io/` (the org's Sentry base URL)

Also set `SENTRY_AUTH_TOKEN` as an **EAS secret** so source maps upload during cloud builds:
```bash
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "$SENTRY_TOKEN" --non-interactive
```

**If no token is available**, leave the four `EXPO_PUBLIC_SENTRY_*` placeholders empty and tell the
user: create a React Native project at https://sentry.io, paste the DSN/org/project into `.env`, and
add `SENTRY_AUTH_TOKEN` as an EAS secret. For deeper SDK/config work, use the
`sentry-react-native-sdk` skill.

## Step 12: RevenueCat foundation

The template already ships `react-native-purchases` + `react-native-purchases-ui` and a Purchases
provider under `src/provider/`. "Foundation ready" means wiring the API key + a dashboard checklist
— no code to add.

1. Set the env placeholder (already stubbed in Step 5b): `EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE`.
2. **If a RevenueCat token exists** at `~/.config/ai-dev-system/secrets.json` (key
   `revenuecat_api_token`), you may create the project/app via the RevenueCat v2 API; otherwise
   leave it for the user.
3. Print this checklist for the user to finish in the RevenueCat dashboard
   (https://app.revenuecat.com), since it requires App Store Connect coordination:
   - Create a **Project** (or reuse the PH project) and add an **iOS app** with bundle ID
     `{bundleId}`.
   - Paste the App Store Connect **App-Specific Shared Secret** into the iOS app config.
   - Copy the **Apple API key** (public SDK key) → `EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE` in
     `.env` (and later as an EAS secret for production builds).
   - Create at least one **Entitlement** (e.g. `pro`) and an **Offering** with a package, mapped to
     an App Store Connect subscription/product.

The Purchases SDK stays dormant until the key is set, so the app runs fine pre-monetization.

## Step 13: Configure Supabase Auth URLs (deep linking)

The mobile app authenticates via deep links, so the redirect allow-list must include the app
scheme. Read the Supabase access token from the Windows Credential Manager (the CLI stores it under
target `Supabase CLI:supabase`) via a temp PowerShell script, then PATCH the auth config:

```bash
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

# Mobile: the allow-list is scheme-based (deep links), not a web domain.
curl -s -X PATCH "https://api.supabase.com/v1/projects/{projectRef}/config/auth" \
  -H "Authorization: Bearer $SB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "{scheme}://",
    "uri_allow_list": "{scheme}://,{scheme}://auth/callback"
  }'
```

The `{scheme}://` URLs power the Expo AuthSession deep-link auth flow. **Fallback**: direct the user
to https://supabase.com/dashboard/project/{projectRef}/auth/url-configuration.

## Step 14: Final Summary

```
## Setup Complete!

**Project**: {slug} ({displayName})
**Bundle ID**: {bundleId}   **Scheme**: {scheme}://
**Ports**: Supabase {apiPort}-{analyticsPort}

### Local Dev
- Start Supabase:  supabase start
- Start the app:   npx expo start   (press i for the iOS simulator)
- Studio:          http://localhost:{studioPort}
- Email inbox:     http://localhost:{inbucketPort}

### Remote
- GitHub:   https://github.com/{username}/{slug}   (main protected, preview = drain target)
- Supabase: https://supabase.com/dashboard/project/{projectRef}
- EAS:      https://expo.dev/accounts/{expoOwner}/projects/{slug}

### Foundations wired
- Sentry:     env keys {set ✓ / placeholders — finish at sentry.io}
- RevenueCat: env key {set ✓ / placeholder — finish the dashboard checklist}

### Configure later
- RevenueCat: finish the App Store Connect + dashboard checklist (Step 12)
- Sentry:     paste DSN/org/project if not auto-created (Step 11)
- Google/Apple Sign-In: config.js googleOauth + Apple Developer / Google Cloud consoles
- OpenRouter: set OPENROUTER_API_KEY in .env and as a Supabase secret
- Push (OneSignal), Analytics (PostHog): set the EXPO_PUBLIC_* vars when needed

### Quick Start
1. `supabase start`        — local Supabase
2. `npx expo start`        — Expo dev server (iOS simulator)
3. Run `/kickoff` for product discovery, or `/start` to orient
```

## Step 15: Register the repo in the cloud engine

Add this project to the shared engine (`perfectlyhuman/agents`) so the cloud agent can drain it. It
registers **dormant** (`drainEnabled: false`) and in **shadow mode** (`autoMergeEnabled: false`) —
nothing runs until you arm it after a bed-in.

Open a PR to the engine adding a `RepoConfig` to the `REPOS` array in `lib/repos.ts`:

```ts
{
  slug: "{username}/{slug}",
  drainEnabled: false,
  roadmapPath: "documentation/ROADMAP.md",
  drainPromptPath: "gilfoyle/prompt.md",
  baseBranch: "preview",
  branchPrefix: "feature/auto-",
  agentOwnerName: "agent",
  gateCommand: "npx tsc --noEmit && npx expo lint",
  idleSleep: "10m",
  stateBranch: "autonomy-state",
  maxAttemptsPerTask: 3,
  autoMergeEnabled: false,
}
```

Note the mobile `gateCommand` — no build step (EAS builds in the cloud). Steps: (1) update the local
engine clone; (2) on a branch, insert the entry; (3) run `npm run validate-repos` if present (it
validates canonical paths over the live repo — push first); (4)
`gh pr create -R perfectlyhuman/agents --title "register {slug} (dormant, shadow)" --body "..."`;
(5) **Riley merges** (shared infra). Set `.claude/project.json` `autonomy.registered: true` only
after merge.

### Arming later (after bed-in)
1. `drainEnabled: true` → agent opens shadow PRs you review.
2. After 5+ clean shadow merges → `autoMergeEnabled: true` → autonomous into `preview`.
3. `main` always stays your gate.

## Step 16: Secrets (no Infisical for mobile)

Mobile projects **don't use Infisical.** The cloud drain agent's gate is
`npx tsc --noEmit && npx expo lint` — pure static checks that need no runtime secrets, so the
RepoConfig in Step 15 omits `infisicalPath` (the engine treats an absent path as "no runtime
secrets to load"). Build- and run-time secrets live where they're actually consumed:

1. **Local dev** reads `.env` directly — just `npx expo start`. No secret manager in the loop.
2. **Cloud builds (EAS)** hold their own secrets:
   - `SENTRY_AUTH_TOKEN` → EAS secret (Step 11), so source maps upload during builds.
   - Production Supabase URL/anon key and the RevenueCat key → set as EAS env vars (or a
     production build profile in `eas.json`) when you cut production builds. These are
     public/build-time `EXPO_PUBLIC_*` values, not drain-agent secrets.
3. `OPENROUTER_API_KEY` (edge-function AI) lives as a **Supabase function secret**
   (`supabase secrets set`, Step 9) — server-side on Supabase, never in the app bundle.

---

## Rules

- Always present the full summary before making changes.
- Always clone NativeExpress fresh from GitHub — never copy from an old local clone. It's private;
  the user's git auth has access.
- All remote steps (GitHub, Supabase, EAS) are best-effort — skip gracefully if CLIs aren't
  installed or steps fail.
- Don't modify any files the user didn't approve.
- Use the Edit tool for config file modifications (not Write) to preserve file structure.
- For `config.toml` port replacements, be careful to replace the right port in the right section.
- iOS is the focus; Android config is written but not the build target for now.
- No Vercel, no Cloudflare, no landing page — a mobile app ships via EAS/App Store.

### NativeExpress / Expo gotchas
- The template evolves between clones. Config patching should be resilient — log warnings if
  expected patterns aren't found rather than failing hard.
- `config.js` feeds `app.config.js` dynamically. Only modify `config.js`, never `app.config.js`.
- Bundle IDs cannot have hyphens: `{bundlePrefix}.{slugnohyphens}` (e.g. `com.perfectlyhuman.empower`).
- The `easProjectId` in `config.js` must match the EAS project — update it after `eas init`.
- Supabase edge functions run on Deno — use `Deno.env.get()`, not `process.env`.
- `newArchEnabled: true` is on in the template (React Native New Architecture).

### Sentry gotchas
- The template's `@sentry/react-native/expo` plugin is guarded: it only activates when
  `EXPO_PUBLIC_SENTRY_URL` + `EXPO_PUBLIC_SENTRY_PROJECT` + `EXPO_PUBLIC_SENTRY_ORGANIZATION` are all
  set. Leaving them empty is safe (Sentry stays dormant) — that's the "foundation ready" state.
- Source-map upload during EAS builds needs `SENTRY_AUTH_TOKEN` as an **EAS secret**, not a public
  `EXPO_PUBLIC_*` var.
- For deeper Sentry work (tracing, replay, profiling), use the `sentry-react-native-sdk` skill.

### RevenueCat gotchas
- `react-native-purchases` + `react-native-purchases-ui` ship in the template; only the API key is
  missing. `EXPO_PUBLIC_REVENUE_CAT_API_KEY_APPLE` is the public SDK key (safe in the app), NOT a
  secret server key.
- Real subscriptions require App Store Connect products + a RevenueCat entitlement/offering — that's
  dashboard work the command can't fully automate. Leave the checklist (Step 12).

### Supabase gotchas
- New projects use Postgres 17 — update `supabase/config.toml` `major_version` after linking if it
  says 15.
- `supabase db push` needs the `-p` flag with the DB password (it does NOT accept `--project-ref`).
- The `service_role` JWT is what you want for the secret key — the `sb_secret_*` key is masked.
- Mobile auth redirect URLs are scheme-based (`{scheme}://`), not web domains.
- Wait out the `COMING_UP` window before `db push`; re-link to force IPv4 if push times out (IPv6).

### Supabase Management API gotchas
- The CLI stores its access token in the Windows Credential Manager under `Supabase CLI:supabase`.
- Read it via a temp PowerShell script using the Win32 `CredRead` API (Step 13). Do NOT use
  `keytar` — it has install issues on Windows.
- Base URL: `https://api.supabase.com/v1/`. Auth config: `PATCH /v1/projects/{ref}/config/auth`.

### Node path on Windows
- Node.js on Windows does NOT resolve `/tmp/` (it becomes `C:\tmp\`, usually missing → `ENOENT`).
  Use `$TEMP/` or inline the value directly. Do not use `/tmp/`.
