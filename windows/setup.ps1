# ============================================================================
#  Al Rehman Flour Mills  -  one-script Windows install & update
#
#  Prerequisite on the PC: git  (winget install --id Git.Git -e)
#
#  First install:
#      git clone https://github.com/Stradok/Rahman-Flour-Mill.git "$env:LOCALAPPDATA\FlourMill\app"
#      powershell -NoProfile -ExecutionPolicy Bypass -File "$env:LOCALAPPDATA\FlourMill\app\windows\setup.ps1"
#
#  Updates: double-click the "Update Flour Mill" shortcut this script creates
#  (it re-runs this script: git pull + rebuild; business data is never touched).
#
#  Design notes  -  why Defender/SmartScreen stay quiet:
#    * no admin rights, everything under %LOCALAPPDATA% (no UAC prompt)
#    * no unsigned .exe is ever downloaded  -  only the officially signed
#      node.exe inside Node.js' own ZIP from nodejs.org over HTTPS
#    * the server binds 127.0.0.1 only, so Windows Firewall never prompts
#    * no Defender exclusions are added; none are needed
#
#  Layout it creates:
#    %LOCALAPPDATA%\FlourMill\node\...     portable Node.js runtime
#    %LOCALAPPDATA%\FlourMill\app\...      this repository (git clone) + build
#    %LOCALAPPDATA%\FlourMill\*.vbs/.ps1   launcher + updater
#    %APPDATA%\FlourMill\flour-mill.db     business data (server.js sets this;
#                                          survives every update/uninstall)
# ============================================================================

#Requires -Version 5.1
param(
    [string]$Branch = "main",
    [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"   # Invoke-WebRequest is ~10x faster without the progress bar
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$RepoUrl      = "https://github.com/Stradok/Rahman-Flour-Mill.git"
$Root         = Join-Path $env:LOCALAPPDATA "FlourMill"
$AppDir       = Join-Path $Root "app"
$NodeDir      = Join-Path $Root "node"
$Port         = 3210
$AppUrl       = "http://127.0.0.1:$Port"
$NodeFallback = "v22.14.0"                 # used only if nodejs.org's version index is unreachable

function Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "    $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }

# ---------------------------------------------------------------- prerequisites
Step "Checking prerequisites"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Fail "git is not installed. Run:  winget install --id Git.Git -e   then reopen PowerShell and rerun this script."
}
Ok "git $((git --version) -replace 'git version ','')"
New-Item -ItemType Directory -Force -Path $Root | Out-Null

# ---------------------------------------------------------------- stop running app
Step "Stopping any running Flour Mill server"
try {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Stop-Process -Id ($conn | Select-Object -First 1).OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Ok "stopped previous instance"
    } else { Ok "not running" }
} catch { Ok "not running" }

# ---------------------------------------------------------------- portable Node.js
Step "Portable Node.js runtime"
if (Test-Path (Join-Path $NodeDir "node.exe")) {
    Ok "already present: $(& (Join-Path $NodeDir 'node.exe') --version)"
} else {
    $nodeVersion = $NodeFallback
    try {
        $index = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -TimeoutSec 30
        $latest22 = $index | Where-Object { $_.version -like "v22.*" } | Select-Object -First 1
        if ($latest22) { $nodeVersion = $latest22.version }
    } catch { Write-Host "    (couldn't query nodejs.org index, using $NodeFallback)" }

    $zipName = "node-$nodeVersion-win-x64"
    $zipPath = Join-Path $env:TEMP "$zipName.zip"
    Write-Host "    downloading Node.js $nodeVersion (~30 MB)..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/$nodeVersion/$zipName.zip" -OutFile $zipPath -TimeoutSec 600

    Write-Host "    extracting..."
    $extractDir = Join-Path $env:TEMP "flourmill-node-extract"
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
    if (Test-Path $NodeDir) { Remove-Item $NodeDir -Recurse -Force }
    Move-Item (Join-Path $extractDir $zipName) $NodeDir
    Remove-Item $zipPath, $extractDir -Recurse -Force -ErrorAction SilentlyContinue
    Ok "installed $(& (Join-Path $NodeDir 'node.exe') --version)"
}
$env:Path = "$NodeDir;$env:Path"

# ---------------------------------------------------------------- get / update code
Step "Application code"
if (Test-Path (Join-Path $AppDir ".git")) {
    Write-Host "    updating from GitHub..."
    git -C $AppDir fetch --depth 1 origin $Branch
    if ($LASTEXITCODE -ne 0) { Fail "git fetch failed  -  is the internet connected?" }
    git -C $AppDir reset --hard "origin/$Branch" | Out-Null
    Ok "now at: $(git -C $AppDir log -1 --format='%h %s')"
} else {
    Write-Host "    cloning repository..."
    git clone --depth 1 --branch $Branch $RepoUrl $AppDir
    if ($LASTEXITCODE -ne 0) { Fail "git clone failed  -  is the internet connected?" }
    Ok "cloned"
}

# ---------------------------------------------------------------- .env (once)
Step "App secrets (.env)"
$envFile = Join-Path $AppDir ".env"
if (Test-Path $envFile) {
    Ok "keeping existing .env (login sessions survive updates)"
} else {
    $secret = & (Join-Path $NodeDir "node.exe") -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    @(
        "AUTH_SECRET=$secret",
        "AUTH_TRUST_HOST=true",
        "PORT=$Port"
    ) | Set-Content -Path $envFile -Encoding ASCII
    Ok "generated new AUTH_SECRET"
}

