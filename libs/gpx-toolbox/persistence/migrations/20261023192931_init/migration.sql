-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gpxContent" TEXT NOT NULL,
    "polyline" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "ratingTags" JSONB NOT NULL,
    "notes" TEXT,
    "stravaRouteId" TEXT,
    "stravaActivityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fahrten" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "stravaActivityId" TEXT,
    "riddenAt" DATETIME NOT NULL,
    "duration" INTEGER,
    "avgHr" INTEGER,
    "maxHr" INTEGER,
    "notes" TEXT,
    "weather" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fahrten_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "routes_stravaRouteId_key" ON "routes"("stravaRouteId");

-- CreateIndex
CREATE UNIQUE INDEX "routes_stravaActivityId_key" ON "routes"("stravaActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "fahrten_stravaActivityId_key" ON "fahrten"("stravaActivityId");
