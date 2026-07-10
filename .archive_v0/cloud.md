# Cloud DBMS Deployment — PAUSED

## Status: paused (not abandoned) after Phase 3

The client is not comfortable with business data living in the cloud, even on a
reputable managed provider — they want everything stored strictly on their own
premises, on their own machines, encrypted and unlockable only with a password.
As a result, the Neon + Prisma + Auth.js backend work below is paused, and
development is pivoting to a local-first, installable Windows application
(see `local-deployment.md` for that plan).

## What was completed

- **Phase 1** — Neon Postgres project provisioned and connected via Prisma
  (`@prisma/adapter-pg`, driver adapters, `prisma.config.ts`). Auth.js (NextAuth
  v5) wired with Google Sign-In only, JWT sessions, the whole app gated behind
  `proxy.ts`. `Brand`/`PackagingSize` migrated off localStorage to Postgres via
  SWR-backed API routes (`/api/brands/...`).
- **Phase 2** — `Transaction` migrated to Postgres. Bill-level shared credit
  (multi-item cart, one balance per bill), returns, and payment recording all
  rewritten as API routes using `prisma.$transaction` for atomicity. Verified
  directly against the real Neon database (multi-item credit bill → partial
  payment → both rows flip to Paid together).
- **Phase 3** — the remaining 6 slices (Cost Ledger, Production, Grinding, and
  the three audit logs — Deletion/ProductChange/Return) migrated the same way.
  `lib/id.ts` (client-side ID/bill-number generation) deleted entirely — no
  longer needed once Postgres/Prisma generates every ID.

By the end of Phase 3, **every** data slice in `store/AppStore.tsx` was backed
by Postgres except `lastEnteredBy` (a per-device UI convenience, not business
data, left on `localStorage` deliberately).

## What was never finished

Google Sign-In was **never tested end-to-end through a browser** — the user
never completed the Google Cloud Console OAuth credential setup
(`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` were left blank in `.env`), so
whether the login flow actually works for a real Google account was unverified
at the time of pausing. Everything else was verified directly at the database
layer (via Prisma scripts bypassing the HTTP/auth layer), not through the UI.

## Environment state at time of pausing

- `.env` has a live `DATABASE_URL` pointing to a real Neon Postgres project
  (region: `ap-southeast-1`, Singapore) and a generated `AUTH_SECRET`.
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are empty strings.
- The Neon project itself is untouched/still live — Neon's free tier doesn't
  expire or charge, so leaving it dormant costs nothing. It can be deleted
  later once it's clear the cloud direction won't be resumed, or kept as a
  reference/backup option.
- `prisma/schema.prisma` and `prisma/migrations/` fully describe all 9
  resources and remain in the repo as documentation of the schema design, even
  though the running app no longer uses them once the local pivot lands.

## If this is ever resumed

- Would need real Google OAuth credentials to actually verify sign-in.
- Vercel's environment variables were never configured with these secrets —
  only the local `.env` has them.
- Worth revisiting whether a **hybrid** model (local-first, with optional
  encrypted cloud backup/sync) better balances the client's privacy concerns
  against multi-device access, rather than an all-or-nothing choice.
