import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { packagingSizes } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sizeId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sizeId } = await params;
    const { label, weightKg, basePrice } = await req.json();

    unlockWithStoredPassword();
    const db = getDatabase();

    await db
      .update(packagingSizes)
      .set({ label, weightKg, basePrice })
      .where(eq(packagingSizes.id, sizeId));

    const updated = await db
      .select()
      .from(packagingSizes)
      .where(eq(packagingSizes.id, sizeId))
      .limit(1);
    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("PATCH packaging size error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sizeId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sizeId } = await params;
    unlockWithStoredPassword();
    const db = getDatabase();
    await db.delete(packagingSizes).where(eq(packagingSizes.id, sizeId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE packaging size error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
