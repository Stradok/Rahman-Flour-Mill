# Deployment & Data Management

## Current State (Demo Phase)

- **Hosting**: Deployed on Vercel (frontend only). Auto-redeploys on every push to `main` on GitHub (`Stradok/Rahman-Flour-Mill`).
- **Data storage**: All data (sales, credit ledger, brand pricing, wheat/atta logs) lives in the browser's `localStorage` — nothing is sent to or stored on any server today.

### Why this is not safe for production use

`localStorage` is tied to **one browser on one device**:
- Clearing browser data, switching browsers/devices, or the device breaking/getting lost = permanent data loss, with **no backup anywhere**.
- Two devices (e.g. a phone and a laptop) each hold their own separate, unsynced copy — there is no single source of truth.
- Vercel never sees this data — it only serves the app's code. "The server going down" isn't the actual risk; the risk is the one browser tab holding the only copy.

This was an acceptable trade-off for showing a clickable demo to the client. It is **not** acceptable once real sales/credit/inventory data is on the line and the owner is accountable for it.

---

## Planned Backend: Supabase (Managed Postgres)

### Why Supabase
- Managed Postgres — real relational database, matches the existing data model (`lib/types.ts`) closely.
- Automatic backups (daily, on paid tier) and built-in redundancy — no server for the client to maintain, patch, or worry about going down.
- Built-in auth if/when we want to gate the Dashboard behind a login.
- Generous free tier to build and test against before going live.

### Cost
| Plan | Price | Notes |
|---|---|---|
| Free | $0 | 500MB DB, 1GB storage, 5GB egress/month. **No backups**, project auto-pauses after 7 days of inactivity. Fine for development only. |
| **Pro** | **$25/month** | 8GB DB, 100GB storage, **automatic daily backups**, no auto-pause. This is the tier to run the real business on. |
| Team | $599/month | Enterprise-scale (SOC2, 14-day backup retention, priority support) — overkill for a single mill. |

A single flour mill's transaction/inventory data is tiny (plain text/numbers) — the Pro plan's 8GB ceiling is effectively unlimited for this use case for years.

### Performance from Pakistan
No Supabase region exists in Pakistan; the nearest is **Mumbai (`ap-south-1`)**. For a POS/dashboard app (tap "Confirm Sale", wait for a save), the latency difference is imperceptible — tens of milliseconds. This is not a real-time application, so region distance is a non-issue in practice.

---

## How the DBMS Will Be Handled

### Schema (maps directly from `lib/types.ts`)

```
brands
  id            uuid primary key
  name          text
  created_at    timestamptz

packaging_sizes
  id            uuid primary key
  brand_id      uuid references brands(id) on delete cascade
  label         text            -- "20kg", "40kg", custom
  weight_kg     numeric
  base_price    numeric

transactions
  id                  uuid primary key
  bill_number         text unique
  created_at          timestamptz
  brand_id            uuid references brands(id)
  brand_name          text      -- snapshot at time of sale
  packaging_size_id   uuid references packaging_sizes(id)
  packaging_label     text      -- snapshot at time of sale
  weight_kg           numeric
  unit_price          numeric   -- snapshot at time of sale
  quantity            integer
  subtotal            numeric
  payment_mode        text      -- 'full' | 'credit'
  payment_method      text      -- 'cash' | 'digital', nullable
  status              text      -- 'paid' | 'credit-pending'
  customer_name       text, nullable
  customer_cnic       text, nullable
  amount_paid         numeric, nullable
  credit_amount_left  numeric, nullable

cost_overhead_entries
  id                  uuid primary key
  created_at          timestamptz
  wheat_volume_kg     numeric, nullable
  wheat_rate_per_kg   numeric, nullable
  category            text      -- 'logistics' | 'electricity' | 'labor' | 'misc', nullable
  amount              numeric
  note                text, nullable

wheat_inventory_logs
  id                  uuid primary key
  date                date
  wheat_received_kg   numeric, nullable
  wheat_grinded_kg    numeric
  atta_produced_kg    numeric
  atta_issued_kg      numeric
  created_at          timestamptz
```

Prices/names are snapshotted on `transactions` (not looked up live from `brands`/`packaging_sizes`) so historical bills stay accurate even if pricing changes later — same design decision as the current localStorage model, just persisted server-side now.

### Access pattern

- Next.js API routes (or Server Actions) talk to Supabase using the **service role key**, kept server-side only (never shipped to the browser).
- Row Level Security (RLS) enabled on every table; since this is single-tenant (one mill), policies simply restrict access to requests carrying a shared app secret rather than modeling multiple organizations.
- The existing `store/AppStore.tsx` Context API stays the same shape from the UI's point of view — internally, its state setters change from writing to `localStorage` to calling API routes that read/write Supabase. Components (`QuickBillForm`, `ProductConfigurator`, etc.) don't need to change.

### Migration steps (from current localStorage build)

1. Create Supabase project (free tier), apply the schema above.
2. Add Next.js API routes: `/api/brands`, `/api/transactions`, `/api/cost-ledger`, `/api/wheat-log` (GET/POST/PATCH/DELETE as needed).
3. Swap `useLocalStorageState` in `store/AppStore.tsx` for hooks that fetch/mutate via those API routes (e.g. SWR or React Query for caching + revalidation).
4. One-time export/import: since this is pre-launch, no real data needs migrating yet — the localStorage version was always a demo.
5. Add basic access protection to the Dashboard route (simple password gate to start; can upgrade to Supabase Auth with real accounts later if multiple staff need logins).
6. Upgrade Supabase project to Pro ($25/mo) before the app is used for real sales — this is what turns on daily backups.

### Backup & redundancy summary

- **Automatic daily backups** on Supabase Pro — recoverable if data is accidentally deleted or corrupted.
- **Managed infrastructure** — Supabase runs the Postgres instance on AWS with their own redundancy; there is no single server for "going down" to mean total loss, unlike the current localStorage setup.
- Optional extra safety net: a scheduled export (e.g. nightly CSV/JSON dump emailed or saved to cloud storage) can be added later for an independent off-platform copy, if wanted.
