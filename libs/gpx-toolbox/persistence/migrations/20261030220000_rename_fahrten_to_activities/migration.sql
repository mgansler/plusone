-- Rename "fahrten" to "activities" without losing data.
-- Prisma would drop and recreate the table, so the rows are copied over by hand.
-- The new table uses the constraint and index names Prisma expects for "activities".
PRAGMA foreign_keys=OFF;

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "userId" TEXT,
    "stravaActivityId" TEXT,
    "title" TEXT,
    "riddenAt" DATETIME NOT NULL,
    "duration" INTEGER,
    "avgHr" INTEGER,
    "maxHr" INTEGER,
    "notes" TEXT,
    "weather" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "activities_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CopyData
INSERT INTO "activities" ("id", "routeId", "userId", "stravaActivityId", "title", "riddenAt", "duration", "avgHr", "maxHr", "notes", "weather", "createdAt", "updatedAt")
SELECT "id", "routeId", "userId", "stravaActivityId", "title", "riddenAt", "duration", "avgHr", "maxHr", "notes", "weather", "createdAt", "updatedAt"
FROM "fahrten";

-- DropTable
DROP TABLE "fahrten";

-- CreateIndex
CREATE UNIQUE INDEX "activities_stravaActivityId_key" ON "activities"("stravaActivityId");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
