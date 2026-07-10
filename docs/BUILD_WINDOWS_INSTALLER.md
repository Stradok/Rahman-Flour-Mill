# Build Windows Installer - Complete Guide

Step-by-step instructions to build the final Windows installer for Flour Mill Management System.

## Prerequisites

### Software to Install

1. **Inno Setup** (free)
   - Download: https://jrsoftware.org/isdl.php
   - Install to default location
   - Required for building the installer

2. **Node.js** (for building the app)
   - Download: https://nodejs.org/en/download/ (LTS version)
   - Install to default location
   - Required only for building, not included in installer

### System Requirements

- Windows 10 or later
- At least 1 GB free disk space
- 4 GB RAM (for build process)

---

## Step 1: Prepare Build Files

### 1.1 Download Node.js Portable (for bundling)

The installer needs to bundle Node.js so users don't need to install it separately.

```powershell
# Download Node.js portable x64
# From: https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip
# (Replace v20.11.1 with latest LTS version)

# Extract to: C:\flour-mill-build\.node-runtime
# The extracted folder should contain node.exe, npm, etc.
```

**Expected structure:**
```
.node-runtime/
├── node.exe
├── npm
├── npm.cmd
├── npx
├── npx.cmd
├── lib/
└── [other Node.js files]
```

### 1.2 Install Project Dependencies

```powershell
cd C:\flour-mill-build
npm install
```

### 1.3 Build the Next.js Application

```powershell
npm run build
```

This creates the optimized production build in `.next/` directory.

---

## Step 2: Prepare Installer Files

### 2.1 Create Build Directory Structure

```
C:\flour-mill-build\
├── .node-runtime\          (Node.js portable)
├── .next\                  (Next.js build output)
├── public\                 (Static assets, icon)
├── package.json
├── package-lock.json
├── launcher.vbs            (Launcher script)
├── server.js               (Production server)
├── FlourMill.iss           (Inno Setup script)
├── LICENSE
└── README.md
```

### 2.2 Prepare Icon (Optional but Recommended)

Create or place an icon file:
- **File**: `public\icon.ico`
- **Size**: 256x256 pixels minimum
- **Format**: .ico (Windows icon format)

If no icon:
- Inno Setup will use default Windows icon
- Still works, just less polished

### 2.3 Edit FlourMill.iss (Important!)

Open `FlourMill.iss` and update this line to match your build directory:

```ini
#define SourceDir "C:\path\to\flour-mill"
```

Change to your actual path:
```ini
#define SourceDir "C:\flour-mill-build"
```

Save the file.

---

## Step 3: Build Installer with Inno Setup

### 3.1 Open Inno Setup

1. Launch **Inno Setup Compiler**
2. File → Open
3. Select `FlourMill.iss`

### 3.2 Compile

Click the **Compile** button (or Script → Compile)

**This will:**
- Read all the files from `C:\flour-mill-build\`
- Bundle them into one installer
- Create `Output\FlourMill-Setup-v0.1.0.exe`
- Show "Compilation completed successfully" when done

### 3.3 Output

The installer will be created at:
```
C:\flour-mill-build\Output\FlourMill-Setup-v0.1.0.exe
```

Size: Approximately 200-250 MB (includes bundled Node.js)

---

## Step 4: Test the Installer

### 4.1 Test on Clean Windows (Recommended)

Best practice: Test on a clean Windows VM or separate machine without Node.js installed.

**Steps:**
1. Copy `FlourMill-Setup-v0.1.0.exe` to test machine
2. Double-click to run
3. Follow installation wizard
4. Click Finish to launch app
5. Test the complete flow:
   - Setup page → create owner account
   - Login with owner credentials
   - Add some test data
   - Verify Settings panel works
   - Test logout

### 4.2 Test Installation Paths

**Default installation:**
```
C:\Program Files\FlourMill\
├── node_runtime\
├── .next\
├── public\
├── launcher.vbs
├── server.js
└── [other files]
```

**Database location:**
```
C:\Users\[YourName]\AppData\Local\FlourMill\
├── flour-mill.db     (encrypted database)
└── .key              (encryption password)
```

### 4.3 Verify Features

Test these to ensure everything works:

```
✅ Installation completes without errors
✅ Shortcuts created (Desktop + Start Menu)
✅ App launches when you click shortcut
✅ No terminal window visible
✅ Edge opens in app mode (no address bar)
✅ Setup page appears on first run
✅ Can complete setup (create database + owner account)
✅ Login works with owner credentials
✅ Dashboard loads without errors
✅ Can enter test transactions
✅ Settings panel accessible (owner only)
✅ Logout works
✅ Can uninstall cleanly
✅ Database file persists after uninstall
```

### 4.4 Performance Check

On the 4GB RAM machine (minimum spec):
```
✅ Installer: Should take < 2 minutes
✅ Launch: Should take < 5 seconds
✅ App load: Dashboard should load in < 3 seconds
✅ Memory: Should use < 300 MB
```

If slower than expected:
- Check antivirus isn't scanning the installation
- Verify Node.js processes aren't duplicating
- Try launching `launcher.vbs` directly to see error messages

---

## Step 5: Create GitHub Release

Once testing is complete:

### 5.1 On GitHub

1. Go to your repo: https://github.com/Stradok/Rahman-Flour-Mill
2. Click **Releases** (right sidebar)
3. Click **Draft a new release**

### 5.2 Fill in Release Details

**Tag version:** `v0.1.0`

**Release title:** 
```
Version 0.1.0 - Initial Release
```

**Release notes:**
```markdown
## ✨ First Release

