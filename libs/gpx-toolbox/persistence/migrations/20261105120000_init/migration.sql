-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "identities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "strava_connections" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "stravaId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "strava_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gpxContent" TEXT NOT NULL,
    "polyline" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "distance" REAL,
    "elevationGain" REAL,
    "minLat" REAL,
    "maxLat" REAL,
    "minLng" REAL,
    "maxLng" REAL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "ratingTags" JSONB NOT NULL,
    "notes" TEXT,
    "userId" TEXT,
    "stravaRouteId" TEXT,
    "stravaActivityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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

-- CreateIndex
CREATE INDEX "identities_userId_idx" ON "identities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "identities_provider_subject_key" ON "identities"("provider", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "strava_connections_stravaId_key" ON "strava_connections"("stravaId");

-- CreateIndex
CREATE UNIQUE INDEX "routes_stravaRouteId_key" ON "routes"("stravaRouteId");

-- CreateIndex
CREATE UNIQUE INDEX "routes_stravaActivityId_key" ON "routes"("stravaActivityId");

-- CreateIndex
CREATE INDEX "routes_userId_minLat_maxLat_idx" ON "routes"("userId", "minLat", "maxLat");

-- CreateIndex
CREATE UNIQUE INDEX "activities_stravaActivityId_key" ON "activities"("stravaActivityId");

