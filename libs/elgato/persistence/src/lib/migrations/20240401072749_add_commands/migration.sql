-- CreateTable
CREATE TABLE "CommandAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "macAddress" TEXT NOT NULL,
    "commandId" INTEGER NOT NULL,
    "on" BOOLEAN NOT NULL,
    "powerOnly" BOOLEAN NOT NULL,
    "brightness" INTEGER,
    "hue" INTEGER,
    "saturation" INTEGER,
    "temperature" INTEGER,
    CONSTRAINT "CommandAction_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Command" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Command_name_key" ON "Command"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Command_hash_key" ON "Command"("hash");
