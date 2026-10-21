# GPX Toolbox — Implementierungsplan

## Übersicht

Eine App zur Verwaltung von geplanten und gefahrenen GPX-Routen mit Filtern, Strava-Sync und Ähnlichkeits-Erkennung.

### Tech-Stack

- **Frontend:** Vite + React (✅ entschieden 2026-09-04)
- **Backend:** NestJS (für Strava OAuth + API)
- **Datenbank:** SQLite (V1, lokal) → PostgreSQL optional später
- **Bibliothek:** `libs/gpx` (bereits vorhanden)
- **Karte:** Leaflet + OpenStreetMap
- **Deployment:** Docker-Image + Traefik, analog `stgtrails-app` (✅ entschieden 2026-09-04)

### Datenbank-Strategie

> ✅ **Entscheidung 2026-09-04: SQLite-only (V1).** Die Postgres-Pfade unten (Docker, `migrate deploy` mit pg) bleiben als Option für später, sind aber nicht Teil des MVP.

~~Das Projekt unterstützt zwei DB-Systeme mit demselben Prisma-Schema~~ — ursprünglich geplant, der Provider wird über `DATABASE_URL` gesteuert:

| Umgebung              | DATABASE_URL                                      | `prisma generate` |
| --------------------- | ------------------------------------------------- | ----------------- |
| **Entwicklung**       | `sqlite://./dev.db`                               | einmalig          |
| **CI / Testing**      | `sqlite://./test.db`                              | einmalig          |
| **Production Docker** | `postgresql://user:pass@postgres:5432/gpxtoolbox` | im Docker-Build   |

#### Einrichtung

```bash
# SQLite (Dev)
DATABASE_URL="sqlite://./dev.db" npx prisma generate
npx prisma migrate deploy

# PostgreSQL (Production)
DATABASE_URL="postgresql://..." npx prisma generate  # ← Provider-Wechsel!
npx prisma migrate deploy
```

**Wichtig:** Nach Wechsel von SQLite → PostgreSQL muss `prisma generate` neu laufen.
Das passiert automatisch im Docker-Build (`npx prisma generate` vor `migrate deploy`).

#### Schema-Kompatibilität

Das Schema muss **provider-agnostisch** sein:

- ✅ UUID als IDs (`@default(uuid())`) — beide unterstützen
- ✅ Boolean mit Default — beide unterstützen
- ✅ DateTime — beide unterstützen
- ⚠️ `autoincrement()` — **SQLite unterstützt das nicht mit Strings** — UUIDs als IDs verwenden
- ⚠️ `Json`-Typ — Syntax leicht unterschiedlich, vermeiden

#### Docker Deployment

```yaml
# docker-compose.yml
services:
  gpx-toolbox:
    environment:
      DATABASE_URL: 'postgresql://user:pass@postgres:5432/gpxtoolbox'
    depends_on:
      - postgres
  postgres:
    image: postgres:16
```

#### Testing

```bash
# Unit-Tests: SQLite in-memory (schnell, isoliert)
DATABASE_URL="sqlite::memory:" npx vitest

# E2E-Tests: SQLite file-based (Backend + Test brauchen dieselbe DB)
DATABASE_URL="sqlite://./e2e.db" npx prisma migrate deploy
```

---

## Phase 1 — MVP: Route-Verwaltung & Filter

### 1.1 Datenmodell

```
Route
├── id: string (UUID)
├── name: string
├── description: string?
├── tags: string[]
├── isFavorite: boolean
├── isRidden: boolean
├── riddenAt: Date?
├── riddenCount: number
├── notes: string?  // Logbuch-Eintrag
├── source: 'import' | 'manual' | 'generated'
├── gpxContent: Bytes  // GPX als BLOB in der DB (Prisma Bytes, kein Base64)
├── polyline: Point[]  // [{lat, lng}] — die Route als Polyline
├── stats: {
│     distance: number
│     elevationGain: number
│     elevationLoss: number
│     segments: SegmentStats[]
│   }
├── createdAt: Date
└── updatedAt: Date

// Optional: separate Table für Fahrten-Log
Fahrt
├── id: string
├── routeId: string (FK)
├── riddenAt: Date
├── duration: number
├── distance: number
├── avgHr: number?
├── notes: string?
├── weather: string?
├── mood: number?
└── gpxExport: Bytes?  // exportierte GPX dieser Fahrt (BLOB)
```

### 1.2 Feature-Liste

#### Frontend

- **[ ] Route-Liste** — sortierbar (Distanz, Steigung, Datum, Name)
- **[ ] Filter-Panel**
  - Distanz-Bereich (Slider)
  - Steigung-Bereich (Slider)
  - Tags (Multi-Select / Chips)
  - Gefahren / Nicht gefahren (Toggle)
  - Favoriten (Toggle)
