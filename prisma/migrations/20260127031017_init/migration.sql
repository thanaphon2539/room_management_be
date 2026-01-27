-- CreateTable
CREATE TABLE "TransactionCalculatorBill" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rentTotal" TEXT NOT NULL DEFAULT '0',
    "totalNoVat" TEXT NOT NULL,
    "itemNoVat" TEXT NOT NULL,
    "itemVat" TEXT NOT NULL,
    "vat3" TEXT NOT NULL,
    "vat5" TEXT NOT NULL,
    "vat7" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCalculatorBill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionCalculatorBill" ADD CONSTRAINT "TransactionCalculatorBill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
