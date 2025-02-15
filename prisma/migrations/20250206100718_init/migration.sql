-- CreateTable
CREATE TABLE "SettingWaterBill" (
    "id" SERIAL NOT NULL,
    "unit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingWaterBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingElectricitybill" (
    "id" SERIAL NOT NULL,
    "unit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingElectricitybill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingContactAddress" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingContactAddress_pkey" PRIMARY KEY ("id")
);
