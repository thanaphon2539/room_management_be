/*
  Warnings:

  - Added the required column `month` to the `TransactionBlank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `TransactionBlank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `TransactionCheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `TransactionCheckIn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `TransactionCheckOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `TransactionCheckOut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionBlank" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TransactionCheckIn" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TransactionCheckOut" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
