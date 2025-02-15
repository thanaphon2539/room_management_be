/*
  Warnings:

  - A unique constraint covering the columns `[nameRoom]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nameRoom` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "nameRoom" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_nameRoom_key" ON "Room"("nameRoom");
