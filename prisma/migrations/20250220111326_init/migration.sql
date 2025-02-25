/*
  Warnings:

  - Added the required column `number` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "typeBill" AS ENUM ('invoice', 'receipt');

-- AlterTable
ALTER TABLE "TransactionBill" ADD COLUMN     "number" TEXT NOT NULL,
ADD COLUMN     "type" "typeBill" NOT NULL;
