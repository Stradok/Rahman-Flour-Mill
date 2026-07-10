import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { sql } from "drizzle-orm";

// GET: Get current settings (owner only)
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    unlockWithStoredPassword();
    const db = getDatabase();

    // Get settings from a simple key-value table or use defaults
    const result = await db.execute(
      sql`SELECT key, value FROM settings WHERE key IN ('session_timeout_minutes', 'session_warning_minutes')`
    );

    // Parse results (Drizzle returns raw SQL results differently)
    const settings = {
      sessionTimeoutMinutes: 30,  // default
      sessionWarningMinutes: 5,   // default
    };

    // If settings exist in DB, override defaults
    // (This depends on if we have a settings table - we might need to add it)

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    // Return defaults on error
    return NextResponse.json({
      sessionTimeoutMinutes: 30,
      sessionWarningMinutes: 5,
    });
  }
}

// PATCH: Update settings (owner only)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionTimeoutMinutes, sessionWarningMinutes } = await req.json();

    // Validate input
    if (sessionTimeoutMinutes) {
      if (sessionTimeoutMinutes < 5 || sessionTimeoutMinutes > 480) {
        return NextResponse.json(
          { error: "Timeout must be between 5 and 480 minutes" },
          { status: 400 }
        );
      }
    }

    if (sessionWarningMinutes) {
      if (
        sessionWarningMinutes < 1 ||
        sessionWarningMinutes >= (sessionTimeoutMinutes || 30)
      ) {
        return NextResponse.json(
          { error: "Warning time must be less than timeout" },
          { status: 400 }
        );
      }
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Update settings in database
    // This assumes we create a settings table, or we can store in a JSON field
    if (sessionTimeoutMinutes) {
      await db.execute(
        sql`INSERT OR REPLACE INTO settings (key, value) VALUES ('session_timeout_minutes', ${sessionTimeoutMinutes})`
      );
    }

    if (sessionWarningMinutes) {
      await db.execute(
        sql`INSERT OR REPLACE INTO settings (key, value) VALUES ('session_warning_minutes', ${sessionWarningMinutes})`
      );
    }

    return NextResponse.json({
      sessionTimeoutMinutes: sessionTimeoutMinutes || 30,
      sessionWarningMinutes: sessionWarningMinutes || 5,
    });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
