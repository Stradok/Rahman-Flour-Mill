import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Transaction } from "@/lib/types";

// Used only by the Undo-after-delete toast — recreates the exact same row
// (same id, same bill number) that was just deleted, if it hasn't already
// been restored (e.g. a duplicate/late click).
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tx = (await req.json()) as Transaction;

    unlockWithStoredPassword();
    const db = getDatabase();

    // Check if it already exists
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, tx.id))
      .limit(1)
      .then((res) => res[0]);

    if (existing) return NextResponse.json(existing);

    // Restore the transaction
    const restored = await db
      .insert(transactions)
      .values({
        id: tx.id,
        billNumber: tx.billNumber,
        createdAt: new Date(tx.createdAt),
        enteredBy: tx.enteredBy,
        brandId: tx.brandId,
        brandName: tx.brandName,
        packagingSizeId: tx.packagingSizeId,
        packagingLabel: tx.packagingLabel,
        weightKg: tx.weightKg,
        unitPrice: tx.unitPrice,
        quantity: tx.quantity,
        subtotal: tx.subtotal,
        paymentMode: tx.paymentMode,
        paymentMethod: tx.paymentMethod,
        status: tx.status,
        customerName: tx.customerName,
        customerCnic: tx.customerCnic,
        customerPhone: tx.customerPhone,
        amountPaid: tx.amountPaid,
        creditAmountLeft: tx.creditAmountLeft,
        returned: tx.returned ?? false,
        returnedAt: tx.returnedAt ? new Date(tx.returnedAt) : undefined,
        returnedBy: tx.returnedBy,
        returnReason: tx.returnReason,
      })
      .returning()
      .then((res) => res[0]);

    return NextResponse.json(restored, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions/restore error:", error);
    return NextResponse.json({ error: "Failed to restore transaction" }, { status: 500 });
  }
}
