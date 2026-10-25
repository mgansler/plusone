# GPX Toolbox — Full-Stack App Implementierungsplan

## Context

`gpx-toolbox` ist aktuell eine reine Frontend-App zum Anzeigen von GPX-Tracks. Ziel ist eine Full-Stack-App zur Verwaltung von GPX-Routen und Fahrten, analog zu `stgtrails` (NestJS + Prisma + SQLite + Orval). Nutzer sollen Strava-Routen und -Activities importieren, manuell GPX-Dateien hochladen, Routen markieren/bewerten und nach Distanz zum Startpunkt suchen können.

**Technologien:** NestJS Backend, SQLite/Prisma, Orval-Codegen, TanStack Router, Leaflet. Alle Dependencies existieren bereits im Monorepo.

---

## Phase 0 — Projekt-Gerüst

**Ziel:** Backend-Projekt erstellen, Prisma-Schema pushen, Backend startet und baut.

### Neue Projekte

| Projekt                   | Typ        | Quelle                            |
| ------------------------- | ---------- | --------------------------------- |
| `gpx-toolbox-backend`     | NestJS App | Kopie von `stgtrails-backend`     |
| `gpx-toolbox-persistence` | Prisma Lib | Kopie von `stgtrails-persistence` |
| `gpx-toolbox-api-client`  | Orval Lib  | Kopie von `stgtrails-api-client`  |
| `gpx-toolbox-app`         | Docker     | Kopie von `stgtrails-app`         |

### Dateien erstellen

**Backend** (`apps/gpx-toolbox/gpx-toolbox-backend/`):

- `src/main.ts`, `src/setup-api.ts`, `src/generate-openapi-spec.ts` — von stgtrails kopieren
- `src/app/app.module.ts`, `src/app/config.ts`, `src/app/app.service.ts`, `src/app/health.controller.ts` — von stgtrails kopieren
- `webpack.config.js`, `tsconfig.*`, `vite.config.mts`, `project.json`, `package.json`, `.local.env` — von stgtrails kopieren

**Persistence** (`libs/gpx-toolbox/persistence/`):

- `schema.prisma` — neues Schema (siehe unten)
- `prisma.config.ts`, `src/lib/prisma.service.ts`, `src/lib/prisma.module.ts`, `src/index.ts` — von stgtrails kopieren
- `src/lib/create-adapter.ts` — von stgtrails kopieren (für SQLite)
- `project.json`, `eslint.config.js`, `tsconfig.*` — von stgtrails kopieren

**API Client** (`libs/gpx-toolbox/api-client/`):

- `orval.config.cjs`, `src/custom-axios.ts`, `src/validated-client.ts` — von stgtrails kopieren
- `project.json`, `eslint.config.js`, `tsconfig.*` — von stgtrails kopieren

### Dateien modifizieren

- `nx.json` — Plugin `include` um `gpx-toolbox-backend/**`, `gpx-toolbox-persistence/**`, `gpx-toolbox-api-client/**`, `gpx-toolbox-app/**` erweitern
- `tsconfig.base.json` — Path Mappings für `@plusone/gpx-toolbox-persistence` und `@plusone/gpx-toolbox-api-client`
- `package.json` (root) — Dependencies für Backend hinzufügen (`@nestjs/jwt`, etc. — existieren bereits)

### Prisma Schema

```prisma
datasource db {
  provider = "sqlite"
}

generator client {
  provider   = "prisma-client"
  output     = "src/lib/client"
  engineType = "client"
}

model Route {
  id            String      @id @default(uuid())
  name          String
  description   String?
  gpxContent    String      // Raw GPX XML
  polyline      Json        // [{ lat: Float, lng: Float }]
  stats         Json        // { distance, elevationGain, elevationLoss }
  source        RouteSource
  status        RouteStatus @default(planned)
  ratingTags    String[]    // ["Nochmal fahren", "Anpassung nötig", ...]
  notes         String?
  stravaRouteId String?     @unique
  stravaActivityId String?   @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  fahrten       Fahrt[]

  @@map("routes")
}

enum RouteSource {
  strava-route
  strava-activity
  manual-import
}

enum RouteStatus {
  planned
  ridden
  "found-online"
}

model Fahrt {
  id              String   @id @default(uuid())
  routeId         String
  stravaActivityId String?  @unique
  riddenAt        DateTime
  duration        Int?     // Sekunden
  avgHr           Int?
  maxHr           Int?
  notes           String?
  weather         String?  // JSON: Open-Meteo Daten zum Fahrzeitpunkt
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  route           Route    @relation(fields: [routeId], references: [id], onDelete: Cascade)

  @@map("fahrten")
}
```

