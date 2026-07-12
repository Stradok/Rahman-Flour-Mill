import { NextRequest, NextResponse } from "next/server";
import { dbExists, deleteDatabaseFiles, verifyDatabasePassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dbPassword } = body as Record<string, string>;

    if (!dbPassword) {
      return NextResponse.json({ error: "Database password is required" }, { status: 400 });
    }

    if (!dbExists()) {
      // Nothing to protect — clear any orphaned key/journal files so setup
      // can start clean.
      deleteDatabaseFiles();
      return NextResponse.json({ success: true, message: "No database found; ready for setup" });
    }

    if (!verifyDatabasePassword(dbPassword)) {
      return NextResponse.json({ error: "Incorrect database password" }, { status: 401 });
    }

    // deleteDatabaseFiles closes the live connection first — required on
    // Windows, where open files cannot be unlinked.
    deleteDatabaseFiles();
    console.log("[recover] database reset by verified password");

    return NextResponse.json({ success: true, message: "Database reset successfully" });
  } catch (error) {
    console.error("Recovery error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset database" },
      { status: 500 }
    );
  }
}
