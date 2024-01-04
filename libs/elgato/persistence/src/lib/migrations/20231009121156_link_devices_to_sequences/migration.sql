-- CreateTable
CREATE TABLE "_DeviceToSequence" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DeviceToSequence_A_fkey" FOREIGN KEY ("A") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DeviceToSequence_B_fkey" FOREIGN KEY ("B") REFERENCES "Sequence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceToSequence_AB_unique" ON "_DeviceToSequence"("A", "B");

-- CreateIndex
CREATE INDEX "_DeviceToSequence_B_index" ON "_DeviceToSequence"("B");
