---
name: makerkit
description: "Configure and operate an AI Dev System project created from Makerkit's Next.js Supabase Turbo starter. Use when the project declares the Makerkit profile and needs its GitHub, Vercel, Supabase, environment, migration, or deployment configuration."
---

# Operate a Makerkit project

Use this skill only for a project whose `.ai-dev/project.yaml` declares `stack: makerkit-next-supabase-turbo`.

Read `.ai-dev/access.yaml`, the installed Makerkit platform chapter, and the relevant application configuration before acting. Use the `access` skill to verify the provider-specific CLI route without revealing a token or secret.

For Vercel, deploy `apps/web` as Next.js and ensure its root directory is `apps/web`. Build and install commands must execute from the monorepo root. For Supabase, link the project from `apps/web`, wait for a newly created project to become healthy, then apply migrations. Keep production URLs and redirect URLs synchronized between Vercel and Supabase Auth.

Never write a credential, generated database password, or application secret to a repository file, terminal output, or documentation. Do not configure billing, SMTP, or a custom domain until the product has selected the corresponding provider and the project declares the needed access route.
