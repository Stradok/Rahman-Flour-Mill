import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { wheatGrindingLogs } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const result = await db
      .select()
      .from(wheatGrindingLogs)
      .orderBy(desc(wheatGrindingLogs.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/grinding error:", error);
    return NextResponse.json({ error: "Failed to fetch grinding logs" }, { status: 500 });
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
      .insert(wheatGrindingLogs)
      .values({
        id: randomUUID(),
        date: new Date(body.date),
        enteredBy: body.enteredBy,
        wheatGrindedKg: body.wheatGrindedKg,
        note: body.note,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/grinding error:", error);
    return NextResponse.json({ error: "Failed to create grinding log" }, { status: 500 });
  }
}
