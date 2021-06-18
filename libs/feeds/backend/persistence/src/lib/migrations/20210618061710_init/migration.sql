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

-- CreateIndex
CREATE UNIQUE INDEX "Article.guid_feedId_unique" ON "Article"("guid", "feedId");

-- CreateIndex
CREATE UNIQUE INDEX "User.username_unique" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Article" ADD FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
