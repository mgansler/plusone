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
    "feedUrl" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,

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
CREATE TABLE "UserFeed" (
    "userId" UUID NOT NULL,
    "feedId" UUID NOT NULL,
    "title" TEXT NOT NULL
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
CREATE UNIQUE INDEX "UserFeed.userId_feedId_unique" ON "UserFeed"("userId", "feedId");

-- AddForeignKey
ALTER TABLE "Article" ADD FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArticle" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArticle" ADD FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeed" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeed" ADD FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
