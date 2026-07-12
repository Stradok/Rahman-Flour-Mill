import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { sql, eq } from "drizzle-orm";
import { settings } from "@/lib/schema";

// GET: Get current settings (owner only)
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    unlockWithStoredPassword();
    const db = getDatabase();

    // Get settings from database
    const timeoutSetting = db.select().from(settings).where(eq(settings.key, 'session_timeout_minutes')).all()[0];
    const warningSetting = db.select().from(settings).where(eq(settings.key, 'session_warning_minutes')).all()[0];

    const result = {
      sessionTimeoutMinutes: timeoutSetting ? parseInt(timeoutSetting.value) : 30,
      sessionWarningMinutes: warningSetting ? parseInt(warningSetting.value) : 5,
    };

    return NextResponse.json(result);
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
    if (sessionTimeoutMinutes) {
      db.insert(settings)
        .values({ key: 'session_timeout_minutes', value: sessionTimeoutMinutes.toString() })
        .onConflictDoUpdate({ target: settings.key, set: { value: sessionTimeoutMinutes.toString() } })
        .run();
    }

    if (sessionWarningMinutes) {
      db.insert(settings)
        .values({ key: 'session_warning_minutes', value: sessionWarningMinutes.toString() })
        .onConflictDoUpdate({ target: settings.key, set: { value: sessionWarningMinutes.toString() } })
        .run();
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
