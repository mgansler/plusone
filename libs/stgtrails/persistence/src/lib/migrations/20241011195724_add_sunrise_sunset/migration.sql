-- CreateTable
CREATE TABLE "SunriseSunset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "sunrise" DATETIME NOT NULL,
    "sunset" DATETIME NOT NULL,
    "trailAreaId" INTEGER NOT NULL,
    CONSTRAINT "SunriseSunset_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SunriseSunset_trailAreaId_date_key" ON "SunriseSunset"("trailAreaId", "date");
