-- CreateTable
CREATE TABLE "TransactionCheckIn" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionCheckOut" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionCheckOut_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionCheckIn" ADD CONSTRAINT "TransactionCheckIn_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionCheckOut" ADD CONSTRAINT "TransactionCheckOut_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
