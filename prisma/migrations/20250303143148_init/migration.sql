/*
  Warnings:

  - You are about to drop the column `month` on the `TransactionBlank` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `TransactionBlank` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `TransactionCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `TransactionCheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `TransactionCheckOut` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `TransactionCheckOut` table. All the data in the column will be lost.
  - Changed the type of `date` on the `TransactionBlank` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `TransactionCheckIn` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `date` on the `TransactionCheckOut` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TransactionBlank" DROP COLUMN "month",
DROP COLUMN "year",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TransactionCheckIn" DROP COLUMN "month",
DROP COLUMN "year",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TransactionCheckOut" DROP COLUMN "month",
DROP COLUMN "year",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
