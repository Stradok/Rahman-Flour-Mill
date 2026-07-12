What was actually wrong (why you were stuck in a loop)

Your database file on disk was plaintext, but the app saved an encryption key and applied it on every request. Decrypting an unencrypted file produces garbage â that's the file is not a database error. Worse, the broken connection stayed cached, so everything failed until restart. And because the app auto-created an empty DB file whenever any page touched the database, visiting login before setup left junk behind that made the app think setup was already done â trapping you between a login that can't work and a setup it won't show. Every "delete and retry" recreated the same conditions, which is why the loop never ended.

What I rebuilt

- lib/db.ts â one shared connection for the whole app; the file can only be created by setup; the encryption key is applied and verified on open; a failed unlock closes the connection instead of poisoning it; old plaintext databases are automatically encrypted in place on first access
- lib/password.ts â real per-user random salts (the old code used the literal word "salt" for everyone); old accounts still verify
- Setup â builds the entire schema, owner account, and settings in a single transaction; if anything fails, all files are deleted so no half-built database can strand you again; the database is encrypted from its very first byte; refuses to overwrite a working system
- Reset â verifies the database password, closes the connection before deleting (required for the Windows .exe later)
- Usernames are now lowercased everywhere â Admin at setup and admin at login can never mismatch again

How it was verified

12 standalone tests against the real cipher library, including an exact reproduction of your broken state (plaintext DB + key file) which now self-heals, plus wrong-key rejection, the full setup â login â reset lifecycle, and the production build passing.

Your steps now

Your current database's owner password is unknown (that's why amman/amman121 failed â those were never the credentials). Start clean:

rm -rf data/
npm run dev

Then at http://192.168.1.19:3000/setup: database password (8+ chars), owner username + password â write them down. Login uses the username you chose there, in any capitalization. If setup ever fails midway now, it cleans up after itself and you can simply retry.

====================================================================================
prompt -> when I loged in with staff account I don't want him to see any financials. Also create a back door for me to access everything if I enter the recovery code
  "465985223344561987" this will reset all the passwords for the database and admin owner account to this password and owner user name to admin automatically If he forgets
  it or like if he dies
  answer -> Staff can no longer see financials

Enforced at three layers, so typing a URL or calling an API directly won't bypass it:

- Sidebar: staff only see Quick Bill, Mill Operations, and Product & Packaging. Profit Projection, Cost & Overhead Ledger, Entries, and Settings disappear.
- Routing: if a staff member types /dashboard/profit-projection into the address bar, they're redirected to Quick Bill.
- APIs (the layer that actually matters): cost-ledger, deletion-log, and return-log endpoints now return 401 for staff, so financial numbers never even reach their browser. One deliberate exception — staff can still record a return at the till, they just can't browse the return history.

One side effect to know: staff will see zeros for "Wheat Received" on Mill Operations, because that figure comes from the cost ledger (which contains purchase rates). Tell me if staff need that number and I'll add a sanitized volumes-only endpoint.

Emergency recovery code

On the login page → "Forgot password?" → Use Emergency Recovery Code. E

1. Keeps all business data intact
2. Resets the owner account to username admin with the recovery code as
3. Re-encrypts the database with the recovery code as the new database password
                                                                                                                                                                           So even if the mill owner forgets everything — or isn't around anymore ine, enter the code, and log in as admin.

One security decision I made differently than you asked: the code itself is not written anywhere in the project — only its SHA-256 fingerprint. If you'd hardcoded the raw code, anyone who opened the source (or your future GitHub repo) could rtion. With the hash, the code only exists in your head and in thisconversation. Keep it written down somewhere safe offline.

I also added two new cards in Settings → Session & Security — Change Owner Password and Change Database Password — so after using recovery, the owner can rotate both secrets (each requires the current one first).                                                                                                                             
Verified with 12 standalone tests (hash match, near-miss codes rejected, owner restored with staff accounts untouched, a staff member squatting on the username admin gets removed, database re-opens under the new key) plus a clean production b try it: log in as a staff account to confirm the menu shrinks, thentest the recovery flow.
============================================
Prompt -> I want the staff memeber to have access to the following pages Sales , Mill operations ,Product and packaging , Cost and overhead & ledger. Make sure the qa tests are ready  to run @qa/  and then also write me the steps to make an exe for this on the mills laptop that I have because I am working on Linux plus also make sure the update mehanism is there like they can update the software like from clicking update button and it like pulls in update from github
Answer-> All done — everything is committed and all 44 automated tests pass. Here's the full picture:

1. Staff access (as you specified)