### Verifikation

```bash
nx run gpx-toolbox-backend:build    # Bau muss durchlaufen
nx run gpx-toolbox-backend:serve    # Backend startet auf Port 3333
curl http://localhost:3333/api/health
```

---

## Phase 1 — Route CRUD + GPX-Import

**Ziel:** Routes anlegen, listen, bearbeiten, löschen. GPX-Datei hochladen → automatisch parsen, stats berechnen, speichern.

### Backend

**Neue Dateien:**

| Datei                                                                  | Beschreibung            |
| ---------------------------------------------------------------------- | ----------------------- |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/routes.controller.ts`    | Route CRUD + GPX-Upload |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/routes.service.ts`       | Route Business Logic    |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/routes.module.ts`        | NestJS Module           |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/create-route.dto.ts` | Create Route DTO        |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/update-route.dto.ts` | Update Route DTO        |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/import-gpx.dto.ts`   | GPX Upload DTO          |

**Wichtige Endpunkte:**

```
POST   /api/routes              # GPX-Upload + Import (multipart)
GET    /api/routes              # Route-Liste (mit Query-Filtern)
GET    /api/routes/:id          # Route Detail
PUT    /api/routes/:id          # Route bearbeiten
DELETE /api/routes/:id          # Route löschen
GET    /api/routes/:id/export   # GPX-Export
```

**GPX-Import Pipeline:**

1. File Upload empfangen (multipart)
2. `parseGpx()` aus `libs/gpx` aufrufen → TrackPoint[]
3. `analyzeGpx()` aus `libs/gpx` aufrufen → TrackOverview mit Stats
4. Polyline extrahieren → JSON speichern
5. Route in DB einfügen

### Frontend

**Neue Dateien:**

| Datei                                                                  | Beschreibung                              |
| ---------------------------------------------------------------------- | ----------------------------------------- |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/index.tsx`         | Route-Liste mit Filtern                   |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/$routeId.tsx`      | Route-Detail                              |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/new.tsx`           | GPX-Upload (Wiederverwendung von Sidebar) |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/$routeId/edit.tsx` | Route bearbeiten                          |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/RouteList.tsx`        | Sortierbare Liste                         |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/RouteCard.tsx`        | Route-Item                                |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/RouteDetail.tsx`      | Detail-Ansicht                            |

**Wiederverwendete Komponenten:**

- `Map.tsx` — Kartenansicht
- `ElevationProfile.tsx` — Höhenprofil
- `SegmentOverlay.tsx` — Track-Overlay
- `RangeSlider.tsx` — Segment-Slider
- `TrackInfo.tsx` — Track-Stats
- `SegmentStats.tsx` — Segment-Details

### Orval Codegen

Nachdem Routes erstellt sind: `nx run gpx-toolbox-backend:generate-api-spec` → `nx run gpx-toolbox-api-client:generate-api-client`

### Verifikation

```bash
# Backend starten
nx run gpx-toolbox-backend:serve

# Route erstellen (GPX-Upload)
curl -X POST http://localhost:3333/api/routes \
  -F "file=@tracks/MdRzA.gpx" \
  -F "name=Test Route"

# Route-Liste abrufen
curl http://localhost:3333/api/routes
```

---

## Phase 2 — Strava OAuth + Auth

**Ziel:** Nutzer kann sich mit Strava einloggen, Session wird verwaltet.

### Backend

**Neue Dateien:**

| Datei                                                             | Beschreibung                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/auth.controller.ts` | Auth Endpunkte                                                            |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/auth.service.ts`    | OAuth Flow + JWT                                                          |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/strava.service.ts`  | Strava API Client                                                         |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/strava.module.ts`   | Strava Module                                                             |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/config.ts`          | + STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI, JWT_SECRET |

**Auth Flow:**

```
Frontend                    Backend                     Strava
   |                           |                           |
   |  GET /api/auth/strava     |                           |
   |  → { authorizationUrl }  |                           |
   |                           |                           |
   |  Redirect to authorizationUrl                        |
   |  (user approves)                                       |
   |                           |                           |
   |  GET /api/auth/strava/callback?code=...              |
   |                           |                           |
   |                           |  POST /oauth/token        |
   |                           |  ← { access_token, refresh_token }
   |                           |                           |
   |                           |  POST /athlete            |
   |                           |  ← { id, username }       |
   |                           |                           |
   |                           |  JWT ausstellen           |
   |                           |  Strava Tokens speichern  |
   |                           |                           |
   |  Cookie/Token speichern   |                           |
```

**Config:**

