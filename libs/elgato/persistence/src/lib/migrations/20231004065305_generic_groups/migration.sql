/*
  Warnings:

  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `roomId` on the `Device` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Room";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isRoom" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "_DeviceToGroup" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DeviceToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DeviceToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "lastSeen" DATETIME
);
INSERT INTO "new_Device" ("fqdn", "host", "id", "lastSeen", "name", "port") SELECT "fqdn", "host", "id", "lastSeen", "name", "port" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceToGroup_AB_unique" ON "_DeviceToGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_DeviceToGroup_B_index" ON "_DeviceToGroup"("B");
