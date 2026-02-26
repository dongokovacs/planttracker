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

### E2E Tesztek Playwright-val

#### Helyi Futtatás

```bash
npm run test  # Playwright tesztek
```

#### Docker-alapú Időzített Futtatás

Ha szeretnéd rendszeresen futtatni a teszteket CI/CD nélkül, használd a Docker-alapú megoldást:

```powershell
# Első alkalommal: image építés
docker-compose build

# Tesztek futtatása
.\run-tests.ps1

# Időzített futtatás beállítása (pl. minden nap éjjel 2-kor)
.\setup-scheduled-task.ps1 -Schedule Daily -Time "02:00"
```

**Részletes útmutató**: [DOCKER-TESTS.md](DOCKER-TESTS.md)

#### Teszt Írási Szabályok

Playwright tesztek írásakor kövesd a szigorú szabályokat:
- **Részletes útmutató**: [.github/instructions/playwright-testing.md](.github/instructions/playwright-testing.md)
- **Gyors referencia**: Használj `getByRole()` > `getByLabel()` > `getByTestId()` prioritási sorrendet
- **Tilos**: XPath, `waitForTimeout()`, `any` típus

##  Fejlesztési Útmutató

### Kódolási Szabályok

- **GitHub Copilot**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Playwright tesztek**: [.github/instructions/playwright-testing.md](.github/instructions/playwright-testing.md)
- **TypeScript**: Strict typing, soha ne használj `any`
- **Angular**: Standalone komponensek, Signals

##  Licensz

Demonstrációs projekt oktatási célokra.
