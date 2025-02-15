/*
  Warnings:

  - You are about to drop the `transactionElectricityUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactionWaterUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactionElectricityUnit" DROP CONSTRAINT "transactionElectricityUnit_roomId_fkey";

-- DropForeignKey
ALTER TABLE "transactionWaterUnit" DROP CONSTRAINT "transactionWaterUnit_roomId_fkey";

-- DropTable
DROP TABLE "transactionElectricityUnit";

-- DropTable
DROP TABLE "transactionWaterUnit";

-- CreateTable
CREATE TABLE "TransactionWaterUnit" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "unitBefor" INTEGER NOT NULL,
    "unitAfter" INTEGER NOT NULL,

    CONSTRAINT "TransactionWaterUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionElectricityUnit" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "unitBefor" INTEGER NOT NULL,
    "unitAfter" INTEGER NOT NULL,

    CONSTRAINT "TransactionElectricityUnit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionWaterUnit" ADD CONSTRAINT "TransactionWaterUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionElectricityUnit" ADD CONSTRAINT "TransactionElectricityUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
