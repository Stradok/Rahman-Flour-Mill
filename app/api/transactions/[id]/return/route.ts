import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";

// Whole-line-item returns only. If the bill is still credit-pending, the
// returned line's value comes straight off what's still owed on the bill —
// applied to every row sharing that bill number, since they share one balance.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { returnedBy, reason } = (await req.json()) as { returnedBy: string; reason: string };
    if (!returnedBy || !reason) {
      return NextResponse.json({ error: "returnedBy and reason are required" }, { status: 400 });
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Get the target transaction
    const target = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1)
      .then((res) => res[0]);

    if (!target || target.returned) {
      return NextResponse.json({ error: "Transaction not found or already returned" }, { status: 400 });
    }

    const returnedAt = new Date();
    const isCredit = target.status === "credit-pending";
    const newCreditLeft = isCredit
      ? Math.max((target.creditAmountLeft ?? 0) - target.subtotal, 0)
      : undefined;
    const newStatus = isCredit ? (newCreditLeft === 0 ? "paid" : "credit-pending") : undefined;

    // Update the target transaction
    await db
      .update(transactions)
      .set({
        returned: true,
        returnedAt,
        returnedBy,
        returnReason: reason,
        ...(isCredit ? { creditAmountLeft: newCreditLeft, status: newStatus } : {}),
      })
      .where(eq(transactions.id, id));

    // If credit transaction, update all other rows with same bill number
    if (isCredit) {
      await db
        .update(transactions)
        .set({ creditAmountLeft: newCreditLeft, status: newStatus })
        .where(and(eq(transactions.billNumber, target.billNumber), ne(transactions.id, id)));
    }

    // Return all transactions for this bill number
    const updated = await db
      .select()
      .from(transactions)
      .where(eq(transactions.billNumber, target.billNumber));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/transactions/[id]/return error:", error);
    return NextResponse.json({ error: "Failed to process return" }, { status: 500 });
  }
}
