# Al Rehman Flour Mills — Management System

A complete, offline-first management system for a flour mill: sales &
billing, credit tracking, production and grinding logs, cost & overhead
accounting, stock, profit reporting, and multi-user access with owner/staff
roles — running entirely on one Windows PC with an encrypted local database.
No cloud, no subscription, no internet required for daily work.

Built with Next.js 16, React 19, TypeScript, and SQLite (SQLite3MultipleCiphers,
AES-encrypted at rest). Ships as a single Windows installer with Node.js bundled.

---

## What it does

### Sales — Quick Bill & Ledger
- Multi-item bills with sequential bill numbers (`BILL-0001`, …)
- Live stock validation — can't sell more bags than were produced
- Full payment (cash/digital) or **partial & credit** sales with customer
  name, phone, CNIC and running balance
- Record payments against outstanding credit; balance settles bill-wide
- Returns with reason tracking; stock and credit adjust automatically
- Searchable transaction history (bill #, customer, phone, CNIC, date, status)

### Operations
- **Cost & Overhead Ledger** — 9 expense categories, raw wheat purchases
  (supplier + vehicle plate), per-brand/size production entries, daily
  grinding log with a reminder banner until it's filled
- **Mill Operations** — wheat received → grinded → balance, atta produced →
  issued → balance, per-day or date-range; daily stock table per brand & size
- **Product & Packaging** — brands and bag sizes (label auto-derived from
  weight), price edits require an explicit save + signature

### Reporting (owner only)
- **Profit Projection** — daily/weekly/monthly/yearly sales, revenue,
  financial health (cost vs revenue vs net profit, cost-composition bar),
  operational snapshot, production mix — every figure clickable to see the
  underlying records
- **Entries** — the single audit surface: every entry ever made, searchable,
  with delete-requires-name-and-reason, undo, and permanent deletion /
  return / product-change logs

### Accounts & security
- First-run setup wizard: database encryption password + owner account,
  with review-before-create
- Owner and staff roles; staff see Sales, Mill Operations, Product &
  Packaging, and the Cost & Overhead Ledger — never profit figures,
  audit logs, or Settings (enforced in the UI, the router, **and** the APIs)
- Staff management: create accounts, reset passwords, remove staff
- Session timeout (owner-configurable, default 30 min) with countdown warning
- Database reset requires the database password; a developer-held emergency
  recovery code can restore owner access without data loss (only its SHA-256
  hash exists in this codebase)
- In-app feedback/bug reporting to the developer
- One-click update check against GitHub Releases

---

## Repository layout

```
app/                  Next.js App Router
  api/                ~30 route handlers (auth, sales, ledger, staff, recovery, updates…)
  dashboard/          profit-projection, mill-operations, product-packaging,
                      cost-ledger, entries
  sales/quick-bill/   billing UI
  login/ setup/ recover/ settings/ help/
auth.ts               NextAuth (credentials, JWT sessions, role claims)
proxy.ts              route protection: setup state, auth, role-based redirects
lib/
  db.ts               encrypted SQLite core — single shared connection,
                      key-on-open, plaintext→encrypted migration, rekey
  password.ts         salted scrypt hashing
  access.ts           owner-only page list (shared by proxy + sidebar)
  authz.ts            requireOwner() for API routes
  schema.ts           Drizzle ORM schema (12 tables)
components/           UI (Claymorphism design system, sidebar, guards, modals)
qa/
  run-tests.mjs       44 automated end-to-end tests (npm run test:qa)
  *.md                manual test plan
docs/
  BUILD_WINDOWS_INSTALLER.md   how to produce the .exe
  Version_Controlling.md       release & update workflow
server.js             production server used by the installed app
launcher.vbs          Windows launcher (silent server + Edge app mode)
FlourMill.iss         Inno Setup installer definition
build-installer.ps1   one-command installer build
.archive_v0/          historical notes, superseded docs, old screenshots
```

---

## Development

```bash
npm ci
# create .env with at least:
#   AUTH_SECRET=<long random string>
npm run dev            # http://localhost:3000
```

First visit redirects to `/setup` — choose a database password (8+ chars)
and create the owner account. The database is created **encrypted from its
first byte** at `./data/flour-mill.db` (override the location with the
`DB_PATH` env var).

### Testing

```bash
npm run test:qa
```

Boots an isolated production server on port 3111 with a throwaway database
(your `./data` is never touched) and runs 44 end-to-end HTTP tests: setup
validation, on-disk encryption verification, login, staff lifecycle, every
role-based access rule, reset protection, credential rotation, and the
emergency-recovery flow (`RECOVERY_CODE=<code> npm run test:qa` for the
success path; the code is not stored in the repo). `qa/` also contains the
manual test plan for visual checks.

---

## Security model (honest version)

- **At rest**: the SQLite file is AES-encrypted (SQLite3MultipleCiphers).
  Copying `flour-mill.db` off the machine yields unreadable bytes without
  the database password.
- **Passwords**: scrypt with a random per-user salt; verification is
  timing-safe. Nothing recoverable from the hashes.
- **Sessions**: signed JWTs (NextAuth v5), 30-minute idle expiry.
- **Roles**: owner-only data (costs, profit, audit logs, staff, settings) is
  refused by the API for staff sessions — hiding menu items is cosmetic,
  the 401 is the actual barrier.
- **Known trade-off**: the database password is stored in a `.key` file
  beside the database so the app can open it unattended. Anyone with full
  access to the PC's filesystem can therefore open the database. The
  encryption protects against copied/stolen *files*, not a compromised
  machine. Physical access to the mill PC = access; secure the PC login.
- **Recovery**: `/recover` offers (a) full reset — requires the database
  password, and (b) emergency owner recovery — requires a code held by the
  developer, whose SHA-256 hash alone is embedded in the source.

---

## Packaging & updates

- **Build the Windows installer**: [`docs/BUILD_WINDOWS_INSTALLER.md`](docs/BUILD_WINDOWS_INSTALLER.md)
  — produces `FlourMill-Setup-v<version>.exe` with Node.js bundled; installs
  like any Windows program, data lives in `%APPDATA%\FlourMill` and survives
  reinstalls and updates.
- **Releases & the in-app update button**: [`docs/Version_Controlling.md`](docs/Version_Controlling.md)
  — bump `package.json`, publish a GitHub release tagged `vX.Y.Z` with the
  installer attached; the mill's Settings page detects it, shows your release
  notes, and links the download.

---

## Backup

Copy two files while the app is closed — that's the entire backup:

```
%APPDATA%\FlourMill\flour-mill.db     (the data, encrypted)
%APPDATA%\FlourMill\.key              (the database password)
```

Restore = put them back. Without `.key` (or the password it contains) a
backup of the `.db` alone is undecryptable — back up both, keep them off
the mill PC (USB drive), weekly.

---

## Status

| Area | State |
|---|---|
| Application features | Complete for the current spec |
| Automated QA | 44/44 passing (`npm run test:qa`) |
| Windows installer | Scripted (`build-installer.ps1`) — **not yet verified on real Windows hardware** |
| Update mechanism | Implemented; needs first published release to go live |

## License

Proprietary — all rights reserved. Client project; see [LICENSE](LICENSE).
