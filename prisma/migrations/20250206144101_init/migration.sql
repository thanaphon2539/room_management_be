/*
  Warnings:

  - A unique constraint covering the columns `[roomContactId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomCompanyId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `RoomCompany` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `RoomCompany` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idTax` on table `RoomCompany` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `RoomCompany` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `RoomContact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `RoomContact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idCard` on table `RoomContact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `RoomContact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RoomCompany" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "idTax" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- AlterTable
ALTER TABLE "RoomContact" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "idCard" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomContactId_key" ON "Room"("roomContactId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomCompanyId_key" ON "Room"("roomCompanyId");
