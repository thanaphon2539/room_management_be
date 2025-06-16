/*
  Warnings:

  - Added the required column `totalNoVat` to the `TransactionBill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionBill" ADD COLUMN     "totalNoVat" TEXT NOT NULL;
