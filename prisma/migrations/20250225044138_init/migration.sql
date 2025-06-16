/*
  Warnings:

  - You are about to drop the column `roomId` on the `RoomCompany` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `RoomContact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoomCompany" DROP CONSTRAINT "RoomCompany_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomContact" DROP CONSTRAINT "RoomContact_roomId_fkey";

-- DropIndex
DROP INDEX "Room_roomCompanyId_key";

-- DropIndex
DROP INDEX "Room_roomContactId_key";

-- DropIndex
DROP INDEX "RoomCompany_roomId_key";

-- DropIndex
DROP INDEX "RoomContact_roomId_key";

-- AlterTable
ALTER TABLE "RoomCompany" DROP COLUMN "roomId";

-- AlterTable
ALTER TABLE "RoomContact" DROP COLUMN "roomId";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomContactId_fkey" FOREIGN KEY ("roomContactId") REFERENCES "RoomContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomCompanyId_fkey" FOREIGN KEY ("roomCompanyId") REFERENCES "RoomCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
