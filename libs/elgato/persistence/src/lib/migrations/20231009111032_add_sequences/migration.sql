-- CreateTable
CREATE TABLE "Sequence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "loop" BOOLEAN NOT NULL,
    "interval" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL,
    "cronTime" TEXT
);

-- CreateTable
CREATE TABLE "SequenceStep" (
    "sequenceId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "on" INTEGER,
    "hue" INTEGER,
    "saturation" INTEGER,
    "brightness" INTEGER,
    CONSTRAINT "SequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_name_key" ON "Sequence"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceStep_sequenceId_stepNumber_key" ON "SequenceStep"("sequenceId", "stepNumber");
