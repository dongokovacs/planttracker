## PlantTracker backend (Node + MySQL)

### 1) MySQL indítása (Docker)

```bash
docker compose up -d
```

Ez létrehozza a `planttracker` adatbázist és a `plants` táblát (init script: `server/sql/001_create_tables.sql`).

### 2) Backend konfiguráció

Másold a példát és töltsd ki (lokálhoz az alap értékek jók):

```bash
cd server
copy .env.example .env
```

### 3) Backend indítása

```bash
cd server
npm install
npm run dev
```

API: `http://localhost:3001/api`

- Health check: `GET /api/health`
- Plants CRUD:
  - `GET /api/plants`
  - `GET /api/plants/:id`
  - `POST /api/plants`
  - `PUT /api/plants/:id`
  - `DELETE /api/plants/:id`

