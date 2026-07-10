import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { brands } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    unlockWithStoredPassword();
    const db = getDatabase();
    await db.delete(brands).where(eq(brands.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE brand error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