```typescript
export const configSchema = z.object({
  STRAVA_CLIENT_ID: z.string(),
  STRAVA_CLIENT_SECRET: z.string(),
  STRAVA_REDIRECT_URI: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GPX_TOOLBOX_DATABASE_URL: z.string().startsWith('file:'),
})
```

### Frontend

**Neue Dateien:**

| Datei                                                             | Beschreibung           |
| ----------------------------------------------------------------- | ---------------------- |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/strava/index.tsx`    | Strava Login-Seite     |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/strava/callback.tsx` | OAuth Callback Handler |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/AuthGuard.tsx`   | Auth Guard Wrapper     |

### Verifikation

```bash
# Auth Status prüfen
curl http://localhost:3333/api/auth/status

# Login Flow
curl http://localhost:3333/api/auth/strava
# → { authorizationUrl: "https://www.strava.com/oauth/authorize?..." }
```

---

## Phase 3 — Strava Import + Auto-Match

**Ziel:** Strava-Routen und -Activities importieren. Activities automatisch mit bestehenden Routen matchen.

### Backend

**Neue Dateien:**

| Datei                                                                   | Beschreibung                 |
| ----------------------------------------------------------------------- | ---------------------------- |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/import.controller.ts`     | Import Endpunkte             |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/import.service.ts`        | Import Pipeline + Auto-Match |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/import-strava.dto.ts` | Import DTOs                  |

**Auto-Match Algorithmus** — in `libs/gpx` hinzufügen:

```typescript
// libs/gpx/src/lib/auto-match.ts
import { calculateHaversineDistance, type TrackPoint } from './lib/haversine-distance'

export function computeHausdorffDistance(
  trackA: TrackPoint[],
  trackB: TrackPoint[],
  k: number = 3,
): number { ... }

export function matchRoutes(
  newTrack: TrackPoint[],
  existingRoutes: Array<{ id: string; polyline: Array<{ lat: number; lng: number }> }>,
  thresholdMeters: number = 100,
): Array<{ routeId: string; hausdorffDistance: number; isMatch: boolean }> { ... }
```

**Import Pipeline:**

```typescript
// import.service.ts
async importStravaActivity(activityId: string): Promise<ImportResult> {
  // 1. GPX von Strava herunterladen
  const gpxContent = await this.stravaService.downloadActivityGpx(activityId)

  // 2. Parsen mit libs/gpx
  const points = parseGpx(gpxContent)

  // 3. Stats berechnen mit libs/gpx
  const stats = analyzeGpx(gpxContent)

  // 4. Auto-Match gegen bestehende Routen
  const matches = await this.matchAgainstRoutes(points)

  // 5. Wenn Match → Activity mit Route verknüpfen
  //    Wenn kein Match → Neue Route erstellen
}
```

**Wichtige Endpunkte:**

```
GET    /api/strava/routes              # Strava-Routen fetchen + importieren
POST   /api/strava/import-activity/:id # Activity importieren
POST   /api/strava/import-all          # Alle Activities importieren
POST   /api/import/auto-match          # Auto-Match starten
```

### Frontend

**Neue Dateien:**

| Datei                                                              | Beschreibung        |
| ------------------------------------------------------------------ | ------------------- |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/strava/import.tsx`    | Strava Import-Seite |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/StravaImport.tsx` | Import UI           |

### Verifikation

```bash
# Strava Routes importieren
curl -X POST http://localhost:3333/api/strava/import-all
# → { imported: 5, matched: 3, new: 2 }

# Auto-Match
curl -X POST http://localhost:3333/api/import/auto-match
```

---

## Phase 4 — Markierungen + Bewertung + Fahrten-Log + Wetter

**Ziel:** Status-Tags, Bewertungskategorien, Fahrten-Log, Wetter-Daten.

### Backend

**Neue Dateien:**

| Datei                                                                 | Beschreibung                  |
| --------------------------------------------------------------------- | ----------------------------- |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/rides.controller.ts`    | Fahrt CRUD                    |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/rides.service.ts`       | Fahrt Business Logic + Wetter |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/rides.module.ts`        | NestJS Module                 |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/create-ride.dto.ts` | Create Ride DTO               |
| `apps/gpx-toolbox/gpx-toolbox-backend/src/app/dto/update-ride.dto.ts` | Update Ride DTO               |

### Wetter-Integration

**Reuse:** `libs/nestjs-services/src/weather-api/weather-api.service.ts` (Open-Meteo)

**Funktionen:**

- Beim Erstellen einer Fahrt: Wetter zum `riddenAt`-Zeitpunkt aus Open-Meteo laden (Temp, Regen, Wind)
- Auf der Route-Detail-Seite: Wetter-Vorhersage für Route-Zentrum (nächste 3 Tage, stündlich)
- Caching: Wetter-Daten nur alle 30 min neu laden (Open-Meteo ist gratis, kein API-Key)
- Wetter wird als JSON in `Fahrt.weather` gespeichert

