# GPX Toolbox – Kurzübersicht

**GPX Toolbox** ist eine Web-App zum Verwalten, Planen und Vergleichen von Mountainbike-Routen. Sie integriert sich mit Strava für Routen-Import und Activities, unterstützt GPX-Uploads und bietet Routenplanung via Brouter.

## Monorepo-Kontext

Das Projekt lebt im **plusone**-Monorepo (Nx-Workspace) unter `apps/gpx-toolbox/`. Es besteht aus:

- `gpx-toolbox-backend` – NestJS REST-API (Port 3333)
- `gpx-toolbox-web` – React SPA mit TanStack Router (Port 4250)
- `gpx-toolbox-app` – Docker-App, die Backend + Frontend bundelt
- `gpx-toolbox-e2e` – Cypress E2E-Tests

Shared Libs:

- `libs/gpx-toolbox/persistence` – Prisma-Schema + NestJS-Modul (SQLite)
- `libs/gpx-toolbox/api-client` – Generierter API-Client (Orval)
- `libs/gpx-toolbox/utils` – GPX-Parser, Track-Statistiken, Polyline-Kodierung
- `libs/nestjs-services` – Gemeinsame NestJS-Dienste (Weather, Sunrise/Sunset, Request-Logger)

## Tech-Stack

- **Backend**: NestJS 12, Prisma, SQLite, JWT-Auth, Google OIDC
- **Frontend**: React 19, TanStack Router, TanStack Query, Leaflet, i18next
- **Tests**: Vitest (Unit), Cypress (E2E + Component)
- **Build**: Nx 24, Vite, Webpack (Backend)
- **API-Codegen**: Orval (OpenAPI → TypeScript)

## Datenmodell (Prisma)

- **User** – Benutzerkonto
- **Identity** – Login-Provider (Google OIDC)
- **StravaConnection** – Optionaler Strava-Account-Link
- **Route** – GPX-Route (Name, GPX-Inhalt, Polyline, Stats, Source, Status, Rating, Notes)
- **Activity** – Durchgeführte Fahrt (verknüpft mit Route, Strava-Activity, Herzfrequenz, Wetter)

## Wichtige Nx-Targets

- `nx serve gpx-toolbox-backend` – Backend starten (baut auch Web)
- `nx serve gpx-toolbox-web` – Frontend Dev-Server
- `nx test gpx-toolbox-backend` – Backend-Tests (Vitest)
- `nx test gpx-toolbox-web` – Frontend-Tests (Vitest)
- `nx e2e gpx-toolbox-e2e` – E2E-Tests (Cypress)
- `nx run gpx-toolbox-persistence:prisma-generate` – Prisma-Client generieren
- `nx run gpx-toolbox-api-client:generate-api-client` – API-Client regenerieren

## Ports

- Backend: 3333
- Frontend: 4250
