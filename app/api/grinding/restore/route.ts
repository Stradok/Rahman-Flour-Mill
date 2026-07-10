import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { wheatGrindingLogs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { WheatGrindingLog } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entry = (await req.json()) as WheatGrindingLog;

    unlockWithStoredPassword();
    const db = getDatabase();

    // Check if it already exists
    const existing = await db
      .select()
      .from(wheatGrindingLogs)
      .where(eq(wheatGrindingLogs.id, entry.id))
      .limit(1)
      .then((res) => res[0]);

    if (existing) return NextResponse.json(existing);

    // Restore the entry
    const restored = await db
      .insert(wheatGrindingLogs)
      .values({
        id: entry.id,
        date: new Date(entry.date),
        enteredBy: entry.enteredBy,
        wheatGrindedKg: entry.wheatGrindedKg,
        note: entry.note,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(restored, { status: 201 });
  } catch (error) {
    console.error("POST /api/grinding/restore error:", error);
    return NextResponse.json({ error: "Failed to restore grinding log" }, { status: 500 });
  }
}
