import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

interface IncomingItem {
  createdAt: string;
  enteredBy?: string;
  brandId: string;
  brandName: string;
  packagingSizeId: string;
  packagingLabel: string;
  weightKg: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  paymentMode: string;
  paymentMethod?: string;
  status: string;
  customerName?: string;
  customerCnic?: string;
  customerPhone?: string;
  amountPaid?: number;
  creditAmountLeft?: number;
}

// Every item in one checkout shares a single, freshly-generated bill number —
// a multi-brand cart is one bill, not N separate ones.
async function nextBillNumber(db: ReturnType<typeof getDatabase>): Promise<string> {
  const allTransactions = await db.select().from(transactions);
  let next = allTransactions.length + 1;
  let candidate = `BILL-${String(next).padStart(4, "0")}`;

  while (await db.select().from(transactions).where(eq(transactions.billNumber, candidate)).limit(1).then((res) => res.length > 0)) {
    next += 1;
    candidate = `BILL-${String(next).padStart(4, "0")}`;
  }
  return candidate;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items } = (await req.json()) as { items: IncomingItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items is required" }, { status: 400 });
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    const billNumber = await nextBillNumber(db);
    const created = [];

    for (const item of items) {
      const row = await db
        .insert(transactions)
        .values({
          id: randomUUID(),
          billNumber,
          createdAt: new Date(item.createdAt),
          enteredBy: item.enteredBy,
          brandId: item.brandId,
          brandName: item.brandName,
          packagingSizeId: item.packagingSizeId,
          packagingLabel: item.packagingLabel,
          weightKg: item.weightKg,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
          paymentMode: item.paymentMode,
          paymentMethod: item.paymentMethod,
          status: item.status,
          customerName: item.customerName,
          customerCnic: item.customerCnic,
          customerPhone: item.customerPhone,
          amountPaid: item.amountPaid,
          creditAmountLeft: item.creditAmountLeft,
        })
        .returning()
        .then((res) => res[0]);
      created.push(row);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions/batch error:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
