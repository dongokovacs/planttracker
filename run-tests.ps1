# Playwright tesztek futtatasa Docker containerben
# Ez a script futtatja a teszteket es logolja az eredmenyeket

param(
    [string]$LogPath = ".\test-logs"
)

# Log konyvtar letrehozasa, ha nem letezik
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

# Timestamp a loghoz
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $LogPath "test-run-$timestamp.log"

Write-Host "Playwright tesztek futtatasa Docker containerben..." -ForegroundColor Cyan
Write-Host "Log fajl: $logFile" -ForegroundColor Gray

# Navigalas a projekt konyvtarba
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Log fajl inicializalasa
"=== Playwright Test Run ===" | Out-File $logFile
"Idopont: $(Get-Date)" | Out-File $logFile -Append
"" | Out-File $logFile -Append

try {
    # Docker image epitese (csak ha valtozott)
    Write-Host ""
    Write-Host "Docker image epitese..." -ForegroundColor Yellow
    "Docker image epitese..." | Out-File $logFile -Append
    docker-compose build 2>&1 | Tee-Object -FilePath $logFile -Append
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker image epitese sikertelen!"
    }
    
    # Tesztek futtatasa
    Write-Host ""
    Write-Host "Tesztek futtatasa..." -ForegroundColor Yellow
    "Tesztek futtatasa..." | Out-File $logFile -Append
    docker-compose run --rm playwright-tests 2>&1 | Tee-Object -FilePath $logFile -Append
    
    $testExitCode = $LASTEXITCODE
    
    # Eredmeny kiertekeles
    "Teszt exit code: $testExitCode" | Out-File $logFile -Append
    
    if ($testExitCode -eq 0) {
        Write-Host ""
        Write-Host "OK - Tesztek sikeresen lefutottak!" -ForegroundColor Green
        "Statusz: SIKERES" | Out-File $logFile -Append
    } else {
        Write-Host ""
        Write-Host "HIBA - Tesztek sikertelenek!" -ForegroundColor Red
        "Statusz: SIKERTELEN" | Out-File $logFile -Append
    }
    
    # HTML report elerheto
    $reportPath = Join-Path $scriptDir "playwright-report\index.html"
    if (Test-Path $reportPath) {
        Write-Host ""
        Write-Host "HTML report: $reportPath" -ForegroundColor Cyan
        "HTML report: $reportPath" | Out-File $logFile -Append
    }
    
    exit $testExitCode
    
} catch {
    Write-Host ""
    Write-Host "Hiba tortent: $_" -ForegroundColor Red
    "HIBA: $_" | Out-File $logFile -Append
    exit 1
} finally {
    # Cleanup
    Write-Host ""
    Write-Host "Cleanup..." -ForegroundColor Gray
    docker-compose down 2>&1 | Out-Null
}
