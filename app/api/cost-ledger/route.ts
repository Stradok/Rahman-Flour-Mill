import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/authz";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { costOverheadEntries } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const session = await requireOwner();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const result = await db
      .select()
      .from(costOverheadEntries)
      .orderBy(desc(costOverheadEntries.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/cost-ledger error:", error);
    return NextResponse.json({ error: "Failed to fetch cost ledger entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOwner();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    unlockWithStoredPassword();
    const db = getDatabase();

    const entryId = randomUUID();
    const entry = await db
      .insert(costOverheadEntries)
      .values({
        id: entryId,
        createdAt: new Date(body.createdAt),
        enteredBy: body.enteredBy,
        wheatVolumeKg: body.wheatVolumeKg,
        wheatRatePerKg: body.wheatRatePerKg,
        supplierName: body.supplierName,
        vehicleNumberPlate: body.vehicleNumberPlate,
        category: body.category,
        amount: body.amount,
        note: body.note,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/cost-ledger error:", error);
    return NextResponse.json({ error: "Failed to create cost ledger entry" }, { status: 500 });
  }
}
