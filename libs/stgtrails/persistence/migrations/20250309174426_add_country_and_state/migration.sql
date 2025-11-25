-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrailArea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "threshold" REAL NOT NULL DEFAULT 0.33,
    "country" TEXT NOT NULL DEFAULT 'unknown',
    "state" TEXT NOT NULL DEFAULT 'unknown'
);
INSERT INTO "new_TrailArea" ("id", "latitude", "longitude", "name", "threshold") SELECT "id", "latitude", "longitude", "name", "threshold" FROM "TrailArea";
DROP TABLE "TrailArea";
ALTER TABLE "new_TrailArea" RENAME TO "TrailArea";
CREATE UNIQUE INDEX "TrailArea_name_key" ON "TrailArea"("name");
CREATE TABLE "new_WeatherData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "temperature2m" REAL NOT NULL,
    "rain" REAL NOT NULL,
    "soilMoisture0To1cm" REAL NOT NULL,
    "soilMoisture1To3cm" REAL NOT NULL,
    "soilMoisture3To9cm" REAL NOT NULL,
    "soilMoisture9To27cm" REAL NOT NULL,
    "soilTemperature0cm" REAL NOT NULL,
    "soilTemperature6cm" REAL NOT NULL,
    "windGusts10m" REAL NOT NULL,
    "trailAreaId" INTEGER NOT NULL,
    CONSTRAINT "WeatherData_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WeatherData" ("id", "rain", "soilMoisture0To1cm", "soilMoisture1To3cm", "soilMoisture3To9cm", "soilMoisture9To27cm", "soilTemperature0cm", "soilTemperature6cm", "temperature2m", "time", "trailAreaId", "windGusts10m") SELECT "id", "rain", "soilMoisture0To1cm", "soilMoisture1To3cm", "soilMoisture3To9cm", "soilMoisture9To27cm", "soilTemperature0cm", "soilTemperature6cm", "temperature2m", "time", "trailAreaId", "windGusts10m" FROM "WeatherData";
DROP TABLE "WeatherData";
ALTER TABLE "new_WeatherData" RENAME TO "WeatherData";
CREATE UNIQUE INDEX "WeatherData_trailAreaId_time_key" ON "WeatherData"("trailAreaId", "time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
