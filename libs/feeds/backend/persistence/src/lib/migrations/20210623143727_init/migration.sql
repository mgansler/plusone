-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "contentBody" TEXT,
    "guid" TEXT NOT NULL,
    "link" TEXT,
    "feedId" UUID NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feed" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserArticle" (
    "userId" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "unread" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "_FeedToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Article.guid_feedId_unique" ON "Article"("guid", "feedId");

-- CreateIndex
CREATE UNIQUE INDEX "Feed.feedUrl_unique" ON "Feed"("feedUrl");

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserArticle.userId_articleId_unique" ON "UserArticle"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "_FeedToUser_AB_unique" ON "_FeedToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_FeedToUser_B_index" ON "_FeedToUser"("B");

-- AddForeignKey
ALTER TABLE "Article" ADD FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArticle" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArticle" ADD FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeedToUser" ADD FOREIGN KEY ("A") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeedToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
