import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { costOverheadEntries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { CostOverheadEntry } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entry = (await req.json()) as CostOverheadEntry;

    unlockWithStoredPassword();
    const db = getDatabase();

    // Check if it already exists
    const existing = await db
      .select()
      .from(costOverheadEntries)
      .where(eq(costOverheadEntries.id, entry.id))
      .limit(1)
      .then((res) => res[0]);

    if (existing) return NextResponse.json(existing);

    // Restore the entry
    const restored = await db
      .insert(costOverheadEntries)
      .values({
        id: entry.id,
        createdAt: new Date(entry.createdAt),
        enteredBy: entry.enteredBy,
        wheatVolumeKg: entry.wheatVolumeKg,
        wheatRatePerKg: entry.wheatRatePerKg,
        supplierName: entry.supplierName,
        vehicleNumberPlate: entry.vehicleNumberPlate,
        category: entry.category,
        amount: entry.amount,
        note: entry.note,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(restored, { status: 201 });
  } catch (error) {
    console.error("POST /api/cost-ledger/restore error:", error);
    return NextResponse.json({ error: "Failed to restore cost ledger entry" }, { status: 500 });
  }
}
