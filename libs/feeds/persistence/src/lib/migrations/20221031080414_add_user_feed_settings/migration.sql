-- CreateEnum
CREATE TYPE "Order" AS ENUM ('ASC', 'DESC');

-- AlterTable
ALTER TABLE "UserFeed" ADD COLUMN     "includeRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" "Order" NOT NULL DEFAULT 'DESC';
