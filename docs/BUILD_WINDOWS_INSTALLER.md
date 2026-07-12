# Building the Windows Installer

How to produce `FlourMill-Setup-v<version>.exe` — a single installer that runs
on any Windows 10/11 PC with **nothing pre-installed** (Node.js is bundled).

The build itself must happen **on a Windows machine** (Inno Setup is
Windows-only). Development can happen anywhere; only this packaging step
needs the Windows laptop.

---

## How the packaged app works

```
FlourMill-Setup-v0.1.0.exe
  └─ installs to C:\Program Files\FlourMill\
       ├─ node_runtime\        bundled portable Node.js (node.exe)
       ├─ .next\               production build of the app
       ├─ node_modules\        runtime dependencies (incl. SQLite cipher driver)
       ├─ server.js            production server (sets DB path to AppData)
       ├─ launcher.vbs         desktop shortcut target: starts server silently,
       │                       opens Edge in app mode (no browser chrome)
       └─ .env                 AUTH_SECRET for session signing

  data lives OUTSIDE the install dir — reinstalls/updates never touch it:
  C:\Users\<name>\AppData\Roaming\FlourMill\
       ├─ flour-mill.db        encrypted database
       └─ .key                 database password (owner-set at first run)
```

---

## One-time machine setup (build laptop)

1. **Node.js LTS** (20 or newer) — https://nodejs.org → verify with `node --version`
2. **Git** — https://git-scm.com
3. **Inno Setup 6** — https://jrsoftware.org/isdl.php → install to the
   default path (`C:\Program Files (x86)\Inno Setup 6\`), the build script
   looks for it there.

---

## Build steps

Open **PowerShell** and run each step:

### 1. Get the code

```powershell
git clone https://github.com/Stradok/Rahman-Flour-Mill.git
cd Rahman-Flour-Mill
# building an update? make sure you're on the latest code:
git pull
```

### 2. Create `.env`

The app refuses logins without a session-signing secret. Create a file named
`.env` in the project root containing:

```
AUTH_SECRET=<paste a long random string here>
```

Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> Keep this file out of git (it is gitignored). Reuse the same secret for
> future builds so existing login sessions survive updates.

### 3. Install dependencies

```powershell
npm ci
```

### 4. Bundle portable Node.js

Download the **Windows Binary (.zip)** — not the installer — from
https://nodejs.org/en/download (e.g. `node-v22.x.x-win-x64.zip`). Extract it,
then copy the **contents** of the extracted folder into `.node-runtime\` at
the project root, so that this file exists:

```
.node-runtime\node.exe
```

This only needs refreshing when you want a newer Node — otherwise reuse it
for every build.

### 5. Run the automated build

```powershell
.\build-installer.ps1 -Version "0.1.0"
```

The script verifies prerequisites, runs `npm run build`, stamps the version
into `FlourMill.iss`, and compiles the installer. Output:

```
Output\FlourMill-Setup-v0.1.0.exe     (~250-400 MB, Node.js included)
```

<details>
<summary>Manual alternative (if the script fails)</summary>

```powershell
npm run build
# then open FlourMill.iss in Inno Setup Compiler and press Compile,
# after updating these two lines in the file:
#   #define MyAppVersion "0.1.0"
#   #define SourceDir "C:\actual\path\to\Rahman-Flour-Mill"
```
</details>

---

## Test before shipping

Run the automated suite first (it exercises the same production server the
installer ships):

```powershell
npm run test:qa
```

All tests must pass. Then install the built `.exe` on the machine (or ideally
a second, clean PC) and walk through:

- [ ] Installer completes; desktop + start-menu shortcuts appear
- [ ] App opens in an Edge window with no address bar, no visible terminal
- [ ] First run shows **Setup** → create database password + owner account
- [ ] Login works; sidebar shows all sections for the owner
- [ ] Create a staff account (Settings → Staff Management); log in as staff;
      confirm Profit Projection / Entries / Settings are hidden
- [ ] Enter a sale in Quick Bill; number appears in Recent Transactions
- [ ] Close the app window; relaunch from the shortcut; data is still there
- [ ] `%APPDATA%\FlourMill\flour-mill.db` exists and is **not** readable as
      plain SQLite (it's encrypted)
- [ ] Uninstall from Windows Settings; confirm `%APPDATA%\FlourMill` survives

---

## Shipping it

Two options:

- **USB stick** — copy the `.exe` to the mill PC and run it. Fine for the
  first install.
- **GitHub Release** — required for the in-app update button to work.
  See [`Version_Controlling.md`](Version_Controlling.md) for the full
  release + update workflow.

---

## Troubleshooting the build

| Problem | Fix |
|---|---|
| `build-installer.ps1` blocked from running | `Set-ExecutionPolicy -Scope Process Bypass`, then rerun |
| "Inno Setup not found" | Install Inno Setup 6 to its default path |
| Compile error: file not found `.node-runtime\*` | Step 4 skipped or extracted into a nested subfolder — `node.exe` must sit directly in `.node-runtime\` |
| Compile error: file not found `.env` | Step 2 skipped |
| Installed app opens a blank/error page | Run `node server.js` inside `C:\Program Files\FlourMill\` from a terminal and read the error it prints |
| Login always fails on the installed app | `.env` missing from the build or `AUTH_SECRET` empty |
| App can't save data | Check `%APPDATA%\FlourMill` is writable; don't install the data dir under Program Files |

---

## Rebuilding for a new version

Short version: bump the version, build, publish a GitHub release. The full
release discipline (version numbers, tags, what users see) is documented in
[`Version_Controlling.md`](Version_Controlling.md).
