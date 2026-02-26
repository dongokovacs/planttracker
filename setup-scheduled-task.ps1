# Windows Task Scheduler feladat letrehozasa
# Ez a script beallitja az idozitett futtatast
# FONTOS: Rendszergazdakent kell futtatni!

param(
    [Parameter(Mandatory=$false)]
    [string]$Schedule = "Daily",  # Daily, Weekly
    
    [Parameter(Mandatory=$false)]
    [string]$Time = "02:00",  # HH:mm format
    
    [Parameter(Mandatory=$false)]
    [string]$TaskName = "PlantTracker-Playwright-Tests"
)

# Ellenorzes: rendszergazdai jogosultsag
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "HIBA: Rendszergazdai jogosultsag szukseges!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Futtasd ujra igy:" -ForegroundColor Yellow
    Write-Host "  1. Jobb klikk a PowerShell ikonon" -ForegroundColor White
    Write-Host "  2. 'Futtatás rendszergazdaként' / 'Run as administrator'" -ForegroundColor White
    Write-Host "  3. Navigalj a projekt konyvtarba: cd '$PSScriptRoot'" -ForegroundColor White
    Write-Host "  4. Futtasd: .\setup-scheduled-task.ps1 -Schedule Daily -Time '02:00'" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Windows Task Scheduler feladat letrehozasa..." -ForegroundColor Cyan

# Projekt konyvtar
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $projectPath "run-tests.ps1"

# Ellenorzes, hogy a run-tests.ps1 letezik-e
if (-not (Test-Path $scriptPath)) {
    Write-Host "HIBA: A run-tests.ps1 script nem talalhato!" -ForegroundColor Red
    exit 1
}

# Task Action: PowerShell script futtatasa
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" `
    -WorkingDirectory $projectPath

# Task Trigger: idozites
switch ($Schedule) {
    "Daily" {
        $trigger = New-ScheduledTaskTrigger -Daily -At $Time
        Write-Host "Idozites: Naponta $Time -kor" -ForegroundColor Yellow
    }
    "Weekly" {
        $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $Time
        Write-Host "Idozites: Hetente hetfon $Time -kor" -ForegroundColor Yellow
    }
    default {
        Write-Host "Nem tamogatott utemezes: $Schedule" -ForegroundColor Red
        Write-Host "Hasznald: Daily vagy Weekly" -ForegroundColor Gray
        exit 1
    }
}

# Task Settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Task Principal (aktualis felhasznalo)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U

try {
    # Meglevo task torlese (ha letezik)
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Meglevo feladat torlese..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # Uj task regisztralasa
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Playwright E2E tesztek futtatasa Plant Tracker alkalmazashoz" | Out-Null
    
    Write-Host "OK - Task sikeresen letrehozva: $TaskName" -ForegroundColor Green
    Write-Host ""
    Write-Host "Feladat reszletei:" -ForegroundColor Cyan
    Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State, @{Name="NextRun";Expression={(Get-ScheduledTaskInfo $_).NextRunTime}}
    
    Write-Host ""
    Write-Host "Hasznos parancsok:" -ForegroundColor Yellow
    Write-Host "  Feladat futtatasa most:  Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Feladat letiltasa:       Disable-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Feladat engedelyezese:   Enable-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Feladat torlese:         Unregister-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Feladat megtekintese:    Task Scheduler GUI-ban: taskschd.msc"
    
} catch {
    Write-Host "HIBA a task letrehozasa soran: $_" -ForegroundColor Red
    exit 1
}
