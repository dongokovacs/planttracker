# Docker-alapú Playwright Tesztek - Gyors Útmutató

## 🚀 Első lépések

### 1. Tesztek futtatása most

```powershell
.\run-tests.ps1
```

Ez lefuttatja a Playwright teszteket Docker containerben.

**Eredmények:**
- `test-logs\` - Minden futás részletes naplója
- `playwright-report\index.html` - Vizuális teszt report
- `test-results\` - Teszt kimenet fájlok

### 2. Időzített futtatás beállítása

**PowerShellt rendszergazdaként kell futtatni!**

```powershell
# Jobb klikk PowerShell -> "Run as administrator"
cd C:\GIT\OWN\planttracker

# Napi futtatás éjjel 2-kor
.\setup-scheduled-task.ps1 -Schedule Daily -Time "02:00"
```

Más időpontok:
```powershell
# Minden nap reggel 8-kor
.\setup-scheduled-task.ps1 -Schedule Daily -Time "08:00"

# Hetente hétfő reggel 9-kor
.\setup-scheduled-task.ps1 -Schedule Weekly -Time "09:00"
```

### 3. Feladat kezelése

```powershell
# Azonnali tesztelés a feladattal
Start-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Feladat letiltása
Disable-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Feladat újraengedélyezése
Enable-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Feladat törlése
Unregister-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Feladat állapota
Get-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"
```

### 4. GUI-ban

Nyisd meg a Task Scheduler-t:
```powershell
taskschd.msc
```

Vagy keress rá: **Task Scheduler** a Start menüben.

## 🔧 Docker parancsok

```powershell
# Image újraépítése (ha változott a kód)
docker-compose build

# Image újraépítése cache nélkül
docker-compose build --no-cache

# Tesztek manuális futtatása
docker-compose run --rm playwright-tests

# Futó container leállítása
docker-compose down

# Docker cleanup (hely felszabadítása)
docker system prune -a
```

## 📊 Eredmények megtekintése

### HTML Report

```powershell
# Report megnyitása böngészőben
Start-Process .\playwright-report\index.html
```

Vagy csak nyisd meg a fájlt: `playwright-report\index.html`

### Logok

```powershell
# Legutóbbi log megtekintése
Get-ChildItem .\test-logs | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content

# Összes log listázása
Get-ChildItem .\test-logs

# Régi logok törlése (30 napnál régebbiek)
Get-ChildItem .\test-logs -Filter *.log | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

## ❓ Gyakori problémák

### "Access is denied" hiba

→ A PowerShellt rendszergazdaként kell futtatni a Task Scheduler beállításához.

### Docker nem indul

```powershell
# Docker állapot
docker info

# Docker Desktop újraindítása
# Keresd meg a Docker Desktop ikont a tálcán, jobb klikk -> Restart
```

### Tesztek hosszú ideig futnak

→ Ez normális! Az első futás építi az image-t, ami 5-10 percig tarthat.
→ A következő futások gyorsabbak (~2-3 perc).

### Memória hiba

Docker Desktop → Settings → Resources → Memory: állítsd 4 GB-ra vagy többre.

## 📖 Részletes dokumentáció

Lásd: [DOCKER-TESTS.md](DOCKER-TESTS.md)

## 💡 Tippek

1. **Első futtatás**: Futtasd le manuálisan először (`.\run-tests.ps1`) hogy ellenőrizd, minden működik-e.

2. **Tesztek módosítása után**: Az image automatikusan újraépül a `run-tests.ps1` futtatásakor.

3. **Napi report**: Nézd meg rendszeresen a `test-logs` mappát, hogy lásd, mikor futott utoljára és milyen eredménnyel.

4. **E-mail értesítések**: Ha szeretnél értesítést kapni, módosíthatod a `run-tests.ps1` scriptet az SMTP beállításokkal.

5. **Több környezet**: Létrehozhatsz különböző feladatokat más időpontokra vagy különböző konfigurációkkal.
