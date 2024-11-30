/*
  Warnings:

  - Added the required column `soilTemperature0cm` to the `WeatherData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `soilTemperature6cm` to the `WeatherData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeatherData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "temperature2m" REAL NOT NULL,
    "rain" REAL NOT NULL,
    "soilMoisture0To1cm" REAL NOT NULL,
    "soilMoisture1To3cm" REAL NOT NULL,
    "soilMoisture3To9cm" REAL NOT NULL,
    "soilMoisture9To27cm" REAL NOT NULL,
    "soilTemperature0cm" REAL NOT NULL DEFAULT 0,
    "soilTemperature6cm" REAL NOT NULL DEFAULT 0,
    "trailAreaId" INTEGER NOT NULL,
    CONSTRAINT "WeatherData_trailAreaId_fkey" FOREIGN KEY ("trailAreaId") REFERENCES "TrailArea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WeatherData" ("id", "rain", "soilMoisture0To1cm", "soilMoisture1To3cm", "soilMoisture3To9cm", "soilMoisture9To27cm", "temperature2m", "time", "trailAreaId") SELECT "id", "rain", "soilMoisture0To1cm", "soilMoisture1To3cm", "soilMoisture3To9cm", "soilMoisture9To27cm", "temperature2m", "time", "trailAreaId" FROM "WeatherData";
DROP TABLE "WeatherData";
ALTER TABLE "new_WeatherData" RENAME TO "WeatherData";
CREATE UNIQUE INDEX "WeatherData_trailAreaId_time_key" ON "WeatherData"("trailAreaId", "time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
