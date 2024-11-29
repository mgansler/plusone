-- AlterTable
ALTER TABLE "_UserFeedToUserTag" ADD CONSTRAINT "_UserFeedToUserTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserFeedToUserTag_AB_unique";
