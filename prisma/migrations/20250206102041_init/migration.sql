/*
  Warnings:

  - You are about to drop the `SettingElectricitybill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SettingWaterBill` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "SettingContactAddress" ADD COLUMN     "company" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "SettingElectricitybill";

-- DropTable
DROP TABLE "SettingWaterBill";

-- CreateTable
CREATE TABLE "SettingBillUnit" (
    "id" SERIAL NOT NULL,
    "waterUnit" INTEGER NOT NULL DEFAULT 0,
    "electricityUnit" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingBillUnit_pkey" PRIMARY KEY ("id")
);
