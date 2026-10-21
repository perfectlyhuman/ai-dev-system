# Makerkit new-project bootstrap

**Profile flag:** `--profile makerkit`  
**Bootstrap entrypoint:** `installer/bootstrap-makerkit.mjs`

## Phase 1 — install into a repo

Existing Makerkit monorepo:

```text
npx create-ai-dev --profile makerkit --description "..." --entity perfectlyhuman
```

Creates project contract, Perfectly Human `access.yaml` routes (`github.perfectly-human`, `vercel.perfectly-human`, `supabase.perfectly-human`), `makerkit` skill, platform chapter, and `AGENTS.md` when absent.

Optional observability requests live in `templates/profiles/makerkit/access.observability.yaml` — merge into `.ai-dev/access.yaml` after matching credential routes exist in `registry.yaml`.

## Phase 2 — clone + provision

```powershell
node installer/bootstrap-makerkit.mjs `
  --project C:\path\to\new-app `
  --template <your-makerkit-git-url> `
  --description "What it does" `
  --entity perfectlyhuman `
  --provision `
  --github-repo perfectlyhuman/my-app `
  --vercel-project my-app `
  --vercel-scope perfectlyhuman `
  --supabase-ref <project-ref>
```

### What `--provision` does

1. **Registry** — adds the new project name to `consumers` for each credential alias declared in `.ai-dev/access.yaml` (does not create secrets).
2. **Access doctor** — `access.mjs doctor` for declared routes.
3. **GitHub** — `gh repo create owner/name --private --source=. --push` when `origin` is not configured.
4. **Vercel** — `vercel link` from `apps/web` when not already linked.
5. **Supabase** — `supabase link --project-ref` and `supabase db push` when `--supabase-ref` is set.

Create a new Supabase project instead of linking:

```text
SUPABASE_DB_PASSWORD=... node installer/bootstrap-makerkit.mjs ... \
  --supabase-name my-app \
  --supabase-org-id <org-uuid>
```

### Observability and mail

When routes and Bitwarden secrets exist, add observability requests to `access.yaml` and rerun with:

```text
--install-secrets
```

This attempts `access.mjs install` for `sentry`, `posthog`, and `resend` into the declared `vercel` destination. Skips cleanly when a route is not ready.

### Credential reality

- Doctor may report `needs-attention` until registry consumers, CLI logins, and Bitwarden projects are aligned.
- Bootstrap never prints or commits secret values.
- Auth URL alignment between Supabase and Vercel remains a manual or agent-guided step after the first deployment URL exists.

## After bootstrap

Run `/kickoff` when `documentation/` is still scaffold, otherwise `/start`.
