-- CreateTable
CREATE TABLE "DiscoveredDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fqdn" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "ipv4" TEXT,
    "port" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "isControlled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "lastSeen" DATETIME,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "sunrise" BOOLEAN NOT NULL DEFAULT false,
    "sunset" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brightness" INTEGER NOT NULL,
    "hue" INTEGER,
    "saturation" INTEGER,
    "temperature" INTEGER
);

-- CreateTable
CREATE TABLE "Location" (
    "name" TEXT NOT NULL,
    "longitude" REAL NOT NULL,
    "latitude" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");
