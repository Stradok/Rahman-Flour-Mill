#!/usr/bin/env node
/**
 * Automated end-to-end QA suite for Al Rehman Flour Mills.
 *
 * Boots an isolated dev server on its own port with a throwaway database
 * (never touches ./data), then exercises the real HTTP surface: setup,
 * login, role-based access, staff management, recovery, credential
 * rotation, and the update checker.
 *
 * Run:            npm run test:qa
 * Full coverage:  RECOVERY_CODE=<the code> npm run test:qa
 *                 (without it the emergency-recovery success path is skipped;
 *                  the code is never stored in this repository)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 3111;
const BASE = `http://localhost:${PORT}`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
// Repo-local scratch (gitignored) so the spawned server and this process
// always share the same filesystem view. Never touches ./data.
const SCRATCH = fs.mkdtempSync(path.join(ROOT, ".qa-scratch-"));

const OWNER = { name: "Test Owner", username: "testowner", password: "owner-pass-1" };
const STAFF = { name: "Test Staff", username: "teststaff", tempPassword: "staff-pass-1" };
const DB_PASSWORD = "qa-db-password";
const RECOVERY_CODE = process.env.RECOVERY_CODE || null;

let passed = 0, failed = 0, skipped = 0;
const failures = [];

function report(name, ok, detail = "") {
  if (ok) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; failures.push(`${name}${detail ? ` — ${detail}` : ""}`); console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`); }
}
function skip(name, why) { skipped++; console.log(`  SKIP  ${name} (${why})`); }

/** Minimal cookie jar so each simulated user keeps an independent session. */
class Jar {
  constructor() { this.cookies = new Map(); }
  absorb(res) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(";");
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === "" || /expires=Thu, 01 Jan 1970/i.test(line)) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
  header() { return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; "); }
  has(fragment) { return [...this.cookies.keys()].some((k) => k.includes(fragment)); }
}

