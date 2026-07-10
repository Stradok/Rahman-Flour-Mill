# Installation & Setup Guide

Complete step-by-step instructions for installing and setting up the Flour Mill Management System.

## Table of Contents
1. [Before You Start](#before-you-start)
2. [Installation Steps](#installation-steps)
3. [First-Run Setup](#first-run-setup)
4. [Verify Installation](#verify-installation)
5. [Troubleshooting](#troubleshooting)

## Before You Start

### System Requirements

**Minimum Requirements:**
- Windows 10 or Windows 11 (1809 or later)
- Intel or AMD processor (x86-64)
- 4 GB RAM
- 500 MB free disk space
- Internet connection (for download only)

**What You Don't Need to Install:**
- ✅ Python
- ✅ Node.js
- ✅ PostgreSQL or MySQL
- ✅ Any other software

Everything is bundled in the installer.

### Download

1. Go to: https://github.com/yourusername/flour-mill/releases
2. Find the latest version (highest version number)
3. Download `FlourMill-Setup-vX.X.X.exe`
   - Example: `FlourMill-Setup-v0.1.0.exe`

### Antivirus Warning (Optional)

The installer might show a Windows Defender warning because it's new software.
- This is normal for unsigned installers
- Click "More info" → "Run anyway"
- The application is safe

## Installation Steps

### Step 1: Close Other Programs

Close any running applications, especially:
- Web browsers
- Email clients
- Office applications

This ensures a clean installation and avoids file locks.

### Step 2: Run the Installer

1. Double-click `FlourMill-Setup-vX.X.X.exe`
2. Click **"Yes"** if Windows asks for permission (UAC prompt)
3. Wait for the installer to load

### Step 3: Choose Installation Location

You'll see a dialog asking where to install:

**Option A: Default Location** (Recommended)
- Just click "Next"
- Installs to `C:\Program Files\FlourMill`

**Option B: Custom Location**
- Click "Browse"
- Select a different folder
- Make sure you have write permissions to the folder
- Click "Next"

### Step 4: Create Start Menu Shortcuts

The next screen offers to create shortcuts:
- ✅ Keep "Create shortcut in Start Menu" checked
- This lets you launch the app easily

Click "Next"

### Step 5: Review Settings

Review the installation summary:
- Installation folder
- Start Menu folder
- Any custom settings you chose

Click "Install" to proceed.

### Step 6: Installation Process

The installer will:
1. Extract files (1-2 minutes on 4GB RAM machine)
2. Copy bundled Node.js runtime
3. Configure shortcuts
4. Show "Installation Complete" message

Click "Finish" to close the installer.

## First-Run Setup

The application will launch automatically after installation.

### Setup Page Appears

You'll see the Al Rehman Flour Mills setup page with two steps:

**Step 1: Database Password** 🔐

This is the encryption password for your data:

1. **Type a strong password**
   - At least 8 characters
   - Mix of letters, numbers, and symbols
   - Example: `Flour@Mill2024`
   
2. **Write it down**
   - Use a notebook or password manager
   - Store in a safe place
   - **If you lose it, your data CANNOT be recovered**

3. **Confirm the password**
   - Type the same password again
   - Ensure CAPS LOCK is off

4. Click **"Next"**

### Step 2: Owner Account

Create your administrator account:

1. **Your Name**
   - Your full name
   - Example: `Mohammad Ahmad`

2. **Username**
   - This is what you'll use to log in
   - Example: `mohammad` or `m.ahmad`
   - Should be easy to remember
   - Cannot contain spaces

3. **Password**
   - Your login password (different from the database password)
   - At least 6 characters
   - Use a strong password

4. **Confirm Password**
   - Type the same password again

5. Click **"Create Database"**

The app will:
- Create an encrypted database file
- Save your account
- Automatically log you in

## Verify Installation

### Check That Everything Works

1. **You should see the dashboard** with several menu items:
   - Dashboard
   - Sales
   - Help

2. **Check Settings:**
   - Click "Settings" (if visible in menu)
   - Should show your version number
   - Should show "Check for Updates" option

3. **Create Your First Entry:**
   - Navigate to Sales → Quick Bill
   - Enter a test transaction (you can delete it later)
   - If this works, the database is functioning

### Database File Location

Your encrypted database is stored at:
```
C:\Users\[YourUsername]\AppData\Local\FlourMill\flour-mill.db
```

If you need to backup or restore:
1. Close the application
2. Copy or restore the `flour-mill.db` file
3. Reopen the application

## Troubleshooting

### Installation Won't Start
**Problem**: Double-clicking the .exe doesn't open the installer  
**Solution**:
1. Right-click the .exe file
2. Select "Run as Administrator"
3. Click "Yes" if Windows asks for permission

### Installation Hangs or Is Very Slow
**Problem**: Installer is stuck on "Extracting files..."  
**Solution**:
1. Wait at least 5 minutes (extracting takes time on slower machines)
2. If still stuck, close the installer
3. Delete the installer file and download again
4. Try again with Administrator privileges

### "Setup already running" Error
**Problem**: Can't restart setup after closing  
**Solution**:
1. Restart your computer
2. Run the installer again

### First-Run Setup Won't Load
**Problem**: Installer finished but app shows blank page or errors  
**Solution**:
1. Close the application (Alt+F4)
2. Right-click the shortcut → Run as Administrator
3. If still blank, check:
   - Windows is fully updated (Settings → Windows Update)
   - You have at least 500 MB free disk space
   - Another instance isn't already running

### "Database password is required" But I Don't Remember
**Problem**: Can't access database without the encryption password  
**Solution**:
- Unfortunately, there's no recovery if you lose the database password
- This is by design to protect your data
- Your options:
  1. Check if you wrote it down somewhere
  2. Contact the person who did the initial setup
  3. If unrecoverable: reinstall and start fresh (old data will be lost)

### "Attempt to write a readonly database"
**Problem**: Application can't save data  
**Solution**:
1. Ensure the folder `C:\Users\[You]\AppData\Local\FlourMill\` exists
2. Right-click the folder → Properties → Security → Edit
3. Select your username and check "Full Control"
4. Click OK and close the application
5. Reopen the application

### Application Won't Start at All
**Problem**: Clicking shortcut does nothing or shows error  
**Solution**:
1. Check that Windows is fully updated
   - Settings → System → About
   - Look for "Windows Update" and install if needed
2. Try reinstalling:
   - Control Panel → Programs → Programs and Features
   - Find "FlourMill" and click Uninstall
   - Download the installer again
   - Run the installer fresh
3. If still not working, contact support@example.com

## Security Notes

### Passwords
- Database password: Irretrievable if lost
- Login password: Can be reset by owner
- Both are encrypted, never stored in plain text

### Data Backup
Regular backups protect against:
- Hard drive failure
- Accidental deletion
- Corruption

**Recommended:** Backup to USB drive or OneDrive at least weekly

### Permissions
Run the application as yourself, not as administrator:
- Regular user: OK
- Administrator: Only if you have permission issues

## Next Steps

1. **Add Staff Accounts**
   - Settings → Manage Staff
   - Create accounts for each employee
   - Share usernames with them securely

2. **Configure Brands**
   - Dashboard → Products & Packaging
   - Add your flour brands and sizes

3. **Start Using**
   - Quick Bill: Daily sales entry
   - Cost Ledger: Track expenses
   - Production: Log wheat grinding and output

4. **Setup Backups**
   - Copy database file weekly to USB
   - Or use cloud storage (OneDrive, Google Drive)

## Getting Help

- **Startup Issues**: See [Troubleshooting](#troubleshooting) above
- **Usage Questions**: Check README.md
- **Bug Reports**: Email support@example.com with:
  - What you were doing
  - What went wrong
  - Windows version (Settings → System → About)
  - App version (Help menu → About)
- **Feature Requests**: Email support@example.com or create a GitHub issue

---

**Congratulations!** Your Flour Mill Management System is ready to use. 🎉
