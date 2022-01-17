/*
  Warnings:

  - A unique constraint covering the columns `[cursor]` on the table `UserArticle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserArticle" ADD COLUMN     "cursor" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserArticle.cursor_unique" ON "UserArticle"("cursor");
