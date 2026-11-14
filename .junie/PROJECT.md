# GPX Toolbox – Detaillierte Projektdokumentation

## 1. Projektbeschreibung

GPX Toolbox ist eine Webanwendung zum Verwalten, Planen und Vergleichen von Mountainbike-Routen. Sie ermöglicht:

- **Routenverwaltung**: Routen aus Strava importieren, manuell GPX-Dateien hochladen, Routen bewerten und kommentieren
- **Routenplanung**: Brouter-basierte Routenplanung zwischen zwei Punkten
- **Routenvergleich**: Mehrere Routen nebeneinander vergleichen (Distanz, Höhenmeter, Profil)
- **Activities**: Durchgeführte Fahrten mit Route verknüpfen, Herzfrequenzdaten und Wetter speichern
- **Strava-Integration**: Strava-Routen importieren, Strava-Activities synchronisieren, Strava-Export
- **Nearby-Suche**: Routen in der Nähe eines Ortes finden

## 2. Monorepo-Struktur

Das Projekt ist Teil des **plusone**-Monorepos (Nx-Workspace). Alle Apps und Libs teilen sich Konfiguration, Build-Tools und Abhängigkeiten.

### 2.1 GPX Toolbox Projekte

```
apps/gpx-toolbox/
├── gpx-toolbox-backend/    # NestJS REST-API
├── gpx-toolbox-web/        # React SPA (Frontend)
├── gpx-toolbox-app/        # Docker-App (Backend + Frontend)
└── gpx-toolbox-e2e/        # Cypress E2E-Tests

libs/gpx-toolbox/
├── persistence/            # Prisma-Schema + NestJS Prisma-Modul
├── api-client/             # Generierter API-Client (Orval)
└── utils/                  # GPX-Utilities (Parser, Serializer, Statistiken)
```

### 2.2 Gemeinsame Libs

- `libs/nestjs-services/` – Gemeinsame NestJS-Dienste:
  - `RequestLoggerMiddleware` – Request-Logging für alle NestJS-Apps
  - `SunriseSunsetApiService` – Sonnenauf-/untergangsdaten
  - `WeatherApiService` – Wetterdaten via Open-Meteo

### 2.3 Projektabhängigkeiten

- `gpx-toolbox-app` → `gpx-toolbox-backend`, `gpx-toolbox-web` (implicit)
- `gpx-toolbox-backend` → `gpx-toolbox-web` (implicit), `gpx-toolbox-persistence`
- `gpx-toolbox-e2e` → `gpx-toolbox-backend`, `gpx-toolbox-web`, `gpx-toolbox-persistence` (implicit)
- `gpx-toolbox-persistence` → `plugins-nx-prisma` (implicit)

## 3. Backend – `gpx-toolbox-backend`

### 3.1 Architektur

NestJS-basierte REST-API mit moduler Struktur:

```
src/app/
├── app.module.ts           # Hauptmodul, Middleware-Konfiguration
├── app.service.ts          # App-Info-Service
├── config.ts               # Umgebungsvariablen mit Zod-Validierung
├── health.controller.ts    # Health-Check-Endpunkt
├── auth/                   # Authentifizierung (Google OIDC, JWT)
├── routes/                 # Routen-CRUD
├── activities/             # Activities (durchgeführte Fahrten)
├── import/                 # GPX-Import
├── rides/                  # Strava-Activities-Import
├── brouter/                # Brouter-Routenplanung
├── dto/                    # Data Transfer Objects
└── *.util.ts               # Hilfsfunktionen
```

### 3.2 Module

- **AuthModule**: Google OIDC Login, JWT-Strategie, Protected Endpoints
- **RoutesModule**: CRUD für Routen, Nearby-Suche, Filter und Sortierung
- **ActivitiesModule**: Activities verwalten, mit Routes verknüpfen
- **ImportModule**: GPX-Dateien parsen und als Route speichern
- **RidesModule**: Strava-Activities importieren
- **BRouterModule**: Externe Brouter-API aufrufen, Routen generieren

### 3.3 Authentifizierung

- **Google OIDC**: Login via Google OpenID Connect
- **JWT**: Nach dem Login wird ein JWT-Token ausgegeben (7 Tage gültig)
- **ProtectedRoute**: Frontend leitet nicht-authentifizierte Nutzer zu `/login` weiter
- **Strava-Connection**: Optionaler Strava-Account-Link, unabhängig vom Login-Provider

