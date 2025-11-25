-- CreateTable
CREATE TABLE "RecentlyRead"
(
  "cursor"    SERIAL NOT NULL,
  "userId"    UUID   NOT NULL,
  "articleId" UUID   NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyRead_cursor_key" ON "RecentlyRead" ("cursor");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyRead_userId_articleId_key" ON "RecentlyRead" ("userId", "articleId");

-- AddForeignKey
ALTER TABLE "RecentlyRead"
  ADD CONSTRAINT "RecentlyRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyRead"
  ADD CONSTRAINT "RecentlyRead_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
