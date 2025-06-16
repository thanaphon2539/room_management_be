-- CreateTable
CREATE TABLE "RunningNumber" (
    "id" SERIAL NOT NULL,
    "type" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "RunningNumber_pkey" PRIMARY KEY ("id")
);
