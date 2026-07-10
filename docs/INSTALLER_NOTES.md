# Windows Installer Build Guide

How to create the Windows installer using Inno Setup.

## Overview

The Windows installer bundles:
- Node.js runtime (no separate install needed)
- Next.js application build
- VBScript launcher to start the server
- Desktop and Start Menu shortcuts
- Custom icon

**Output**: Single executable `FlourMill-Setup-vX.X.X.exe`

## Prerequisites

### Software
- **Inno Setup 6.2+**: Download from https://jrsoftware.org/isdl.php
- **Node.js 18+**: For building the app
- **npm**: For dependency management

### System Requirements
- Windows 10 or later
- ~1 GB free disk space (for build artifacts)
- ~500 MB for final installer

## Inno Setup Script

Create `FlourMill.iss` in the project root:

```ini
; Flour Mill Management System installer script

#define MyAppName "Al Rehman Flour Mills"
#define MyAppVersion GetStringFileInfo(".\out\Release\FlourMill.exe", "ProductVersion")
#define MyAppPublisher "Al Rehman Flour Mills"
#define MyAppURL "https://github.com/yourusername/flour-mill"
#define MyAppExeName "FlourMill.exe"

[Setup]
AppId={{3D2C65F5-E5E9-4E4B-8F5F-5C5E5C5C5C5C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\FlourMill
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE
OutputDir=.\Output
OutputBaseFilename=FlourMill-Setup-v{#MyAppVersion}
SetupIconFile=public\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\FlourMill.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Node.js runtime (bundled)
Source: ".\.node-runtime\*"; DestDir: "{app}\node_runtime"; Flags: ignoreversion recursesubdirs createallsubdirs

; Next.js build output
Source: ".\out\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Launcher script
Source: ".\launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion

; License
Source: ".\LICENSE"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\launcher.vbs"; IconFileName: "{app}\FlourMill.ico"; Comment: "Flour Mill Management System"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\launcher.vbs"; IconFileName: "{app}\FlourMill.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\launcher.vbs"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  if not FileExists('{sys}\nodejs.exe') and not FileExists('{pf}\nodejs\node.exe') then
  begin
    { Node.js will be bundled in {app}\node_runtime }
  end;
  Result := True;
end;
```

## Build Process

### Step 1: Create Node.js Bundle

```bash
# Create directory for bundled Node.js
mkdir .node-runtime

# Download Node.js portable (Windows x64)
# From: https://nodejs.org/dist/vXX.X.X/node-vXX.X.X-win-x64.zip
# Extract to .node-runtime/
```

### Step 2: Build Next.js Application

```bash
# Clean previous builds
rm -r .next out

# Install dependencies
npm install

# Build the application
npm run build

# Export static files (optional, for standalone build)
# npm run export
```

### Step 3: Create Launcher Script

Create `launcher.vbs` in project root:

```vbscript
' Launcher script for Flour Mill Management System
' Starts Node.js server and opens Edge in app mode

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

appDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
nodeExe = appDir & "\node_runtime\node.exe"
port = 3000
appName = "Flour Mill Management System"

' Check if already running
Set objWMIService = GetObject("winmgmts:")
Set colProcesses = objWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'node.exe'")

' Start server if not running
if colProcesses.Count = 0 then
  ' Start Node.js server silently
  objShell.Run "cmd /c cd """ & appDir & """ && """ & nodeExe & """ server.js", 0, False
  
  ' Wait for server to start
  WScript.Sleep(2000)
end if

' Launch Edge in app mode
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not objFSO.FileExists(edgePath) then
  edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
end if

objShell.Run """" & edgePath & """ --app=http://localhost:" & port, 1, False

WScript.Quit
```

### Step 4: Create Icon

Place an icon file at `public/icon.ico` (256x256 or larger)

### Step 5: Build Installer

```bash
# Install Inno Setup first
# Then run:
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" FlourMill.iss

# Output: Output\FlourMill-Setup-vX.X.X.exe
```

## Automation with GitHub Actions

See `.github/workflows/release.yml` for automated builds on version tags.

## Testing the Installer

### Test 1: Clean Install
```bash
# On a clean Windows VM or separate folder
# Run the installer
FlourMill-Setup-v0.1.0.exe

# Verify:
# - No errors during extraction
# - Icon displays correctly
# - App launches after installation
# - Can complete setup flow
```

### Test 2: Upgrade Install
```bash
# Install v0.1.0
# Then run v0.2.0 installer
# Verify:
# - Detects existing installation
# - Offers to upgrade
# - Database is preserved
# - Data is accessible after upgrade
```

### Test 3: Performance
```bash
# On 4GB RAM machine (minimum spec)
# Measure:
# - Installation time (should be <2 minutes)
# - Startup time after install (should be <5 seconds)
# - Memory usage during operation (should be <300 MB)
```

## Troubleshooting

### "Could not find file..."
- Ensure Next.js build completed: `npm run build`
- Check that .next/ directory exists
- Verify file paths in Inno Setup script

### "Node.js not found"
- Ensure .node-runtime/ is properly bundled
- Check that node.exe exists in that directory
- Verify Files section includes all node files

### "Setup failed to create directory"
- User needs write permissions to Program Files
- Try running installer as Administrator
- Check disk space is available

### Installer too large
- Node.js bundle is typically 100-150 MB
- Next.js build adds another 50-100 MB
- Total installer: 200-250 MB (expected)
- Compress redundant files

## Distribution

### GitHub Releases
1. Create GitHub Release with version tag
2. Attach installer as binary
3. Include release notes
4. Mark as latest release

### Website
1. Host installer on website (optional)
2. Link from download page
3. Include checksum for verification

### Direct Download
1. Users can download from GitHub Releases directly
2. No separate hosting needed

## Security

### Code Signing
Currently: None (self-signed)  
Future: Sign installer with code signing certificate

### Integrity Check
```powershell
# Calculate SHA-256 hash for users to verify
$file = ".\FlourMill-Setup-v0.1.0.exe"
(Get-FileHash $file -Algorithm SHA256).Hash | Out-File "$file.sha256"
```

## Version Numbering

Update Inno Setup version:
- Update `package.json` version
- Inno Setup reads from ProductVersion (automatic)
- Output filename includes version: `FlourMill-Setup-v0.1.0.exe`

## Next.js Standalone Mode

For better performance, you can use Next.js standalone mode:

```bash
# In next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... other config
};
```

This creates a smaller, self-contained build that's faster to deploy.

---

**Current Status**: Script provided, not yet integrated into build pipeline  
**Next Steps**: GitHub Actions automation, code signing, performance testing
