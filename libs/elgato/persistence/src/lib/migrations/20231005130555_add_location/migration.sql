-- CreateTable
CREATE TABLE "Location"
(
  "name"      TEXT NOT NULL,
  "longitude" REAL NOT NULL,
  "latitude"  REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location" ("name");
