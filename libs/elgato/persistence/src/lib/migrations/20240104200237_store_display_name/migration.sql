/*
  Warnings:

  - Added the required column `displayName` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "address" TEXT,
    "port" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'unknown',
    "displayName" TEXT NOT NULL,
    "lastSeen" DATETIME,
    "sunrise" BOOLEAN NOT NULL DEFAULT false,
    "sunset" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Device" ("address", "fqdn", "host", "id", "lastSeen", "name", "port", "sunrise", "sunset", "type", "displayName") SELECT "address", "fqdn", "host", "id", "lastSeen", "name", "port", "sunrise", "sunset", "type", "name" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
