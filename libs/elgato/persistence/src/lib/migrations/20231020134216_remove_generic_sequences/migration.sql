/*
  Warnings:

  - You are about to drop the `Sequence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SequenceStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DeviceToSequence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Sequence_name_key";

-- DropIndex
DROP INDEX "SequenceStep_sequenceId_stepNumber_key";

-- DropIndex
DROP INDEX "_DeviceToSequence_B_index";

-- DropIndex
DROP INDEX "_DeviceToSequence_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Sequence";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SequenceStep";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DeviceToSequence";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "lastSeen" DATETIME,
    "sunrise" BOOLEAN NOT NULL DEFAULT false,
    "sunset" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Device" ("fqdn", "host", "id", "lastSeen", "name", "port") SELECT "fqdn", "host", "id", "lastSeen", "name", "port" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
