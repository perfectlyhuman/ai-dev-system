# Makerkit platform

## Foundation

This project uses Makerkit's Next.js and Supabase Turbo starter. The repository is a pnpm and Turborepo monorepo; the deployable web application is `apps/web`.

## Delivery contract

- GitHub is the source repository and triggers delivery from `main`.
- Vercel hosts `apps/web`. Set its root directory to `apps/web`; install and build from the repository root with pnpm.
- Supabase owns Postgres, Auth, Storage, and migrations in `apps/web/supabase`.
- Use the installed `access` skill and `.ai-dev/access.yaml` for GitHub, Vercel, and Supabase. Do not put tokens or database passwords in the repository.

## Required environment categories

The production deployment needs the public site URL, Supabase URL and public key, Supabase server secret, plus any enabled billing and mail provider settings. Keep secret values in the declared credential provider and install them only through the approved access route.

## Operational checks

- Configure the Vercel project as Next.js with `apps/web` as the root directory.
- Provision Supabase before pushing migrations; wait until the new project is healthy, link it, and then run the database migration command from `apps/web`.
- Add the Vercel URL to Supabase Auth site and redirect URLs. When no custom domain exists, use the public `*.vercel.app` URL.
- Configure billing and transactional email only once the product actually enables those capabilities; do not deploy placeholder secrets.
