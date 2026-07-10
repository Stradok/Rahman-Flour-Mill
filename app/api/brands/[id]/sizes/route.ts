import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { packagingSizes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { label, weightKg, basePrice } = await req.json();
    if (!label || typeof weightKg !== "number" || typeof basePrice !== "number") {
      return NextResponse.json(
        { error: "label, weightKg, and basePrice are required" },
        { status: 400 }
      );
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    const sizeId = randomUUID();
    await db.insert(packagingSizes).values({
      id: sizeId,
      brandId: id,
      label,
      weightKg,
      basePrice,
    });

    const newSize = await db.select().from(packagingSizes).where(eq(packagingSizes.id, sizeId)).limit(1);
    return NextResponse.json(newSize[0], { status: 201 });
  } catch (err) {
    console.error("POST packaging size error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