- **[ ] GPX-Import** — Datei-Upload, parsen, speichern
- **[ ] Manuelles Route-Erstellen** — Polyline auf der Karte zeichnen
- **[ ] Karten-Ansicht** — alle Routen auf einer Karte, farbcodiert
  - Grün = gefahren
  - Grau = nicht gefahren
  - Gelb = Favorit
- **[ ] Route-Details** — Modal / Side Panel
  - Karte mit Route
  - Höhenprofil
  - Segment-Übersicht (Steigung, Distanz, HR)
  - "Als gefahren markieren" Button
  - Notizen / Logbuch
  - **Wetter-Vorhersage** — Open-Meteo (gratis, kein API-Key)
    - Temperatur, Regen, Wind für den Routenort
    - Stündliche Übersicht
    - Wetter zum Fahrzeitpunkt (im Logbuch)
- **[ ] Route-Bearbeiten** — Name, Tags, Beschreibung
- **[ ] Route-Löschen** — mit Bestätigung
- **[ ] "Fahrbare Routen"-Ansicht** — sortiert nach Distanz zum Startpunkt
  - Startpunkt manuell setzen oder GPS verwenden

#### Backend

- **[ ] SQLite-Datenbank** — mit Prisma Schema
- **[ ] REST API** — CRUD für Routen und Fahrten
- **[ ] GPX-Parser** — nutzt `libs/gpx`, extrahiert Stats
- **[ ] GPX-Export** — Route als GPX-Datei generieren
- **[ ] Wetter-Service** — reused `libs/nestjs-services` WeatherApiService (Open-Meteo)
  - [ ] Wetter-Fetch für Route-Zentrum (Temp, Regen, Wind, stündlich)
  - [ ] Caching — Wetter nur aktualisieren wenn >30min her

---

## Phase 2 — Strava Sync

### 2.1 Strava API Integration

- **[ ] OAuth2 Flow** — Login mit Strava
- **[ ] Routen importieren** — Strava Routes → lokale DB
- **[ ] Fahrten exportieren** — lokale Fahrten → Strava (optional)
- **[ ] Auto-Sync** — neue Strava-Fahrten automatisch verknüpfen
  - [ ] GPX der Fahrt mit gespeicherten Routen matchen
  - [ ] "Gefahren"-Status automatisch setzen
- **[ ] Manueller Abgleich** — "Sync mit Strava" Button

### 2.2 Feature-Liste

- **[ ] Strava-Routen-Bibliothek importieren**
- **[ ] Duplicate-Erkennung** — gleiche Route von Strava und manuell = dieselbe Route
- **[ ] Sync-Status anzeigen** — welche Routen sind sync'd?

---

## Phase 3 — Ähnlichkeit & Planung

### 3.1 Feature-Liste

- **[ ] Ähnlichkeits-Erkennung**
  - [ ] Track-Matching Algorithmus (DTW oder Shapley Distance)
  - [ ] "Ähnliche Routen"-Vorschlag auf der Detailseite
  - [ ] Ähnlichkeit nach Geometrie + Steigungsprofil
- **[ ] Roundtrip-Generator**
  - [ ] Startpunkt + Distanz eingeben
  - [ ] Generiert eine runde Route
  - [ ] Als neue Route speichern
- **[ ] Höhenprofil-Chart**
  - [ ] Interaktives Chart auf der Detailseite
  - [ ] Farbcodiert nach Steigung
- **[ ] "Route in der Nähe"**
  - [ ] Finde Routen in einem Radius um einen Punkt
  - [ ] Filter: "innerhalb 50km von [Ort]"

---

## Offene Fragen

1. ✅ **Frontend-Framework:** React (2026-09-04) — Monorepo nutzt React 19 + MUI + Tailwind durchgängig, keine zweite Framework-Instanz
2. ✅ **Datenbank:** SQLite-only (2026-09-04) — kein Postgres im MVP, Postgres-Pfad bleibt als spätere Option
3. ✅ **GPX-Speicherung:** Binär in der DB (Prisma `Bytes`, kein Base64) (2026-09-04) — auch 2–5 MB/Aufzeichnung unkritisch für SQLite; Backup/Restore = eine Datei; Filesystem-Export bleibt als Skalierungs-Fallback
4. ✅ **Deployment:** Web-App mit Backend (NestJS + SQLite lokal) (2026-09-04) — kein externer DB-Server nötig, Docker-Option für später bleibt
5. ✅ **Mobile:** Im MVP keine PWA, responsive Web-App reicht. Später: native iOS App mit API-Zugriff auf das Backend
6. ✅ **Ähnlichkeits-Erkennung:** Nicht im MVP (Phase 3). Einfache Hausdorff-Distanz als Option für später
7. ✅ **Roundtrip-Generator:** Nicht im MVP. Potentielles Feature für später (OSRM als Option)

---

## Nächste Schritte

- [ ] Diese Pläne durchgehen und anpassen
- [ ] Technologie-Entscheidungen treffen (Frage 1-7)
- [ ] Feature-Priorität festlegen
- [ ] Mit Implementation beginnen
