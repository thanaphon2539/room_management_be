-- CreateTable
CREATE TABLE "transactionWaterUnit" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "unitBefor" INTEGER NOT NULL,
    "unitAfter" INTEGER NOT NULL,

    CONSTRAINT "transactionWaterUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactionElectricityUnit" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "unitBefor" INTEGER NOT NULL,
    "unitAfter" INTEGER NOT NULL,

    CONSTRAINT "transactionElectricityUnit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactionWaterUnit" ADD CONSTRAINT "transactionWaterUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactionElectricityUnit" ADD CONSTRAINT "transactionElectricityUnit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
