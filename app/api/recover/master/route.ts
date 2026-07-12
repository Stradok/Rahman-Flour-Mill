import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID, timingSafeEqual } from "crypto";
import { dbExists, getSqlite, rekeyDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/password";

/**
 * Emergency recovery for succession/lost-password scenarios.
 *
 * Entering the master recovery code:
 *   1. re-encrypts the database with the recovery code as the new password
 *   2. resets the owner account to username "admin" with the recovery code
 *      as its password
 *
 * Only the SHA-256 hash of the code lives in this file — the code itself
 * cannot be extracted from the source or the repository. It is held by the
 * developer offline.
 */
const RECOVERY_CODE_SHA256 = "6a396ef5ff8c21bb56d9c4e4c2bfedfb299d8e8ea04834b8e74e7cf772f7f22f";

function isValidRecoveryCode(candidate: string): boolean {
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = Buffer.from(RECOVERY_CODE_SHA256, "hex");
  return timingSafeEqual(candidateHash, expectedHash);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const recoveryCode = (body as Record<string, string>).recoveryCode?.trim();

    if (!recoveryCode) {
      return NextResponse.json({ error: "Recovery code is required" }, { status: 400 });
    }
    if (!isValidRecoveryCode(recoveryCode)) {
      console.warn("[recover/master] invalid recovery code attempt");
      return NextResponse.json({ error: "Invalid recovery code" }, { status: 401 });
    }
    if (!dbExists()) {
      return NextResponse.json(
        { error: "No database found. Run first-time setup instead." },
        { status: 404 }
      );
    }

    // Opens with the stored key. If the key file was deleted or corrupted,
    // the data is cryptographically unreachable and only a reset remains.
    let sqlite;
    try {
      sqlite = getSqlite();
    } catch {
      return NextResponse.json(
        {
          error:
            "The database cannot be opened with its stored key. The data is not recoverable — use Reset Database instead.",
        },
        { status: 409 }
      );
    }

    const restoreOwner = sqlite.transaction(() => {
      const owner = sqlite
        .prepare("SELECT id FROM users WHERE role = 'owner' ORDER BY created_at ASC LIMIT 1")
        .get() as { id: string } | undefined;

      // The reserved username must point at the owner — remove any staff
      // account squatting on "admin" before reassigning it.
      if (owner) {
        sqlite.prepare("DELETE FROM users WHERE username = 'admin' AND id != ?").run(owner.id);
        sqlite
          .prepare("UPDATE users SET username = 'admin', password_hash = ? WHERE id = ?")
          .run(hashPassword(recoveryCode), owner.id);
      } else {
        sqlite.prepare("DELETE FROM users WHERE username = 'admin'").run();
        sqlite
          .prepare(
            "INSERT INTO users (id, name, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .run(randomUUID(), "Owner", "admin", hashPassword(recoveryCode), "owner", Date.now());
      }
    });
    restoreOwner();

    rekeyDatabase(recoveryCode);

    console.log("[recover/master] emergency recovery completed — owner reset to 'admin'");
    return NextResponse.json({
      success: true,
      message:
        "Recovery complete. Login with username 'admin' and the recovery code as the password. The database password is now also the recovery code. Change both immediately from Settings.",
    });
  } catch (error) {
    console.error("Master recovery error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recovery failed" },
      { status: 500 }
    );
  }
}