# ---------------------------------------------------------------- install + build
Step "Installing dependencies (first run: a few minutes)"
Push-Location $AppDir
try {
    & (Join-Path $NodeDir "npm.cmd") ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { Fail "npm ci failed (see output above)" }
    Ok "dependencies ready"

    Step "Building the application"
    & (Join-Path $NodeDir "npm.cmd") run build
    if ($LASTEXITCODE -ne 0) { Fail "build failed (see output above)" }
    Ok "production build complete"
} finally { Pop-Location }

# ---------------------------------------------------------------- launcher files
Step "Creating launcher and shortcuts"

# launch.ps1  -  starts the server hidden (if not already up), waits, opens Edge app window
@"
`$ErrorActionPreference = 'SilentlyContinue'
`$env:Path = '$NodeDir;' + `$env:Path
`$env:PORT = '$Port'
function PortUp {
    try {
        `$c = New-Object Net.Sockets.TcpClient
        `$c.Connect('127.0.0.1', $Port); `$c.Close(); return `$true
    } catch { return `$false }
}
if (-not (PortUp)) {
    Start-Process -FilePath '$NodeDir\node.exe' -ArgumentList 'server.js' -WorkingDirectory '$AppDir' -WindowStyle Hidden
    `$deadline = (Get-Date).AddSeconds(60)
    while (-not (PortUp) -and (Get-Date) -lt `$deadline) { Start-Sleep -Milliseconds 500 }
}
try { Start-Process msedge.exe -ArgumentList '--app=$AppUrl' }
catch { Start-Process '$AppUrl' }  # no Edge? open in the default browser
"@ | Set-Content -Path (Join-Path $Root "launch.ps1") -Encoding ASCII

# VBS wrappers: run PowerShell with no visible window
@"
CreateObject("Wscript.Shell").Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""$Root\launch.ps1""", 0, False
"@ | Set-Content -Path (Join-Path $Root "FlourMill.vbs") -Encoding ASCII

@"
CreateObject("Wscript.Shell").Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""$AppDir\windows\setup.ps1""", 1, False
"@ | Set-Content -Path (Join-Path $Root "UpdateFlourMill.vbs") -Encoding ASCII

$shell = New-Object -ComObject WScript.Shell
$iconPath = Join-Path $AppDir "public\icon.ico"
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"

foreach ($target in @(
    @{ Lnk = (Join-Path $shell.SpecialFolders("Desktop") "Flour Mill.lnk");        Vbs = "FlourMill.vbs";       Desc = "Al Rehman Flour Mills" },
    @{ Lnk = (Join-Path $startMenu "Flour Mill.lnk");                              Vbs = "FlourMill.vbs";       Desc = "Al Rehman Flour Mills" },
    @{ Lnk = (Join-Path $startMenu "Update Flour Mill.lnk");                       Vbs = "UpdateFlourMill.vbs"; Desc = "Update Al Rehman Flour Mills to the latest version" }
)) {
    $lnk = $shell.CreateShortcut($target.Lnk)
    $lnk.TargetPath = "$env:SystemRoot\System32\wscript.exe"
    $lnk.Arguments  = """$(Join-Path $Root $target.Vbs)"""
    $lnk.WorkingDirectory = $Root
    $lnk.Description = $target.Desc
    if (Test-Path $iconPath) { $lnk.IconLocation = $iconPath }
    $lnk.Save()
}
Ok "shortcuts: Desktop 'Flour Mill', Start Menu 'Flour Mill' + 'Update Flour Mill'"

# uninstall.ps1  -  removes the app but never the business data
@"
Write-Host 'This removes the Flour Mill APP. Business data in %APPDATA%\FlourMill is KEPT.' -ForegroundColor Yellow
if ((Read-Host 'Type YES to continue') -ne 'YES') { exit }
try {
    `$c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (`$c) { Stop-Process -Id (`$c | Select-Object -First 1).OwningProcess -Force }
} catch {}
Remove-Item -LiteralPath '$($shell.SpecialFolders("Desktop"))\Flour Mill.lnk' -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath '$startMenu\Flour Mill.lnk' -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath '$startMenu\Update Flour Mill.lnk' -Force -ErrorAction SilentlyContinue
Set-Location `$env:TEMP
Remove-Item -LiteralPath '$Root' -Recurse -Force
Write-Host 'Removed. Data preserved in %APPDATA%\FlourMill.' -ForegroundColor Green
"@ | Set-Content -Path (Join-Path $Root "uninstall.ps1") -Encoding ASCII

# ---------------------------------------------------------------- done
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Flour Mill installed successfully" -ForegroundColor Green
Write-Host "  App:      $AppDir"
Write-Host "  Data:     $env:APPDATA\FlourMill  (survives updates)"
Write-Host "  Launch:   'Flour Mill' on the Desktop / Start Menu"
Write-Host "  Update:   'Update Flour Mill' in the Start Menu"
Write-Host "  Remove:   powershell -File `"$Root\uninstall.ps1`""
Write-Host "============================================================" -ForegroundColor Green

if (-not $NoLaunch) {
    Step "Launching"
    Start-Process "$env:SystemRoot\System32\wscript.exe" -ArgumentList """$(Join-Path $Root 'FlourMill.vbs')"""
    Ok "opening $AppUrl in an app window  -  first visit shows the Setup screen"
}
