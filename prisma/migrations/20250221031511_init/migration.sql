/*
  Warnings:

  - You are about to drop the column `amount` on the `TransactionBill` table. All the data in the column will be lost.
  - Added the required column `itemNoVat` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemVat` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat3` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat5` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat7` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionBill" DROP COLUMN "amount",
ADD COLUMN     "itemNoVat" TEXT NOT NULL,
ADD COLUMN     "itemVat" TEXT NOT NULL,
ADD COLUMN     "total" TEXT NOT NULL,
ADD COLUMN     "vat3" TEXT NOT NULL,
ADD COLUMN     "vat5" TEXT NOT NULL,
ADD COLUMN     "vat7" TEXT NOT NULL;
