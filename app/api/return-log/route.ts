import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { returnLogEntries } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const result = await db
      .select()
      .from(returnLogEntries)
      .orderBy(desc(returnLogEntries.returnedAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/return-log error:", error);
    return NextResponse.json({ error: "Failed to fetch return log" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    unlockWithStoredPassword();
    const db = getDatabase();

    const entry = await db
      .insert(returnLogEntries)
      .values({
        id: randomUUID(),
        returnedAt: new Date(body.returnedAt),
        summary: body.summary,
        returnedBy: body.returnedBy,
        reason: body.reason,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/return-log error:", error);
    return NextResponse.json({ error: "Failed to create return log entry" }, { status: 500 });
  }
}
