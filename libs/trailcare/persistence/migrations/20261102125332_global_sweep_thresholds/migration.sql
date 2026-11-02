-- CreateTable
CREATE TABLE "SweepSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "sweepGreenMaxDays" INTEGER NOT NULL DEFAULT 2,
    "sweepYellowMaxDays" INTEGER NOT NULL DEFAULT 4,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sweepGreenMaxDays" INTEGER,
    "sweepYellowMaxDays" INTEGER,
    "trailAreaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trail_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Trail" ("createdAt", "id", "name", "sweepGreenMaxDays", "sweepYellowMaxDays", "trailAreaId", "updatedAt") SELECT "createdAt", "id", "name", "sweepGreenMaxDays", "sweepYellowMaxDays", "trailAreaId", "updatedAt" FROM "Trail";
DROP TABLE "Trail";
ALTER TABLE "new_Trail" RENAME TO "Trail";
-- Trails with the former defaults follow the global thresholds from now on, only real deviations stay overrides
UPDATE "Trail" SET "sweepGreenMaxDays" = NULL, "sweepYellowMaxDays" = NULL WHERE "sweepGreenMaxDays" = 2 AND "sweepYellowMaxDays" = 4;
CREATE UNIQUE INDEX "Trail_trailAreaId_name_key" ON "Trail"("trailAreaId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
