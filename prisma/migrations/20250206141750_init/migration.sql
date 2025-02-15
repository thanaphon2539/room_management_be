-- DropForeignKey
ALTER TABLE "RoomCompany" DROP CONSTRAINT "RoomCompany_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomContact" DROP CONSTRAINT "RoomContact_roomId_fkey";

-- AddForeignKey
ALTER TABLE "RoomContact" ADD CONSTRAINT "RoomContact_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCompany" ADD CONSTRAINT "RoomCompany_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
