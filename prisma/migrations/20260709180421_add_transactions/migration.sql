-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "enteredBy" TEXT,
    "brandId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "packagingSizeId" TEXT NOT NULL,
    "packagingLabel" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL,
    "customerName" TEXT,
    "customerCnic" TEXT,
    "customerPhone" TEXT,
    "amountPaid" DOUBLE PRECISION,
    "creditAmountLeft" DOUBLE PRECISION,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnedAt" TIMESTAMP(3),
    "returnedBy" TEXT,
    "returnReason" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_billNumber_idx" ON "Transaction"("billNumber");
