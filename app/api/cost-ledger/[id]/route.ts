import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/authz";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { costOverheadEntries } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOwner();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    unlockWithStoredPassword();
    const db = getDatabase();

    await db.delete(costOverheadEntries).where(eq(costOverheadEntries.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cost-ledger/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete cost ledger entry" }, { status: 500 });
  }
}
