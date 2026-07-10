# Windows Installer Build Guide - Step by Step

**FOR: Building FlourMill-Setup-v0.1.0.exe on the Mill Laptop**

**TIME:** ~30 minutes total  
**DIFFICULTY:** Easy - just follow the steps  
**TOOLS NEEDED:** Internet connection, 1 GB free disk space

---

## ✅ PRE-BUILD CHECKLIST

Before starting, check:
- [ ] Windows 10 or Windows 11
- [ ] At least 1 GB free disk space
- [ ] Internet connection (for downloads)
- [ ] Admin access to the computer

---

## STEP 1: Install Inno Setup (5 minutes)

### 1.1 Download Inno Setup

1. Open web browser
2. Go to: https://jrsoftware.org/isdl.php
3. Look for: **"Inno Setup 6.x.x"** (latest version)
4. Click the download link
5. Save the file (e.g., `inno-setup-6.2.0.exe`)

### 1.2 Install Inno Setup

1. Double-click the downloaded `.exe` file
2. Click "Next" on all screens
3. Accept the license agreement
4. Install to default location: `C:\Program Files (x86)\Inno Setup 6\`
5. Click "Finish"
6. Close the window

**Expected Result:** Inno Setup is installed. You can search for "Inno Setup" in Windows Start menu.

**If stuck:** 
- Error: "Admin rights needed" → Right-click installer, select "Run as administrator"
- Error: "File not found" → Re-download from https://jrsoftware.org/isdl.php

---

## STEP 2: Download Node.js Portable (5 minutes)

### 2.1 Download Node.js

1. Open web browser
2. Go to: https://nodejs.org/en/download/
3. Look for section: **"Pre-built installer"**
4. Click on **"Windows Installer (.msi)" - 64-bit (x64)**
5. Save the file

**OR for Portable version (preferred):**

1. Go to: https://nodejs.org/dist/
2. Find latest LTS version (e.g., v20.11.1)
3. Download: `node-v20.11.1-win-x64.zip`

### 2.2 Extract Node.js

**If you downloaded .zip (portable):**

1. Right-click the `.zip` file → "Extract All..."
2. Choose destination: Create a new folder called `.node-runtime` on Desktop
3. Extract files there
4. You should see: `node.exe`, `npm`, `npm.cmd` in that folder

**If you installed .msi:**

Node.js is already on your system (you don't need the portable version)

**Expected Result:**  
Folder structure:
```
C:\Users\[YourName]\Desktop\.node-runtime\
├── node.exe
├── npm
├── npm.cmd
└── [other Node.js files]
```

**If stuck:**
- Error: "Extract failed" → Try using 7-Zip or WinRAR instead
- Can't find Node.js folder → Check your Downloads folder or Desktop

---

## STEP 3: Prepare Your Code

### 3.1 Clone the Repository

1. Open Command Prompt (search "cmd" in Start menu)
2. Type:
```cmd
git clone https://github.com/Stradok/Rahman-Flour-Mill.git
cd Rahman-Flour-Mill
```

**If git not found:**
- Download from: https://git-scm.com/download/win
- Install with default options
- Restart Command Prompt

### 3.2 Copy Node.js to Project

1. Copy the `.node-runtime` folder from Desktop
2. Paste it into: `C:\Users\[YourName]\Rahman-Flour-Mill\`

**Expected Result:**
```
C:\Users\[YourName]\Rahman-Flour-Mill\
├── .node-runtime\          ← Node.js portable
├── .next\
├── app\
├── components\
├── FlourMill.iss
├── launcher.vbs
├── server.js
├── package.json
└── [other files]
```

**If stuck:**
- Can't find Rahman-Flour-Mill folder → It's in `C:\Users\[YourName]\`
- "Permission denied" → Run Command Prompt as Administrator

---

## STEP 4: Build the Next.js App

### 4.1 Open Command Prompt

1. Search "cmd" in Windows Start menu
2. Type this command:
```cmd
cd Rahman-Flour-Mill
```

### 4.2 Install Dependencies

Type:
```cmd
npm install
```

This will download and install all required packages. **Wait for it to finish** (takes 2-3 minutes).

**Expected Result:**
```
added 500+ packages in 1m23s
```

**If stuck:**
- Error: "npm: command not found" → Install Node.js first (Step 2)
- Error: "EACCES: permission denied" → Run Command Prompt as Administrator
- Error: "network timeout" → Check internet connection, try again

### 4.3 Build the Application

Type:
```cmd
npm run build
```

**Wait for it to complete** (takes 3-5 minutes). You should see:

```
▲ Next.js 15.0.0

