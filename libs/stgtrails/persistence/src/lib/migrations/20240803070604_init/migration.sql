-- CreateTable
CREATE TABLE "TrailArea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Trail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trailAreaId" INTEGER NOT NULL,
    CONSTRAINT "Trail_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrailName" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "trailId" INTEGER NOT NULL,
    CONSTRAINT "TrailName_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "temperature2m" REAL NOT NULL,
    "rain" REAL NOT NULL,
    "soilMoisture0To1cm" REAL NOT NULL,
    "soilMoisture1To3cm" REAL NOT NULL,
    "soilMoisture3To9cm" REAL NOT NULL,
    "soilMoisture9To27cm" REAL NOT NULL,
    "trailAreaId" INTEGER NOT NULL,
    CONSTRAINT "WeatherData_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TrailArea_name_key" ON "TrailArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherData_trailAreaId_time_key" ON "WeatherData"("trailAreaId", "time");