### Neue Endpunkte

```
GET    /api/routes/:routeId/fahrten          # Fahrten einer Route
POST   /api/routes/:routeId/fahrten          # Fahrt erstellen
GET    /api/fahrten/:id                      # Fahrt Detail
PUT    /api/fahrten/:id                      # Fahrt bearbeiten
DELETE /api/fahrten/:id                      # Fahrt löschen
```

### Frontend

**Neue Dateien:**

| Datei                                                                           | Beschreibung           |
| ------------------------------------------------------------------------------- | ---------------------- |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/$routeId/fahrten/index.tsx` | Fahrten-Liste          |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/routes/$routeId/fahrten/new.tsx`   | Fahrt erstellen        |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/FahrtList.tsx`                 | Fahrt-Liste Komponente |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/FahrtForm.tsx`                 | Fahrt-Formular         |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/WeatherDisplay.tsx`            | Wetter-Anzeige         |

### Verifikation

```bash
# Fahrt erstellen
curl -X POST http://localhost:3333/api/routes/:routeId/fahrten \
  -H "Content-Type: application/json" \
  -d '{"riddenAt":"2024-01-15","duration":3600,"avgHr":150,"notes":"Tolle Route!"}'

# Fahrten-Liste
curl http://localhost:3333/api/routes/:routeId/fahrten
```

---

## Phase 5 — Distanz-Suche + Distanz-Filter

**Ziel:** Routen nach Distanz zum Startpunkt finden. Distanz-Filter in Route-Liste.

### Backend

**Neuer Endpunkt:**

```
GET /api/routes/nearby?lat=48.77&lng=9.16&radius=50&sortBy=distance
```

**Implementierung:** Haversine-Distanz für alle Routen berechnen (Route-Zentrum zu Suchpunkt), filtern nach Radius, sortieren. Nutzt `calculateHaversineDistance` aus `libs/gpx`.

### Frontend

**Neue Dateien:**

| Datei                                                              | Beschreibung           |
| ------------------------------------------------------------------ | ---------------------- |
| `apps/gpx-toolbox/gpx-toolbox-web/src/routes/nearby.tsx`           | Distanz-Suche Seite    |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/NearbySearch.tsx` | Such-UI mit GPS-Button |

### Verifikation

```bash
# Routen in 50km Radius
curl "http://localhost:3333/api/routes/nearby?lat=48.77&lng=9.16&radius=50"
# → [{ id, name, distance: 23.5 }, ...]
```

---

## Phase 6 — Docker Deployment

**Ziel:** Docker-Image für Production-Deployment.

**Neue Dateien:** Kopie von `stgtrails-app` nach `gpx-toolbox-app`.

---

## Zusammenfassung: Wiederverwendbare Code-Teile

| Quelle                                                                 | Ziel                       | Beschreibung                      |
| ---------------------------------------------------------------------- | -------------------------- | --------------------------------- |
| `libs/gpx/src/lib/haversine-distance.ts`                               | Auto-Match + Nearby Search | Haversine-Distanz, Bearing        |
| `libs/gpx/src/lib/gpx-parser.ts`                                       | GPX-Import                 | XML-Parser                        |
| `libs/gpx/src/lib/track-stats.ts`                                      | GPX-Import                 | Stats-Berechnung, analyzeGpx      |
| `libs/gpx/src/lib/types.d.ts`                                          | Backend + Frontend         | TrackPoint, SegmentOverview, etc. |
| `libs/nestjs-services/src/weather-api/`                                | Route-Detail               | Open-Meteo Wetter-API             |
| `libs/stgtrails/persistence/`                                          | gpx-toolbox-persistence    | Prisma + SQLite Pattern           |
| `libs/stgtrails/api-client/`                                           | gpx-toolbox-api-client     | Orval Codegen Pattern             |
| `apps/stgtrails/stgtrails-backend/`                                    | gpx-toolbox-backend        | NestJS Boilerplate                |
| `apps/stgtrails/stgtrails-app/`                                        | gpx-toolbox-app            | Docker Setup                      |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/Map.tsx`              | Route-Detail               | Leaflet Map                       |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/ElevationProfile.tsx` | Route-Detail               | Höhenprofil                       |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/SegmentOverlay.tsx`   | Route-Detail               | Track-Overlay                     |
| `apps/gpx-toolbox/gpx-toolbox-web/src/components/RangeSlider.tsx`      | Route-Detail               | Segment-Slider                    |
