-- AlterTable
ALTER TABLE "Article"
  DROP COLUMN "content";

ALTER TABLE "Article"
  RENAME COLUMN "contentBody" to "content"
