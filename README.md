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

##  Licensz

Demonstrációs projekt oktatási célokra.
