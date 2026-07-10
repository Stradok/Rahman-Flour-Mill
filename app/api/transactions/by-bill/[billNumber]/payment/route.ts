import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Applies to every line item sharing this bill number, since a multi-item bill
// has one shared balance rather than a separate one per brand/size.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ billNumber: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { billNumber } = await params;
    const { amountReceived } = (await req.json()) as { amountReceived: number };
    if (typeof amountReceived !== "number" || amountReceived <= 0) {
      return NextResponse.json({ error: "amountReceived must be a positive number" }, { status: 400 });
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Get the first existing transaction for this bill
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.billNumber, billNumber))
      .limit(1)
      .then((res) => res[0]);

    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const newAmountPaid = (existing.amountPaid ?? 0) + amountReceived;
    const newCreditLeft = Math.max((existing.creditAmountLeft ?? 0) - amountReceived, 0);
    const newStatus = newCreditLeft === 0 ? "paid" : "credit-pending";

    // Update all transactions with this bill number
    await db
      .update(transactions)
      .set({ amountPaid: newAmountPaid, creditAmountLeft: newCreditLeft, status: newStatus })
      .where(eq(transactions.billNumber, billNumber));

    // Return all updated transactions for this bill
    const updated = await db
      .select()
      .from(transactions)
      .where(eq(transactions.billNumber, billNumber));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/transactions/by-bill/[billNumber]/payment error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