✓ Compiled successfully
```

**Expected Result:**  
A new folder `.next\` is created with the built application.

**If stuck:**
- Error: "Build failed" → Check internet connection, try again
- Lots of warnings → Warnings are OK, as long as you see "✓ Compiled successfully"

---

## STEP 5: Update the Build Path in Inno Setup Script

### 5.1 Open FlourMill.iss

1. Find file: `C:\Users\[YourName]\Rahman-Flour-Mill\FlourMill.iss`
2. Right-click → "Open with" → "Notepad"

### 5.2 Find and Update the Path

Look for this line (around line 10):
```
#define SourceDir "C:\path\to\flour-mill"
```

Change it to your actual path. For example:
```
#define SourceDir "C:\Users\YourName\Rahman-Flour-Mill"
```

**Replace `YourName` with your actual Windows username!**

### 5.3 Save the File

Press `Ctrl+S` to save.

**If stuck:**
- Can't find FlourMill.iss → Look in the Rahman-Flour-Mill folder
- "Can't edit" error → Close Notepad, right-click FlourMill.iss → "Open with" → Notepad → Run as Administrator

---

## STEP 6: Build the Installer

### 6.1 Open Inno Setup Compiler

1. Search "Inno Setup Compiler" in Windows Start menu
2. Click to open

### 6.2 Open the Script

1. Click: File → Open
2. Browse to: `C:\Users\[YourName]\Rahman-Flour-Mill\FlourMill.iss`
3. Click Open

### 6.3 Compile the Installer

1. Click the **"Compile"** button (top left)
2. Watch the compilation progress
3. You should see: **"Compilation completed successfully"**

**This creates the installer file!**

**Expected Result:**
```
Output file: C:\Users\[YourName]\Rahman-Flour-Mill\Output\FlourMill-Setup-v0.1.0.exe
Size: ~200-250 MB
```

**If stuck:**
- Error: "Source file not found" → Check #define SourceDir path is correct
- Error: "Cannot find .node-runtime" → Make sure .node-runtime folder exists in project
- Compilation hangs → Close and try again, check antivirus isn't blocking

---

## STEP 7: Test the Installer

### 7.1 Find the Installer

Navigate to:
```
C:\Users\[YourName]\Rahman-Flour-Mill\Output\
```

You should see: **FlourMill-Setup-v0.1.0.exe**

### 7.2 Run the Installer

1. Double-click `FlourMill-Setup-v0.1.0.exe`
2. Click "Next" through the wizard
3. Accept the license
4. Choose installation location (default is fine): `C:\Program Files\FlourMill\`
5. Click "Install"
6. Click "Finish"

### 7.3 Complete First-Run Setup

1. The app should open automatically
2. You'll see the Setup page
3. Enter:
   - **Database Password:** Something secure (you'll need this to recover database)
   - **Owner Name:** Your name
   - **Username:** admin (or whatever you want)
   - **Password:** Your password
4. Click "Create Database"
5. Log in with your credentials

### 7.4 Verify It Works

- [ ] App opened without terminal window
- [ ] Setup page appeared
- [ ] Created owner account successfully
- [ ] Can log in
- [ ] Dashboard loads
- [ ] Can enter test data
- [ ] Settings panel visible (Owner only)
- [ ] Can logout

**If app doesn't open:**
- Check: `C:\Program Files\FlourMill\launcher.vbs` exists
- Right-click → Properties → Run as Administrator
- If still stuck → See Troubleshooting section

---

## ✅ SUCCESS!

If you see the app running with data, you've successfully built the Windows installer! 🎉

**The .exe file is ready to share:**
```
C:\Users\[YourName]\Rahman-Flour-Mill\Output\FlourMill-Setup-v0.1.0.exe
```

---

## 🆘 TROUBLESHOOTING

### Problem: "npm: command not found"

**Cause:** Node.js not installed or not in PATH

**Solution:**
1. Check if Node.js is installed: Search "Node.js" in Start menu
2. If not found, install from: https://nodejs.org/en/download/
3. Restart Command Prompt and try again

---

### Problem: "Build failed" or npm install fails

**Cause:** Internet connection issue

**Solution:**
1. Check internet connection
2. Try again:
```cmd
npm install
npm run build
```
3. If still fails, delete `node_modules` folder and try again:
```cmd
rmdir /s node_modules
npm install
```

---

### Problem: Inno Setup compilation fails

**Cause:** Path or file not found

**Solution:**
1. Check `#define SourceDir` in FlourMill.iss is correct
2. Verify `.node-runtime\` folder exists in project
3. Verify `.next\` folder exists (from npm run build)
4. Example correct path:
```
#define SourceDir "C:\Users\Amman\Rahman-Flour-Mill"
```

---

### Problem: Installer runs but app won't start

**Cause:** launcher.vbs can't find Node.js

**Solution:**
1. Open: `C:\Program Files\FlourMill\`
2. Check: `node_runtime\node.exe` exists
3. Right-click `launcher.vbs` → Run as Administrator
4. If error appears, note it and try:
   - Reinstall the app
   - Run as Administrator

---

### Problem: "Permission denied" errors

**Cause:** Not running as Administrator

**Solution:**
1. Search "Command Prompt" in Start menu
2. Right-click → "Run as Administrator"
3. Type: `cd Rahman-Flour-Mill`
4. Try again

---

### Problem: App opens but database won't create

**Cause:** Permission issue on AppData folder

**Solution:**
1. Close the app
2. Go to: `C:\Users\[YourName]\AppData\Local\`
3. Right-click `FlourMill` folder → Properties
4. Security tab → Edit
5. Select your user → Click Full Control → Apply
6. Restart app

---

### Problem: "Antivirus blocked installation"

**Cause:** Antivirus thinks Node.js is suspicious

**Solution:**
1. Temporarily disable antivirus
2. Build and install
3. Add `C:\Program Files\FlourMill\` to antivirus whitelist
4. Re-enable antivirus

---

## 📋 NEXT STEPS AFTER BUILDING

Once you have a working `.exe`:

1. **Test thoroughly** on the mill laptop
2. **Test on another machine** if possible
3. **Upload to GitHub Releases:**
   - Go to: https://github.com/Stradok/Rahman-Flour-Mill/releases
   - Click "Draft a new release"
   - Tag: `v0.1.0`
   - Title: "Version 0.1.0 - Initial Release"
   - Upload: `FlourMill-Setup-v0.1.0.exe`
   - Publish!
4. **Users can now download** from Releases page

---

## 📞 HELP

**If you get stuck:**

1. **Check this guide** for your error in Troubleshooting section
2. **Take a screenshot** of the error
3. **Note what step** you were on
4. **Email:** khawajaamman@gmail.com with screenshot

---

## 🎯 QUICK REFERENCE

**All commands in one place:**

```cmd
# Clone the repo
git clone https://github.com/Stradok/Rahman-Flour-Mill.git
cd Rahman-Flour-Mill

# Install dependencies
npm install

# Build the app
npm run build

# The installer is then compiled in Inno Setup GUI
# Output: Output\FlourMill-Setup-v0.1.0.exe
```

**Important Files:**
- `FlourMill.iss` - Installer configuration (update SourceDir path!)
- `launcher.vbs` - Windows launcher script
- `server.js` - Production server
- `.next\` - Built app (created by npm run build)
- `.node-runtime\` - Node.js portable (you provide this)

---

**Good luck! You've got this! 🚀**

