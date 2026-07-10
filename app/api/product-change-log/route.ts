import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { productChangeLogEntries } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const result = await db
      .select()
      .from(productChangeLogEntries)
      .orderBy(desc(productChangeLogEntries.changedAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/product-change-log error:", error);
    return NextResponse.json({ error: "Failed to fetch product change log" }, { status: 500 });
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
      .insert(productChangeLogEntries)
      .values({
        id: randomUUID(),
        changedAt: new Date(body.changedAt),
        summary: body.summary,
        changedBy: body.changedBy,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/product-change-log error:", error);
    return NextResponse.json({ error: "Failed to create product change log entry" }, { status: 500 });
  }
}
