import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/authz";
import { getDatabase, rekeyDatabase, verifyDatabasePassword } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Owner-only credential rotation:
 *   action "owner-password" — change the owner's login password
 *   action "db-password"    — re-encrypt the database under a new password
 *
 * Both verify the current secret first, so a walked-away-unlocked session
 * cannot silently take over the account or the database key.
 */
export async function PATCH(req: Request) {
  const session = await requireOwner();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "owner-password") {
      const { currentPassword, newPassword } = body as Record<string, string>;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Current and new password required" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const db = getDatabase();
      const owner = db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id as string))
        .limit(1)
        .all()[0];

      if (!owner || !verifyPassword(currentPassword, owner.passwordHash)) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }

      db.update(users)
        .set({ passwordHash: hashPassword(newPassword) })
        .where(eq(users.id, owner.id))
        .run();

      return NextResponse.json({ success: true, message: "Owner password updated" });
    }

    if (action === "db-password") {
      const { currentDbPassword, newDbPassword } = body as Record<string, string>;
      if (!currentDbPassword || !newDbPassword) {
        return NextResponse.json(
          { error: "Current and new database password required" },
          { status: 400 }
        );
      }
      if (newDbPassword.length < 8) {
        return NextResponse.json(
          { error: "New database password must be at least 8 characters" },
          { status: 400 }
        );
      }
      if (!verifyDatabasePassword(currentDbPassword)) {
        return NextResponse.json(
          { error: "Current database password is incorrect" },
          { status: 401 }
        );
      }

      rekeyDatabase(newDbPassword);
      return NextResponse.json({ success: true, message: "Database password updated" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/owner/security error:", error);
    return NextResponse.json({ error: "Failed to update credentials" }, { status: 500 });
  }
}