### Features
- 🔐 AES-256 encrypted database
- 👥 Multi-user with role-based access
- 💰 Sales & billing management
- 📊 Cost tracking & reporting
- 🌾 Production logging
- 📋 Audit trails

### Installation
1. Download FlourMill-Setup-v0.1.0.exe
2. Run the installer
3. Complete first-run setup
4. Start using!

### System Requirements
- Windows 10 or later
- 4 GB RAM
- 500 MB free disk space

### Security
- All data encrypted locally (AES-256)
- No cloud, no internet required
- Multi-user with passwords

See [Documentation](docs/) for complete details.
```

### 5.3 Upload Installer

Click **Choose a file** (under "Attach binaries")

Select: `FlourMill-Setup-v0.1.0.exe`

### 5.4 Publish

Click **Publish release**

---

## Step 6: Users Can Download & Install

Users will now see:

```
https://github.com/Stradok/Rahman-Flour-Mill/releases

Version 0.1.0 - Initial Release
├─ FlourMill-Setup-v0.1.0.exe (214 MB)
```

They can:
1. Click to download
2. Run installer
3. Follow wizard
4. Start using the app!

---

## Troubleshooting

### Installer Won't Compile

**Problem:** Inno Setup shows errors when compiling

**Solutions:**
1. Verify `#define SourceDir` path is correct
2. Make sure all files exist in that directory
3. Check `.node-runtime\` folder has node.exe
4. Check `.next\` folder exists (from `npm run build`)

### Installer Won't Launch App

**Problem:** Installer finishes but app doesn't open

**Solutions:**
1. Check `launcher.vbs` exists in installation folder
2. Verify Node.js runtime is in `node_runtime\`
3. Open Command Prompt and run:
   ```powershell
   C:\Program Files\FlourMill\launcher.vbs
   ```
   Look for error messages

### App Won't Start on Test Machine

**Problem:** Installer works, but app crashes

**Solutions:**
1. Check Windows is fully updated
2. Run as Administrator
3. Check antivirus isn't blocking node.exe
4. Verify Edge is installed (Windows 10/11 includes it)

### Database Shows "Readonly"

**Problem:** Cannot save data after install

**Solutions:**
1. Close the app
2. Run as Administrator
3. Right-click installation folder → Properties → Security
4. Give user account "Full Control"
5. Restart app

---

## Update Process

To build version 0.2.0:

1. Update `package.json` version to `0.2.0`
2. Make code changes
3. Run `npm run build`
4. Update `#define MyAppVersion "0.2.0"` in FlourMill.iss
5. Compile new installer
6. Test
7. Create GitHub Release v0.2.0
8. Users will see update available in Settings

---

## Advanced: Automate the Build

You can create a PowerShell script to automate this:

```powershell
# build-installer.ps1

param(
    [string]$Version = "0.1.0",
    [string]$SourceDir = "C:\flour-mill-build"
)

Write-Host "Building Flour Mill Installer v$Version..."

# Build Next.js
Write-Host "Building Next.js application..."
cd $SourceDir
npm run build

# Update version in Inno Setup script
Write-Host "Updating version in installer script..."
(Get-Content "FlourMill.iss") -replace '#define MyAppVersion ".*"', "#define MyAppVersion `"$Version`"" | Set-Content "FlourMill.iss"

# Compile with Inno Setup
Write-Host "Compiling installer..."
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "FlourMill.iss"

Write-Host "Done! Installer created at: $SourceDir\Output\FlourMill-Setup-v$Version.exe"
```

Usage:
```powershell
.\build-installer.ps1 -Version "0.2.0"
```

---

## Summary

You now have:

✅ Production-ready Windows installer  
✅ Bundled with Node.js (no dependencies)  
✅ Launches in Edge app mode (no browser UI)  
✅ Database encrypted and local  
✅ Updatable via GitHub Releases  
✅ Professional installation experience  

**Result**: Users can download and run your flour mill management system like any other Windows program. ✨

---

**Questions?**
- Check `docs/INSTALLATION.md` for user-facing guide
- Check `docs/INSTALLER_NOTES.md` for technical details
- Email: support@example.com