Staff now see and can use: Quick Bill & Ledger, Mill Operations, Product & Packaging, Cost & Overhead Ledger. Owner-only: Profit Projection, Entries, Settings. Enforced in the sidebar, at the routing layer, and in the APIs. Restart your dev server and re-login to see it.

2. QA suite — ready to run

npm run test:qa

This boots its own isolated server on port 3111 with a throwaway database (your real ./data is never touched) and runs 44 end-to-end tests over real HTTP: setup validation, proof the database file is encrypted on disk, login, staff creation, every staff/owner access rule, reset protection, password rotation, and the emergency recovery flow. It found and I fixed a real bug: the cipher library refuses to re-encrypt a database in WAL mode, which was breaking the database-password change and emergency recovery with a 500 — both now work and are covered by tests. Current result: 44/44 passing. The old markdown files in qa/ remain as the manual checklist for visual things a script can't judge.

3. Building the .exe on the mill laptop

The installer files already exist in the repo (FlourMill.iss, launcher.vbs, server.js, build-installer.ps1) — I fixed the Inno script, which was missing node_modules, server.js, and .env (the installed app couldn't have started). On the Windows laptop:

1. Install Node.js LTS, Git, and Inno Setup 6 (default path).
2. git clone https://github.com/Stradok/Rahman-Flour-Mill.git and cd into it.
3. Create a .env file containing AUTH_SECRET=<any long random string> — login breaks without it.
4. npm ci
5. Download the Node Windows Binary (.zip) from nodejs.org, extract it, and copy its contents into a .node-runtime\ folder in the project (so .node-runtime\node.exe exists) — the installer bundles this so the mill PC needs nothing installed.
6. Run .\build-installer.ps1 in PowerShell (or npm run build then compile FlourMill.iss in Inno Setup).
7. Your installer is at Output\FlourMill-Setup-v0.1.0.exe. Install it, launch from the desktop icon — it starts the server invisibly and opens Edge in app mode. The database lives in %APPDATA%\FlourMill, outside the program folder, so reinstalls and updates never touch the data.

Honest caveat: this packaging flow hasn't been exercised on a real Windows machine yet — test the installer on the laptop yourself before handing it over, and bring me any error it shows.

4. The update mechanism

Already wired to your repo (Stradok/Rahman-Flour-Mill). Your release routine on any machine:

1. Bump "version" in package.json (e.g. 0.1.1), commit, push.
2. Build a fresh installer (steps above).
3. On GitHub: Releases → New release, tag it v0.1.1, attach FlourMill-Setup-v0.1.1.exe, publish.

At the mill: Settings → Software Updates → Check for Updates compares their version against your latest GitHub release, shows your release notes, and a Download Update button that fetches the new installer directly. They run it, and their data survives because it lives in AppData. Combined with the feedback button (they report a problem → you fix it on your Linux machine → push a release → they click update), you now have the full remote support loop you wanted.

The push succeeded — GitHub now has all 11 commits. Refresh https://github.com/Stradok/Rahman-Flour-Mill and you'll see the clean root, the new README rendered on the front page, docs/ with the two guides, and .archive_v0/ holding the old material.

The gh CLI isn't installed on this machine, so the remaining polish is a few clicks on the GitHub website itself — these are cosmetic settings that don't live in the repo files:

1. Description & topics (biggest visual upgrade) — on the repo page, click the ⚙️ gear next to "About" in the right sidebar:
- Description: Offline-first flour mill management system — encrypted local SQLite, owner/staff roles, Windows installer, GitHub-release updates
- Topics: nextjs, typescript, sqlite, pos, inventory-management, offline-first, windows
- Untick "Releases" won't be there — actually leave Releases ticked; that's where your installers will live. Untick Packages and Deployments if shown.

2. Hide unused tabs — Settings → General → Features: untick Wikis, Issues (optional — keep if you want the mill owner or testers filing bugs there), Projects, and Discussions. Fewer empty tabs = tidier.

3. Default branch protection (optional but professional) — Settings → Branches → Add rule for main: tick "Require a pull request before merging" only if you want that discipline; for a solo project it's fine to skip.

4. Social preview (optional) — Settings → General → Social preview: upload one of the app screenshots (they're in .archive_v0/screenshots/) so links to the repo show an image instead of grey placeholder.

5. First release — the Releases section will say "No releases published" until you build the installer on the mill laptop and publish v0.1.0 following docs/Version_Controlling.md. That's the last piece that makes the page look like a real shipped product — and it's also what activates the in-app update button.

One thing to know for the future: pushing is never automatic. Whenever we commit work here, GitHub only updates after git push origin main — if the repo ever "looks old" again, that's the command to reach for.