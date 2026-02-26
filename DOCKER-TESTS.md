# Docker-alapú Playwright Tesztelés - Útmutató

Ez az útmutató végigvezet azon, hogyan futtass Playwright teszteket Docker containerben időzített módon, CI/CD nélkül.

## 📋 Előfeltételek

- ✅ Docker Desktop fut a gépeden
- ✅ PowerShell 5.1 vagy újabb
- ✅ Adminisztrátori jogosultság a Task Scheduler beállításához

## 🚀 Gyors Kezdés

### 1. Docker Image Építése

Első alkalommal építsd meg a Docker image-t:

```powershell
docker-compose build
```

Ez eltarthat néhány percig, mert:
- Letölti a Playwright image-t
- Telepíti a node modulokat
- Build-eli az Angular alkalmazást
- Telepíti a Chromium böngészőt

### 2. Tesztek Manuális Futtatása

Próbáld ki, hogy működik-e:

```powershell
# PowerShell scripttel (ajánlott, mert naplózza az eredményeket)
.\run-tests.ps1

# Vagy közvetlenül Docker Compose-zal
docker-compose run --rm playwright-tests
```

Az eredmények megjelennek:
- `test-results/` - Playwright test eredmények
- `playwright-report/` - HTML report (nyisd meg böngészőben)
- `test-logs/` - PowerShell script logok (timestamp-pel)

### 3. Időzített Futtatás Beállítása

#### Napi Futtatás (pl. éjjel 2 órakor)

```powershell
# Futtasd rendszergazdaként!
.\setup-scheduled-task.ps1 -Schedule Daily -Time "02:00"
```

#### Heti Futtatás (hétfőnként)

```powershell
.\setup-scheduled-task.ps1 -Schedule Weekly -Time "09:00"
```

## 📖 Részletes Használat

### Docker Parancsok

```powershell
# Image építése/újraépítése
docker-compose build

# Tesztek futtatása
docker-compose run --rm playwright-tests

# Futó container leállítása
docker-compose down

# Image törlése (újraépítéshez)
docker rmi planttracker-playwright:latest

# Minden Docker adat törlése (óvatosan!)
docker system prune -a
```

### Task Scheduler Parancsok

```powershell
# Task azonnal futtatása (teszt céljából)
Start-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Task letiltása
Disable-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Task újraengedélyezése
Enable-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"

# Task törlése
Unregister-ScheduledTask -TaskName "PlantTracker-Playwright-Tests" -Confirm:$false

# Task állapot ellenőrzése
Get-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"
Get-ScheduledTaskInfo -TaskName "PlantTracker-Playwright-Tests"
```

### Task Scheduler GUI

Megnyitás: `taskschd.msc` vagy Start menü → "Task Scheduler"

A feladat itt található: `Task Scheduler Library > PlantTracker-Playwright-Tests`

## 🔧 Testreszabás

### Dockerfile Módosítása

Ha szeretnéd módosítani a Docker konfigurációt:

```dockerfile
# Több böngésző hozzáadása
RUN npx playwright install firefox webkit

# Környezeti változók
ENV NODE_ENV=production
ENV BASE_URL=http://your-app-url
```

### Playwright Konfiguráció Docker-hez

A `playwright.config.ts` már tartalmazza a CI módot:

```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

### Több Ütemezés Létrehozása

Különböző időpontokra is létrehozhatsz feladatokat:

```powershell
# Napi reggel 8-kor
.\setup-scheduled-task.ps1 -Schedule Daily -Time "08:00" -TaskName "PlantTracker-Tests-Morning"

# Napi este 8-kor
.\setup-scheduled-task.ps1 -Schedule Daily -Time "20:00" -TaskName "PlantTracker-Tests-Evening"
```

## 📊 Eredmények Megtekintése

### HTML Report

A tesztek lefutása után nyisd meg:

```powershell
.\playwright-report\index.html
```

Vagy PowerShellből:

```powershell
Start-Process .\playwright-report\index.html
```

### Logok

A `run-tests.ps1` script minden futtatásról készít egy log fájlt:

```powershell
# Legutóbbi log megtekintése
Get-ChildItem .\test-logs | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content
```

## 🐛 Hibaelhárítás

### Docker nem kapcsolódik

```powershell
# Docker állapot ellenőrzése
docker info

# Docker Desktop újraindítása
Restart-Service -Name "com.docker.service"
```

### A tesztek nem találják az alkalmazást

Ellenőrizd, hogy a `playwright.config.ts`-ben a `webServer.command` helyes-e:

```typescript
webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
}
```

### Memória problémák

Ha a Docker elfogy a memóriából:

Docker Desktop → Settings → Resources → Memory → Növeld 4GB-ra vagy többre

### Task nem fut automatikusan

Ellenőrizd:

1. A feladat engedélyezve van-e: `Get-ScheduledTask -TaskName "PlantTracker-Playwright-Tests"`
2. A számítógép be van-e kapcsolva az ütemezett időpontban
3. Windows Update nem zavarja-e

### Permission hibák

Futtasd a PowerShell-t rendszergazdaként:

```powershell
Start-Process powershell -Verb RunAs
```

## 📧 Értesítések (Opcionális)

Ha szeretnél email értesítést kapni az eredményekről, módosítsd a `run-tests.ps1` scriptet:

```powershell
# Példa: Email küldés
if ($testExitCode -ne 0) {
    Send-MailMessage -To "your@email.com" `
        -From "tests@localhost" `
        -Subject "Playwright Tests Failed" `
        -Body "Check logs: $logFile" `
        -SmtpServer "your-smtp-server"
}
```

## 🎯 Best Practices

1. **Rendszeres Image Frissítés**: Havonta építsd újra az image-t a legfrissebb böngészőkkel
   ```powershell
   docker-compose build --no-cache
   ```

2. **Log Rotáció**: Időnként töröld a régi logokat
   ```powershell
   Get-ChildItem .\test-logs -Filter *.log | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item
   ```

3. **Monitorozás**: Állíts be egy dashboard-ot a test-results alapján

4. **Backup**: A test-results és playwright-report könyvtárakat ne commitold Git-be (benne vannak a .gitignore-ban)

## 🔗 További Információk

- [Playwright Dokumentáció](https://playwright.dev)
- [Docker Compose Dokumentáció](https://docs.docker.com/compose/)
- [Windows Task Scheduler Dokumentáció](https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

## 📝 Changelog

- **2026-02-24**: Kezdeti verzió
  - Docker-alapú Playwright testing
  - Időzített futtatás Windows Task Scheduler-rel
  - Automatikus naplózás és reporting
