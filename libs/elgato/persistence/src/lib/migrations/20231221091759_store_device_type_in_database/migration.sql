-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'unknown',
    "lastSeen" DATETIME,
    "sunrise" BOOLEAN NOT NULL DEFAULT false,
    "sunset" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Device" ("fqdn", "host", "id", "lastSeen", "name", "port", "sunrise", "sunset") SELECT "fqdn", "host", "id", "lastSeen", "name", "port", "sunrise", "sunset" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
