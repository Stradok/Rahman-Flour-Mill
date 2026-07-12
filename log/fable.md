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