### 3.4 Konfiguration (Umgebungsvariablen)

Definiert in `src/app/config.ts` (Zod-Schema):

| Variable                   | Beschreibung                       | Standard                                         |
| -------------------------- | ---------------------------------- | ------------------------------------------------ |
| `GOOGLE_CLIENT_ID`         | Google OIDC Client ID              | – (erforderlich)                                 |
| `GOOGLE_CLIENT_SECRET`     | Google OIDC Client Secret          | – (erforderlich)                                 |
| `GOOGLE_REDIRECT_URI`      | Callback-URL                       | `http://localhost:3333/api/auth/google/callback` |
| `GOOGLE_DISCOVERY_URL`     | OIDC Discovery URL                 | Google-Standard                                  |
| `JWT_SECRET`               | JWT-Signatur-Secret                | `change-me-in-production`                        |
| `JWT_EXPIRES_IN`           | JWT-Ablauf                         | `7d`                                             |
| `FRONTEND_URL`             | Frontend-URL (Redirect nach Login) | `http://localhost:4250`                          |
| `GPX_TOOLBOX_DATABASE_URL` | SQLite-Datenbank-Pfad              | – (erforderlich, `file:`-Prefix)                 |

### 3.5 API-Endpunkte

- `GET /health` – Health-Check
- `POST /api/auth/google/login` – Google-Login-URL generieren
- `GET /api/auth/google/callback` – OAuth-Callback
- `GET /api/auth/me` – Aktuellen Benutzer abrufen
- `GET /api/routes` – Routenliste (mit Filter und Sortierung)
- `POST /api/routes` – Neue Route erstellen
- `GET /api/routes/:id` – Route-Details
- `PUT /api/routes/:id` – Route aktualisieren
- `DELETE /api/routes/:id` – Route löschen
- `GET /api/routes/nearby` – Routen in der Nähe suchen
- `POST /api/import/gpx` – GPX-Datei importieren
- `GET /api/activities` – Activities auflisten
- `POST /api/activities` – Activity erstellen
- `GET /api/rides` – Strava-Activities abrufen
- `POST /api/brouter/route` – Route via Brouter planen

### 3.6 OpenAPI-Spezifikation

Die API-Spezifikation wird generiert:

- `nx run gpx-toolbox-backend:generate-api-spec`
- Ausgabe: `gpx-toolbox-internal.json`
- Dient als Grundlage für den Orval-API-Client

## 4. Frontend – `gpx-toolbox-web`

### 4.1 Architektur

React SPA mit TanStack Router für file-based routing:

```
src/
├── app.tsx                  # App-Shell (Auth, TopBar, Outlet)
├── main.tsx                 # Entry point
├── i18n.ts                  # i18next-Konfiguration
├── lib/
│   └── auth-context.tsx     # Auth-Context (User, Login, Logout)
├── routes/                  # TanStack Router file-based routes
│   ├── __root.tsx           # Root-Route (AuthProvider)
│   ├── index.tsx            # Startseite
│   ├── login.tsx            # Login-Seite
│   ├── callback.tsx         # OAuth-Callback
│   ├── routes/              # Routen-Verwaltung
│   ├── activities/          # Activities
│   ├── compare.tsx          # Routen-Vergleich
│   ├── settings.tsx         # Einstellungen
│   ├── impressum.tsx        # Impressum
│   └── datenschutz.tsx      # Datenschutz
├── components/              # UI-Komponenten
├── hooks/                   # Custom React Hooks
├── layout/                  # Layout-Hilfen (Mobile-Erkennung)
├── utils/                   # Hilfsfunktionen
└── styles.css               # Globale Styles
```

### 4.2 Routing

TanStack Router mit file-based routing. Public Routes: `/login`, `/callback`, `/datenschutz`, `/impressum`, `/`. Alle anderen Routes erfordern Authentifizierung.

### 4.3 Wichtige Komponenten

