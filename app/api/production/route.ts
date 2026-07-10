import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { productionEntries } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const result = await db
      .select()
      .from(productionEntries)
      .orderBy(desc(productionEntries.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/production error:", error);
    return NextResponse.json({ error: "Failed to fetch production entries" }, { status: 500 });
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
      .insert(productionEntries)
      .values({
        id: randomUUID(),
        date: new Date(body.date),
        enteredBy: body.enteredBy,
        brandId: body.brandId,
        brandName: body.brandName,
        packagingSizeId: body.packagingSizeId,
        packagingLabel: body.packagingLabel,
        weightKg: body.weightKg,
        bags: body.bags,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/production error:", error);
    return NextResponse.json({ error: "Failed to create production entry" }, { status: 500 });
  }
}
