-- AlterTable
ALTER TABLE "routes" ADD COLUMN "distance" REAL;
ALTER TABLE "routes" ADD COLUMN "maxLat" REAL;
ALTER TABLE "routes" ADD COLUMN "maxLng" REAL;
ALTER TABLE "routes" ADD COLUMN "minLat" REAL;
ALTER TABLE "routes" ADD COLUMN "minLng" REAL;

-- CreateIndex
CREATE INDEX "routes_userId_minLat_maxLat_idx" ON "routes"("userId", "minLat", "maxLat");
