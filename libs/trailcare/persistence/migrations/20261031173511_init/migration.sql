-- CreateTable
CREATE TABLE "TrailArea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Trail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sweepGreenMaxDays" INTEGER NOT NULL DEFAULT 2,
    "sweepYellowMaxDays" INTEGER NOT NULL DEFAULT 4,
    "trailAreaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trail_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrailAlias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trailId" INTEGER NOT NULL,
    CONSTRAINT "TrailAlias_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "comment" TEXT,
    "performedBy" TEXT,
    "createdBySessionId" TEXT,
    "trailId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CareEntry_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessPassword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "accessPasswordId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_accessPasswordId_fkey" FOREIGN KEY ("accessPasswordId") REFERENCES "AccessPassword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TrailArea_name_key" ON "TrailArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Trail_trailAreaId_name_key" ON "Trail"("trailAreaId", "name");

-- CreateIndex
CREATE INDEX "CareEntry_trailId_type_performedAt_idx" ON "CareEntry"("trailId", "type", "performedAt");
