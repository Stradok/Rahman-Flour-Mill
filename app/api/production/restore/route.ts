import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { productionEntries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { ProductionEntry } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entry = (await req.json()) as ProductionEntry;

    unlockWithStoredPassword();
    const db = getDatabase();

    // Check if it already exists
    const existing = await db
      .select()
      .from(productionEntries)
      .where(eq(productionEntries.id, entry.id))
      .limit(1)
      .then((res) => res[0]);

    if (existing) return NextResponse.json(existing);

    // Restore the entry
    const restored = await db
      .insert(productionEntries)
      .values({
        id: entry.id,
        date: new Date(entry.date),
        enteredBy: entry.enteredBy,
        brandId: entry.brandId,
        brandName: entry.brandName,
        packagingSizeId: entry.packagingSizeId,
        packagingLabel: entry.packagingLabel,
        weightKg: entry.weightKg,
        bags: entry.bags,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(restored, { status: 201 });
  } catch (error) {
    console.error("POST /api/production/restore error:", error);
    return NextResponse.json({ error: "Failed to restore production entry" }, { status: 500 });
  }
}
