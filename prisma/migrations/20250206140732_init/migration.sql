/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `RoomCompany` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roomId]` on the table `RoomContact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RoomCompany" DROP CONSTRAINT "RoomCompany_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomContact" DROP CONSTRAINT "RoomContact_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomCompanyId" INTEGER,
ADD COLUMN     "roomContactId" INTEGER;

-- AlterTable
ALTER TABLE "RoomCompany" ALTER COLUMN "roomId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RoomContact" ALTER COLUMN "roomId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RoomCompany_roomId_key" ON "RoomCompany"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomContact_roomId_key" ON "RoomContact"("roomId");

-- AddForeignKey
ALTER TABLE "RoomContact" ADD CONSTRAINT "RoomContact_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCompany" ADD CONSTRAINT "RoomCompany_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
