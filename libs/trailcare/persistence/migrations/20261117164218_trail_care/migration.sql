-- CreateTable
CREATE TABLE "CareNeedCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CareNeed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "description" TEXT,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" DATETIME,
    "trailId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CareNeed_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CareNeedCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CareNeed_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessPassword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "isCareTeam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AccessPassword" ("createdAt", "id", "label", "lastUsedAt", "passwordHash", "updatedAt") SELECT "createdAt", "id", "label", "lastUsedAt", "passwordHash", "updatedAt" FROM "AccessPassword";
DROP TABLE "AccessPassword";
ALTER TABLE "new_AccessPassword" RENAME TO "AccessPassword";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CareNeedCategory_name_key" ON "CareNeedCategory"("name");

-- CreateIndex
CREATE INDEX "CareNeed_trailId_isDone_idx" ON "CareNeed"("trailId", "isDone");
