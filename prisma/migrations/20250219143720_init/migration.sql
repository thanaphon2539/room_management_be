-- CreateEnum
CREATE TYPE "statusBill" AS ENUM ('waiting', 'succuess', 'fail');

-- CreateTable
CREATE TABLE "TransactionBill" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "statusBill" NOT NULL,

    CONSTRAINT "TransactionBill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionBill" ADD CONSTRAINT "TransactionBill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