- **Map** – Leaflet-Karte mit Route-Overlays
- **ElevationProfile** – Höhenprofil-Visualisierung
- **CompareBar/ElevationProfile** – Routen-Vergleich
- **SegmentStats/SegmentMap** – Segment-Analyse
- **SettingsView** – Benutzereinstellungen, Strava-Verbindung
- **UploadGpxModal** – GPX-Upload-Dialog
- **StravaExportImportModal** – Strava-Export/Import
- **Sidebar/SidebarLayout** – Responsive Layout
- **TopBar** – Navigation und Benutzer-Info

### 4.4 Custom Hooks

- `useCompareList` – Vergleichsliste verwalten
- `useRouteSelection` – Route-Auswahl
- `useSearchArea` – Suchbereich für Nearby
- `useSegmentRange` – Segment-Bereich
- `usePlaceSearch` – Ortsuche (Geocoding)
- `useDebouncedValue` – Debounced-Werte
- `useNearbyMapLayers` – Karten-Layer für Nearby-Suche

### 4.5 Internationalisierung

i18next mit de/en Übersetzungen in `public/locales/`. Die Übersetzungsdateien werden mit `i18next-cli` validiert.

### 4.6 Styling

- CSS-Module und Inline-Styles
- Responsive Design mit `useIsMobile` Hook

## 5. Shared Libraries

### 5.1 `libs/gpx-toolbox/persistence`

Prisma-basierte Datenpersistenz als NestJS-Modul.

**Schema-Modelle:**

- **User** – Benutzerkonto (id, name, email, avatarUrl)
- **Identity** – Login-Identität (provider, subject, email)
- **StravaConnection** – Strava-Verbindung (accessToken, refreshToken)
- **Route** – GPX-Route (name, gpxContent, polyline, stats, source, status, ratingTags, notes)
- **Activity** – Durchgeführte Fahrt (routeId, stravaActivityId, title, riddenAt, duration, avgHr, maxHr, weather)

**Enums:**

- `RouteSource`: stravaRoute, stravaActivity, manualImport
- `RouteStatus`: planned, ridden, foundOnline
- `IdentityProvider`: google

**Datenbank:** SQLite (konfigurierbar via Prisma-Adapter)

**Nx-Targets:**

- `prisma-generate` – Prisma-Client generieren
- `prisma-deploy` – Migrationen anwenden
- `prisma-push` – Schema in DB pushen (Dev)
- `prisma-migrate` – Neue Migration erstellen
- `prisma-format` – Schema formatieren
- `prisma-validate` – Schema validieren

### 5.2 `libs/gpx-toolbox/api-client`

Generierter TypeScript-API-Client via Orval.

**Quellen:**

- `gpx-toolbox-internal.json` – OpenAPI-Spezifikation des Backends
- `strava.preprocessed.json` – Strava API-Spezifikation

**Generierte Module:**

- Backend-Client (aus OpenAPI)

**Nx-Targets:**

- `generate-api-client` – Client aus OpenAPI generieren
- `fetch-strava-spec` – Strava-Spezifikation herunterladen

### 5.3 `libs/gpx-toolbox/utils`

Reine Utility-Funktionen für GPX- und Track-Verarbeitung:

- **GPX-Parser/Serializer** – GPX-XML parsen und serialisieren
- **Track-Statistiken** – Distanz, Höhenmeter, Geschwindigkeit berechnen
- **Encoded Polyline** – Google Polyline-Encoding/Decoding
- **Haversine-Distanz** – Geografische Distanzberechnung
- **Bounding Box** – Bounding-Box aus Koordinaten
- **Track-Similarity** – Ähnlichkeit zwischen Tracks berechnen
- **Segmenter** – Tracks in Segmente unterteilen
- **Post-Process Segments** – Segment-Post-Processing
- **Render SVG** – Höhenprofil als SVG rendern
- **Average Heart Rate** – Durchschnittliche Herzfrequenz berechnen

## 6. Docker & Deployment

### 6.1 `gpx-toolbox-app`

Die Docker-App bundelt Backend und Frontend:

- `Dockerfile` – Node.js-Basis-Image, baut Backend (inkl. Frontend)
- `docker-compose.yml` – Container-Konfiguration
- `entrypoint.sh` – Startskript mit Prisma-Migration

**Nx-Targets:**

- `nx package gpx-toolbox-app` – Docker-Image bauen
- `nx deploy gpx-toolbox-app` – Container starten

