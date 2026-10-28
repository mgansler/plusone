-- Backfill titles for Fahrten imported from Strava before the title column existed.
-- Routes created from a Strava activity carry the activity name as route name.
UPDATE "fahrten"
SET "title" = (
  SELECT "routes"."name" FROM "routes" WHERE "routes"."stravaActivityId" = "fahrten"."stravaActivityId"
)
WHERE "title" IS NULL AND "stravaActivityId" IS NOT NULL;
