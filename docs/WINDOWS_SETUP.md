# Windows Setup — the one-script install (recommended)

Installs Al Rehman Flour Mills on any Windows 10/11 PC as a normal-feeling
app — desktop icon, Start Menu entry, opens in its own window — using a
single PowerShell script. The only prerequisite is **git**.

This replaces the Inno Setup installer for day-to-day use
([`BUILD_WINDOWS_INSTALLER.md`](BUILD_WINDOWS_INSTALLER.md) remains as the
alternative if you ever want a single distributable `.exe`).

---

## Install (on the mill PC)

**Open PowerShell — not Command Prompt.** Press the **Windows key**, type
`PowerShell`, press **Enter**. Check the window before typing anything: the
title bar says **Windows PowerShell** and the prompt looks like
`PS C:\Users\YourName>` — note the `PS` at the front. If the prompt is just
`C:\Users\YourName>` with no `PS`, that is Command Prompt (`cmd.exe`) and
the commands below will fail with confusing errors like
`Invalid argument` or `path's format is not supported` — that error means
"wrong terminal," not a real problem with the script.

No admin rights needed. Run:

```powershell
winget install --id Git.Git -e
```

Close and reopen PowerShell the same way (so `git` is on PATH), then:

```powershell
git clone https://github.com/Stradok/Rahman-Flour-Mill.git "$env:LOCALAPPDATA\FlourMill\app"
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:LOCALAPPDATA\FlourMill\app\windows\setup.ps1"
```

The script then does everything itself (first run ≈ 5–10 minutes,
mostly `npm` downloads):

1. Downloads the official portable **Node.js** ZIP from nodejs.org
   (no system-wide install, no admin)
2. Installs dependencies and makes a production build
3. Generates `.env` with a random `AUTH_SECRET` (kept across updates)
4. Creates **launchers and shortcuts**:
   - Desktop & Start Menu: **Flour Mill** — starts the server invisibly and
     opens the app in an Edge app-mode window (no address bar)
   - Start Menu: **Update Flour Mill** — see below
5. Launches the app → first visit shows the Setup screen (database password
   + owner account)

Data lives in `%APPDATA%\FlourMill\` (`flour-mill.db` + `.key`), completely
separate from the app files — updates and even uninstalling never touch it.

---

## Updating (after you push fixes to GitHub)

On the mill PC: **Start Menu → Update Flour Mill**. That's the whole
procedure. It re-runs the same script, which:

- stops the running app
- `git pull`s the latest code from GitHub
- rebuilds
- relaunches

Combined with the in-app **Settings → Check for Updates** (which tells the
owner a newer version exists on GitHub), the support loop is:
you push a fix → tell the owner "run Update Flour Mill" → done.

## Uninstalling

```powershell
powershell -File "$env:LOCALAPPDATA\FlourMill\uninstall.ps1"
```

Removes the app, runtime, and shortcuts. **Business data is kept** in
`%APPDATA%\FlourMill` (delete that folder manually only if you truly want
the data gone).

---

## Why Windows Defender / SmartScreen don't complain

This path is deliberately built from components Windows already trusts:

| Concern | Why it's quiet |
|---|---|
| SmartScreen "unknown publisher" | Triggered by downloaded unsigned `.exe` installers — this flow has none. The only binary is `node.exe`, signed by the OpenJS Foundation, from nodejs.org over HTTPS |
| UAC / admin prompts | Nothing needs admin: installs to `%LOCALAPPDATA%`, no Program Files, no registry, no services |
| Firewall popup | The server binds `127.0.0.1` only — Windows Firewall doesn't prompt for loopback-only listeners, and the app is unreachable from the network |
| Execution policy | The shortcuts and the documented command use `-ExecutionPolicy Bypass` per process — standard practice, no system policy is changed |
| AV exclusions | **None are added.** They're not needed, and silently excluding paths from Defender is bad practice |

If a company-managed PC blocks PowerShell scripts entirely (AppLocker etc.),
use the Inno installer path instead.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `fatal: could not create leading directories of '$env:LOCALAPPDATA\...': Invalid argument`, or `Processing -File '$env:LOCALAPPDATA\...' failed: ... path's format is not supported` | You're in **Command Prompt**, not PowerShell — cmd doesn't understand `$env:...` and passes it through literally. Close the window, open PowerShell instead (Windows key → type `PowerShell` → Enter; prompt must show `PS C:\...>`), and rerun the same commands |
| `git` not recognized after winget | Close and reopen PowerShell (PATH refresh) |
| Script exits at "git clone/fetch failed" | No internet, or GitHub unreachable — retry |
| Node download fails | The script retries with a pinned version; if nodejs.org is blocked, download the `node-v22.x-win-x64.zip` manually and extract it to `%LOCALAPPDATA%\FlourMill\node` so `node.exe` sits directly inside |
| Desktop icon opens nothing | Run `powershell -File "$env:LOCALAPPDATA\FlourMill\launch.ps1"` in a terminal and read the output |
| Blank page / login always fails | `.env` missing in `%LOCALAPPDATA%\FlourMill\app` — rerun setup.ps1 |
| Port conflict (something on 3210) | Edit `PORT=` in `.env` **and** `$Port` in `windows/setup.ps1`, rerun setup |

## Status

Written against Windows PowerShell 5.1 (preinstalled on Win10/11).
**Not yet executed on real Windows hardware** — the first run on the mill
laptop is the validation pass; if any step errors, bring the exact message
back to the developer.
