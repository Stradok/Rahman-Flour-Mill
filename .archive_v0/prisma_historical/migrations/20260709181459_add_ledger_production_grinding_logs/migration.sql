-- CreateTable
CREATE TABLE "CostOverheadEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "enteredBy" TEXT,
    "wheatVolumeKg" DOUBLE PRECISION,
    "wheatRatePerKg" DOUBLE PRECISION,
    "supplierName" TEXT,
    "vehicleNumberPlate" TEXT,
    "category" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "CostOverheadEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "enteredBy" TEXT,
    "brandId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "packagingSizeId" TEXT NOT NULL,
    "packagingLabel" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bags" INTEGER NOT NULL,

    CONSTRAINT "ProductionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheatGrindingLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "enteredBy" TEXT,
    "wheatGrindedKg" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "WheatGrindingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletionLogEntry" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DeletionLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductChangeLogEntry" (
    "id" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,

    CONSTRAINT "ProductChangeLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnLogEntry" (
    "id" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "returnedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "ReturnLogEntry_pkey" PRIMARY KEY ("id")
);
