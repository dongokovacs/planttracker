## PlantTracker

### Fejlesztés (Angular + Node + MySQL)

#### 1) Backend (Node/Express)

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Backend API: `http://localhost:3001/api`

#### 2) Frontend (Angular)

```bash
npm install
npm start
```

Frontend: `http://localhost:4200/`

---

## Local Development (English)

### 1) Prepare the remote MySQL database

The app uses a remote MySQL database hosted on Filess:

- DB panel: https://panel.filess.io/shared/list

Make sure your `server/.env` is configured with your Filess connection data (host, user, password, database, SSL).

Then, from the project root, run the DB init script **once** to create the `plants` table in the remote database:

```bash
cd server
npm run db:init
```

You should see: `✅ MySQL schema ensured (plants table).`

### 2) Start the backend (Node/Express)

From the `server` folder:

```bash
cd server
npm run dev
```

This starts the API on:

- `http://localhost:3001/api`

You can verify it with:

- `http://localhost:3001/api/health`

### 3) Start the frontend (Angular)

From the project root:

```bash
npm install
npm start
```

The Angular dev server will run on:

- `http://localhost:4200/`

The frontend talks to the local backend (`http://localhost:3001/api`), which in turn uses the **remote MySQL database on Filess**.

#  PlantTracker

Egy Angular-alapú növénykövető alkalmazás, amely segít nyomon követni a növények gondozását.

##  Funkciók

- **Növények nyilvántartása**: Növények hozzáadása név, fajta, ültetési dátum és helyszín alapján
- **Képek**: Automatikus képek 19 népszerű zöldségről és fűszernövényről
- **Dashboard**: Áttekinthető kártya nézet keresési és szűrési lehetőségekkel
- **Reszponzív design**: Mobile-first megközelítés, minden eszközön használható
- **Offline támogatás**: LocalStorage alapú adattárolás

##  Telepítés

### Előfeltételek

- Node.js 18+ és npm
- Angular CLI 17+

### Lépések

1. **Függőségek telepítése:**
```bash
npm install
```

2. **Fejlesztői szerver indítása:**
```bash
npm start
```

Az alkalmazás elérhető: `http://localhost:4200`

##  Projekt Struktúra

```
src/app/
 core/              # Szolgáltatások és modellek
 features/          # Funkcionális komponensek
 shared/            # Megosztott komponensek
 environments/      # Környezeti változók
```

##  Technológiák

- Angular 21+ (Standalone komponensek, Signals)
- TypeScript
- SCSS
- Playwright (E2E tesztelés)

##  Tesztelés

### Teszt Írási Szabályok

Playwright tesztek írásakor kövesd a szigorú szabályokat:
- **Részletes útmutató**: [.github/instructions/playwright-testing.md](.github/instructions/playwright-testing.md)
- **Gyors referencia**: Használj `getByRole()` > `getByLabel()` > `getByTestId()` prioritási sorrendet
- **Tilos**: XPath, `waitForTimeout()`, `any` típus

Lásd még: [READMETESTS.md](READMETESTS.md) - Teljes test architecture dokumentáció

### E2E Tesztek Playwright-val

#### Helyi Futtatás

```bash
npm run test  # Playwright tesztek
```

##  Fejlesztési Útmutató

### Kódolási Szabályok

- **GitHub Copilot**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Playwright tesztek**: [.github/instructions/playwright-testing.md](.github/instructions/playwright-testing.md)
- **TypeScript**: Strict typing, soha ne használj `any`
- **Angular**: Standalone komponensek, Signals

##  Licensz

Demonstrációs projekt oktatási célokra.
