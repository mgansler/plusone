-- AlterTable
ALTER TABLE "UserFeed"
  ALTER COLUMN "includeRead" SET DEFAULT true;

-- Update current setting
UPDATE "UserFeed"
SET "includeRead"= true
WHERE true;
