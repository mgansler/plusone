-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrailArea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "threshold" REAL NOT NULL DEFAULT 0.33
);
INSERT INTO "new_TrailArea" ("id", "latitude", "longitude", "name") SELECT "id", "latitude", "longitude", "name" FROM "TrailArea";
DROP TABLE "TrailArea";
ALTER TABLE "new_TrailArea" RENAME TO "TrailArea";
CREATE UNIQUE INDEX "TrailArea_name_key" ON "TrailArea"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