### 6.2 CI/CD

- GitLab CI (`gitlab-ci.yml`) – Automatisches Bauen und Deployen
- Docker-Registry für Container-Images

## 7. Testing

### 7.1 Unit-Tests

- **Backend**: Vitest mit `vite.config.mts`, Tests in `*.spec.ts`
- **Frontend**: Vitest mit `vite.config.mts`, Tests in `*.spec.tsx`
- **Utils**: Vitest mit `vite.config.mts`

### 7.2 E2E-Tests

Cypress-basierte E2E-Tests in `gpx-toolbox-e2e`:

- `activities.cy.ts` – Activities-Tests
- `auth.cy.ts` – Authentifizierungs-Tests
- `compare.cy.ts` – Vergleichs-Tests
- `nearby.cy.ts` – Nearby-Suche-Tests
- `routes.cy.ts` – Routen-Tests
- `settings.cy.ts` – Einstellungen-Tests
- `strava-export.cy.ts` – Strava-Export-Tests

**Setup:**

- `setup-db` Target bereitet Test-Datenbank vor
- Google-Mock-Server für OIDC-Tests
- GPX-Fixtures in `src/fixtures/`

### 7.3 Component-Tests

Cypress Component Testing für Frontend-Komponenten (`*.cy.tsx`).

## 8. Entwicklungskonventionen

### 8.1 Code-Style

- TypeScript 6, strikte Einstellungen
- ESLint mit project-local configs (`eslint.config.js`)
- Prettier für Formatierung (via `nx format`)
- Lint-staged mit Husky für Pre-Commit-Checks

### 8.2 Namenskonventionen

- Dateien: kebab-case (z.B. `activities.service.ts`)
- Komponenten: PascalCase (z.B. `ElevationProfile.tsx`)
- Hooks: camelCase mit `use`-Prefix (z.B. `useRouteSelection.ts`)
- DTOs: PascalCase mit `.dto.ts`-Suffix

### 8.3 Test-Konventionen

- Unit-Tests: `*.spec.ts` / `*.spec.tsx` (neben der Quelldatei)
- E2E-Tests: `*.cy.ts` / `*.cy.tsx`
- Component-Tests: `*.cy.tsx`
- Integration-Tests: `*.integration.spec.ts`

### 8.4 Umgebungsvariablen

- `.local.env` für lokale Entwicklung (git-ignored)
- `config.ts` mit Zod-Schema für Validierung
- `requireEnv()` für erforderliche Variablen

## 9. Wichtige Nx-Commands

### Backend

```bash
nx serve gpx-toolbox-backend          # Backend starten
nx test gpx-toolbox-backend           # Backend-Tests
nx typecheck gpx-toolbox-backend      # TypeScript-Check
nx lint gpx-toolbox-backend           # ESLint
nx run gpx-toolbox-backend:generate-api-spec  # OpenAPI-Spec generieren
```

### Frontend

```bash
nx serve gpx-toolbox-web              # Frontend Dev-Server (Port 4250)
nx test gpx-toolbox-web               # Frontend-Tests
nx typecheck gpx-toolbox-web          # TypeScript-Check
nx lint gpx-toolbox-web               # ESLint
nx component-test gpx-toolbox-web     # Component-Tests
```

### Persistence

```bash
nx run gpx-toolbox-persistence:prisma-generate   # Prisma-Client
nx run gpx-toolbox-persistence:prisma-deploy     # Migrationen
nx run gpx-toolbox-persistence:prisma-push       # Schema pushen
nx run gpx-toolbox-persistence:prisma-migrate    # Neue Migration
```

### API-Client

```bash
nx run gpx-toolbox-api-client:generate-api-client  # Client regenerieren
```

### E2E

```bash
nx e2e gpx-toolbox-e2e              # E2E-Tests
```

### Docker

```bash
nx package gpx-toolbox-app          # Docker-Image bauen
nx deploy gpx-toolbox-app           # Container starten
```

## 10. Externe Abhängigkeiten

- **Google OIDC** – Authentifizierung
- **Strava API** – Routen- und Activity-Import
- **Brouter** – Routenplanung (externe API)
- **Open-Meteo** – Wetterdaten für Activities
- **Google Geocoding** – Ortsuche (im Frontend)
