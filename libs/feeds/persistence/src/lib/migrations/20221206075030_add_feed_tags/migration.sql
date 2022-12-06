-- Install uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable (add id)
ALTER TABLE "UserFeed"
  ADD COLUMN "id" UUID;

-- Populate id
UPDATE "UserFeed"
SET "id" = uuid_generate_v4();

-- Make id a primary key
ALTER TABLE "UserFeed"
  ALTER COLUMN "id" SET NOT NULL,
  ADD CONSTRAINT "UserFeed_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "UserTag"
(
  "id"     UUID NOT NULL,
  "name"   TEXT NOT NULL,
  "userId" UUID NOT NULL,

  CONSTRAINT "UserTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFeedToUserTag"
(
  "A" UUID NOT NULL,
  "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTag_userId_name_key" ON "UserTag" ("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFeedToUserTag_AB_unique" ON "_UserFeedToUserTag" ("A", "B");

-- CreateIndex
CREATE INDEX "_UserFeedToUserTag_B_index" ON "_UserFeedToUserTag" ("B");

-- AddForeignKey
ALTER TABLE "UserTag"
  ADD CONSTRAINT "UserTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFeedToUserTag"
  ADD CONSTRAINT "_UserFeedToUserTag_A_fkey" FOREIGN KEY ("A") REFERENCES "UserFeed" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFeedToUserTag"
  ADD CONSTRAINT "_UserFeedToUserTag_B_fkey" FOREIGN KEY ("B") REFERENCES "UserTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
