# PlantTracker - Telepítési útmutató

## Gyors kezdés

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Alkalmazás futtatása

```bash
npm start
```

Az alkalmazás elérhető: http://localhost:4200

---

## Funkciók

- **Növények nyilvántartása**: Név, fajta, ültetési dátum, helyszín
- **Képek**: 19 előre letöltött zöldség és fűszernövény kép
- **Keresés és szűrés**: Dashboard view
- **LocalStorage**: Offline adattárolás

---

## Hibaelhárítás

### Port már használatban

Ha a 4200-as port már használatban van:

```bash
npm start -- --port 4201
```

### Angular CLI hiányzik

```bash
npm install -g @angular/cli
```

### LocalStorage megtelt

F12  Application  Storage  Clear site data

---

## Projekt struktúra

```
src/
  app/
    core/          # Szolgáltatások és modellek
    features/      # Dashboard, Plant Form, Plant Detail
    shared/        # Közös komponensek
  assets/
  environments/
public/
  images/          # 19 növénykép
```

## Technológiák

- Angular 21
- TypeScript
- SCSS
- Signals (state management)
- LocalStorage

