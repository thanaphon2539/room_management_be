-- CreateTable
CREATE TABLE "TransactionBlank" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionBlank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionBlank" ADD CONSTRAINT "TransactionBlank_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
