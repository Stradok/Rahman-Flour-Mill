import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    unlockWithStoredPassword();
    const db = getDatabase();

    await db.delete(transactions).where(eq(transactions.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
