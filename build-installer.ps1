# Flour Mill Management System - Automated Installer Build Script
# This script builds the Windows installer automatically

param(
    [string]$Version = "0.1.0",
    [string]$BuildDir = $PSScriptRoot,
    [switch]$SkipBuild = $false,
    [switch]$OpenOutput = $false
)

Write-Host "`n+============================================================+" -ForegroundColor Cyan
Write-Host "|  Flour Mill Management System - Installer Builder         |" -ForegroundColor Cyan
Write-Host "+============================================================+`n" -ForegroundColor Cyan

# Color functions
function Write-Success { Write-Host "[OK] $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "[FAIL] $args" -ForegroundColor Red }
function Write-Info { Write-Host "[INFO]  $args" -ForegroundColor Blue }
function Write-Warning-Custom { Write-Host "[WARN]  $args" -ForegroundColor Yellow }

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Node.js not found. Please install from https://nodejs.org/"
    exit 1
}
Write-Success "Node.js found: $(node --version)"

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "npm not found. Please install Node.js"
    exit 1
}
Write-Success "npm found: $(npm --version)"

# Check Inno Setup
$isccPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    Write-Error-Custom "Inno Setup not found at $isccPath"
    Write-Info "Download from: https://jrsoftware.org/isdl.php"
    exit 1
}
Write-Success "Inno Setup found"

# Build Next.js app
if (-not $SkipBuild) {
    Write-Host "`n Building Next.js application..." -ForegroundColor Yellow

    cd $BuildDir

    Write-Info "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"

    Write-Info "Building application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "npm run build failed"
        exit 1
    }
    Write-Success "Application built successfully"
} else {
    Write-Info "Skipping application build (--SkipBuild)"
}

# Update version in Inno Setup script
Write-Host "`n Updating installer version..." -ForegroundColor Yellow

$issFile = Join-Path $BuildDir "FlourMill.iss"
if (-not (Test-Path $issFile)) {
    Write-Error-Custom "FlourMill.iss not found at $issFile"
    exit 1
}

Write-Info "Setting version to $Version"
$content = Get-Content $issFile -Raw
$content = $content -replace '#define MyAppVersion ".*"', "#define MyAppVersion `"$Version`""
$content = $content -replace '#define SourceDir ".*"', "#define SourceDir `"$BuildDir`""
Set-Content $issFile $content -NoNewline

Write-Success "Installer script updated"

# Create Output directory if it doesn't exist
$outputDir = Join-Path $BuildDir "Output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Success "Created output directory"
}

# Compile with Inno Setup
Write-Host "`n Compiling installer..." -ForegroundColor Yellow

$outputFile = "FlourMill-Setup-v$Version.exe"
$outputPath = Join-Path $outputDir $outputFile

Write-Info "Compiling to: $outputPath"

& $isccPath $issFile

if ($LASTEXITCODE -eq 0) {
    Write-Success "Installer compiled successfully!"
    Write-Success "Output: $outputPath"

    # Get file size
    if (Test-Path $outputPath) {
        $size = (Get-Item $outputPath).Length / 1MB
        Write-Info "File size: $([Math]::Round($size, 1)) MB"
    }
} else {
    Write-Error-Custom "Compilation failed with exit code $LASTEXITCODE"
    exit 1
}

# Summary
Write-Host "`n+============================================================+" -ForegroundColor Green
Write-Host "|                    BUILD COMPLETE [OK]                       |" -ForegroundColor Green
Write-Host "+============================================================+`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the installer on a clean Windows VM/machine"
Write-Host "2. Upload to GitHub Releases: $outputPath"
Write-Host "3. Users can now download and install!`n"

Write-Host "Test the installer:" -ForegroundColor Cyan
Write-Host "  Double-click: $outputPath`n"

Write-Host "Create GitHub Release:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://github.com/Stradok/Rahman-Flour-Mill/releases"
Write-Host "  2. Draft new release (v$Version)"
Write-Host "  3. Upload: $outputFile"
Write-Host "  4. Publish!`n"

# Open output directory if requested
if ($OpenOutput) {
    Start-Process $outputDir
}
