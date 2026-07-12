# Version Controlling & the Update Mechanism

How versions are numbered, how a release is published, and how the mill's
installed app receives updates — end to end.

---

## The big picture

```
 Developer (any machine)                     Mill laptop (Windows)
 ───────────────────────                     ─────────────────────
 1. fix/build feature
 2. bump version in package.json
 3. commit + push to GitHub
 4. build installer on Windows        →      Settings → Check for Updates
 5. publish GitHub Release                   sees "vX.Y.Z available"
    tagged vX.Y.Z with the .exe       →      clicks Download Update
                                             runs installer over old version
                                             data in AppData is untouched
```

There is no auto-download-in-background magic and deliberately so: the mill
owner always sees what version they're getting and installs it with one
double-click. The database lives in `%APPDATA%\FlourMill`, outside the
program folder, so **updates never touch business data**.

---

## Version numbers

`MAJOR.MINOR.PATCH` (semantic versioning), single source of truth:
**`"version"` in `package.json`.**

| Bump | When | Example |
|---|---|---|
| PATCH `0.1.0 → 0.1.1` | bug fixes, small tweaks | fix a calculation, typo |
| MINOR `0.1.1 → 0.2.0` | new features, staff-visible changes | new report page |
| MAJOR `0.2.0 → 1.0.0` | breaking changes / db migrations needed | schema overhaul |

The git tag for a release is always the version prefixed with `v`: `v0.1.1`.
The in-app update check compares `package.json` version against the newest
GitHub release tag numerically (`0.1.9 < 0.1.10` is handled correctly).

---

## Publishing a release (developer checklist)

### 1. Finish and verify the code

```bash
npm run test:qa        # all 44 tests must pass
npm run build          # production build must be clean
```

### 2. Bump the version

Edit `package.json`:

```json
"version": "0.1.1",
```

Commit and push:

```bash
git add package.json
git commit -m "Release v0.1.1"
git push origin main
```

### 3. Build the installer

On the Windows build machine, follow
[`BUILD_WINDOWS_INSTALLER.md`](BUILD_WINDOWS_INSTALLER.md):

```powershell
git pull
.\build-installer.ps1 -Version "0.1.1"
```

→ `Output\FlourMill-Setup-v0.1.1.exe`. Install and smoke-test it once.

### 4. Publish on GitHub

1. Open https://github.com/Stradok/Rahman-Flour-Mill/releases → **Draft a new release**
2. **Tag**: `v0.1.1` (create on publish) — must match `package.json` exactly
3. **Title**: `v0.1.1 — <one-line summary>`
4. **Notes**: write for the mill owner, not for developers — these notes are
   shown **inside the app** when it offers the update:

   ```markdown
   ## What's new
   - Fixed: credit balance now updates immediately after Record Payment
   - New: stock warning turns red below 5 bags

   ## After updating
   Nothing to do — login and data stay as they are.
   ```
5. **Attach** `FlourMill-Setup-v0.1.1.exe` (drag & drop under "Attach binaries")
6. **Publish release**

> The `.exe` asset is required — the in-app Download button points at the
> release's `.exe`. A release without one falls back to linking the release
> page.

---

## What happens at the mill

1. Owner opens **Settings → Software Updates → Check for Updates**
2. The app calls its own `/api/check-updates`, which asks the GitHub API for
   the latest release of `Stradok/Rahman-Flour-Mill` (only version metadata
   travels; no business data ever leaves the machine)
3. If the release tag is newer than the installed version, the card shows
   the new version number, your release notes, and a **Download Update**
   button pointing at the installer asset
4. Owner downloads, closes the app, runs the installer — it upgrades in
   place (same install directory, same shortcuts)
5. Relaunch → same login, same data, new version

Requirements at the mill: internet access during the check/download only.
If the repo is private, set a `GITHUB_TOKEN` with `repo` read scope in the
app's `.env`; for a public repo nothing is needed.

---

## The support loop

This closes the circle for remote support (the developer is not on site):

```
Mill hits a problem
  → owner sends it via Help → "Send Feedback" (or phone/WhatsApp)
  → developer reproduces & fixes locally
  → publishes release vX.Y.Z (steps above)
  → tells owner "press Check for Updates"
  → mill is patched without anyone touching their PC
```

---

## Git conventions (developer)

- `main` is always shippable — QA suite green before every push
- Commit messages: imperative summary line, body explains *why*
- A release = one commit bumping `package.json` + one tag `vX.Y.Z` + one
  GitHub release with the installer attached
- Never commit: `.env`, `data/`, `.node-runtime/`, `Output/` (all gitignored)

## Where things are versioned

| Thing | Where it lives |
|---|---|
| Current app version | `package.json` → shown in Settings |
| Release history | GitHub Releases page |
| Installer per version | `.exe` asset attached to each release |
| Update check logic | `app/api/check-updates/route.ts` |
| Update UI | Settings → Software Updates card |
| Historical/superseded docs | `.archive_v0/` |