async function req(jar, method, url, { json, form, redirect = "manual" } = {}) {
  const headers = {};
  if (jar) headers.cookie = jar.header();
  let body;
  if (json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form !== undefined) { headers["content-type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(form).toString(); }
  const res = await fetch(`${BASE}${url}`, { method, headers, body, redirect });
  jar?.absorb(res);
  return res;
}

async function login(username, password) {
  const jar = new Jar();
  const csrfRes = await req(jar, "GET", "/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();
  await req(jar, "POST", "/api/auth/callback/credentials", {
    form: { csrfToken, username, password },
  });
  const ok = jar.has("session-token");
  return { jar, ok };
}

async function waitForServer(proc, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) throw new Error(`server exited early (code ${proc.exitCode})`);
    try {
      const res = await fetch(`${BASE}/login`, { redirect: "manual" });
      if (res.status < 500) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not become ready in time");
}

async function main() {
  console.log(`QA scratch database: ${SCRATCH}`);

  // A leftover server on our port would silently receive all our requests
  // against the wrong database — refuse to start if the port is taken.
  const portTaken = await fetch(`${BASE}/login`, { redirect: "manual" }).then(() => true).catch(() => false);
  if (portTaken) {
    console.error(`Port ${PORT} is already in use — kill the stale server first (pkill -f "next.*${PORT}").`);
    process.exit(1);
  }

  // Run against a production build (next start): identical to how the
  // packaged .exe serves the app, and it can run alongside a dev server.
  if (!fs.existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
    console.log("No production build found — running next build first...");
    const build = spawn("npx", ["next", "build"], { cwd: ROOT, stdio: "inherit" });
    const code = await new Promise((r) => build.on("exit", r));
    if (code !== 0) { console.error("build failed"); process.exit(1); }
  }

  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, DB_PATH: SCRATCH, AUTH_TRUST_HOST: "true", AUTH_URL: BASE },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true, // own process group — lets us kill npx AND the real next-server child
  });
  const serverLog = [];
  server.stdout.on("data", (d) => serverLog.push(d.toString()));
  server.stderr.on("data", (d) => serverLog.push(d.toString()));

  try {
    await waitForServer(server);
    console.log("Server ready.\n--- Setup & first login ---");

    {
      const res = await req(null, "GET", "/");
      report("pre-setup: root redirects to /setup",
        res.status >= 300 && res.status < 400 && (res.headers.get("location") || "").includes("/setup"),
        `status ${res.status} → ${res.headers.get("location")}`);
    }
    {
      const res = await req(null, "POST", "/api/setup", { json: { dbPassword: "short", ownerName: OWNER.name, ownerUsername: OWNER.username, ownerPassword: OWNER.password } });
      report("setup rejects weak db password", res.status === 400, `status ${res.status}`);
    }
    {
      const res = await req(null, "POST", "/api/setup", { json: { dbPassword: DB_PASSWORD, ownerName: OWNER.name, ownerUsername: OWNER.username.toUpperCase(), ownerPassword: OWNER.password } });
      report("setup succeeds (username given in caps)", res.status === 200, `status ${res.status}: ${await res.text().catch(() => "")}`);
    }
    {
      const res = await req(null, "POST", "/api/setup", { json: { dbPassword: DB_PASSWORD, ownerName: "X", ownerUsername: "other", ownerPassword: "hijack99" } });
      report("second setup attempt is refused (409)", res.status === 409, `status ${res.status}`);
    }
    {
      const db = fs.readFileSync(path.join(SCRATCH, "flour-mill.db"));
      report("database file is encrypted on disk", db.subarray(0, 15).toString() !== "SQLite format 3");
    }
    {
      const { ok } = await login(OWNER.username, "wrong-password");
      report("login rejects wrong password", !ok);
    }

    const owner = await login(OWNER.username, OWNER.password);
    report("owner login succeeds (lowercase despite caps at setup)", owner.ok);
    if (!owner.ok) throw new Error("cannot continue without owner session");

    console.log("\n--- Staff management ---");
    {
      const res = await req(owner.jar, "POST", "/api/staff", { json: { name: STAFF.name, username: STAFF.username.toUpperCase(), tempPassword: STAFF.tempPassword } });
      report("owner creates staff account", res.status === 201, `status ${res.status}`);
    }
    {
      const res = await req(owner.jar, "POST", "/api/staff", { json: { name: "Dup", username: STAFF.username, tempPassword: "whatever1" } });
      report("duplicate staff username rejected", res.status === 400, `status ${res.status}`);
    }

    const staff = await login(STAFF.username, STAFF.tempPassword);
    report("staff login succeeds", staff.ok);
    if (!staff.ok) throw new Error("cannot continue without staff session");

    console.log("\n--- Role-based access: APIs ---");
    for (const [url, want] of [
      ["/api/cost-ledger", 200],   // staff enter expenses/wheat/production here
      ["/api/brands", 200],
      ["/api/production", 200],
      ["/api/grinding", 200],
      ["/api/transactions", 200],
      ["/api/staff", 401],         // financial/administrative — owner only
      ["/api/deletion-log", 401],
      ["/api/return-log", 401],
    ]) {
      const res = await req(staff.jar, "GET", url);
      report(`staff GET ${url} → ${want}`, res.status === want, `got ${res.status}`);
    }
    {
      const res = await req(staff.jar, "GET", "/api/settings");
      report("staff GET /api/settings → 401", res.status === 401, `got ${res.status}`);
    }
    for (const url of ["/api/staff", "/api/deletion-log", "/api/return-log", "/api/settings"]) {
      const res = await req(owner.jar, "GET", url);
      report(`owner GET ${url} → 200`, res.status === 200, `got ${res.status}`);
    }

    console.log("\n--- Role-based access: pages ---");
    for (const url of ["/dashboard/profit-projection", "/dashboard/entries", "/settings"]) {
      const res = await req(staff.jar, "GET", url);
      const loc = res.headers.get("location") || "";
      report(`staff ${url} redirects to quick-bill`, res.status >= 300 && res.status < 400 && loc.includes("/sales/quick-bill"), `status ${res.status} → ${loc}`);
    }
    for (const url of ["/sales/quick-bill", "/dashboard/mill-operations", "/dashboard/cost-ledger", "/dashboard/product-packaging"]) {
      const res = await req(staff.jar, "GET", url);
      report(`staff ${url} loads (200)`, res.status === 200, `got ${res.status}`);
    }
    {
      const res = await req(owner.jar, "GET", "/dashboard/entries");
      report("owner /dashboard/entries loads (200)", res.status === 200, `got ${res.status}`);
    }

    console.log("\n--- Business flow smoke test ---");
    {
      const res = await req(staff.jar, "POST", "/api/brands", { json: { name: "QA Atta" } });
      report("staff can create a brand", res.status === 201, `status ${res.status}`);
    }
    {
      const res = await req(staff.jar, "POST", "/api/feedback", { json: { subject: "QA run", message: "automated", issueType: "general" } });
      report("feedback endpoint accepts reports", res.status === 200, `status ${res.status}`);
    }
    {
      const res = await req(owner.jar, "GET", "/api/check-updates");
      const body = await res.json().catch(() => ({}));
      report("update check returns a version verdict",
        typeof body.isUpdateAvailable === "boolean",
        `status ${res.status} body ${JSON.stringify(body).slice(0, 120)}`);
    }

    console.log("\n--- Recovery & credential rotation ---");
    {
      const res = await req(null, "POST", "/api/recover", { json: { dbPassword: "not-the-password" } });
      report("db reset with wrong password → 401", res.status === 401, `got ${res.status}`);
    }
    {
      const res = await req(null, "POST", "/api/recover/master", { json: { recoveryCode: "000000" } });
      report("master recovery with wrong code → 401", res.status === 401, `got ${res.status}`);
    }
    {
      const res = await req(owner.jar, "PATCH", "/api/owner/security", { json: { action: "owner-password", currentPassword: "wrong", newPassword: "new-pass-99" } });
      report("owner password change rejects wrong current password", res.status === 401, `got ${res.status}`);
    }
    {
      const res = await req(owner.jar, "PATCH", "/api/owner/security", { json: { action: "owner-password", currentPassword: OWNER.password, newPassword: "rotated-pass-1" } });
      report("owner password change succeeds", res.status === 200, `got ${res.status}`);
      const relog = await login(OWNER.username, "rotated-pass-1");
      report("owner can login with rotated password", relog.ok);
    }
    {
      const res = await req(owner.jar, "PATCH", "/api/owner/security", { json: { action: "db-password", currentDbPassword: DB_PASSWORD, newDbPassword: "rotated-db-pass-1" } });
      report("database password rotation succeeds", res.status === 200, `got ${res.status}`);
      const probe = await req(owner.jar, "GET", "/api/brands");
      report("database still readable after rekey", probe.status === 200, `got ${probe.status}`);
    }

    if (RECOVERY_CODE) {
      const res = await req(null, "POST", "/api/recover/master", { json: { recoveryCode: RECOVERY_CODE } });
      report("emergency recovery with real code succeeds", res.status === 200, `got ${res.status}`);
      const admin = await login("admin", RECOVERY_CODE);
      report("login as admin with recovery code works", admin.ok);
      const check = await req(admin.jar, "GET", "/api/staff");
      report("recovered admin has owner powers", check.status === 200, `got ${check.status}`);
    } else {
      skip("emergency recovery success path", "set RECOVERY_CODE env var to enable");
    }

  } catch (err) {
    failed++;
    failures.push(`fatal: ${err.message}`);
    console.error(`\nFATAL: ${err.message}`);
    console.error("Last server output:\n" + serverLog.slice(-15).join(""));
  } finally {
    // Negative pid = the whole process group; killing only npx leaves the
    // actual next-server grandchild alive holding the port (zombie).
    try { process.kill(-server.pid, "SIGTERM"); } catch { server.kill("SIGTERM"); }
    await new Promise((r) => setTimeout(r, 1500));
    try { process.kill(-server.pid, "SIGKILL"); } catch { /* already gone */ }
    fs.rmSync(SCRATCH, { recursive: true, force: true });
  }

  console.log(`\n========================================`);
  console.log(`  ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (failures.length) {
    console.log(`\nFailures:`);
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log(`========================================`);
  process.exit(failed ? 1 : 0);
}

main();
