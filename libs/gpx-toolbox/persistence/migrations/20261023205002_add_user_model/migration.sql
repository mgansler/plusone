-- AlterTable
ALTER TABLE "fahrten" ADD COLUMN "userId" TEXT;

-- AlterTable
ALTER TABLE "routes" ADD COLUMN "userId" TEXT;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stravaId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_stravaId_key" ON "users"("stravaId");
