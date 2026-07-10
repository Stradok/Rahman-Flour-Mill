# Al Rehman Flour Mills Management System

A secure, local-only desktop application for managing flour mill operations. Data is encrypted on-disk and never leaves your machine.

**Version**: 0.1.0 | **Status**: Beta

## Overview

This application provides a complete business management system for small flour mills, with features for:

- **Sales Management**: Bill generation, payment tracking, customer credit management
- **Cost Tracking**: Overhead expenses, raw materials, supplier management
- **Production Logging**: Wheat grinding, production batches, inventory tracking
- **Financial Reports**: Cost analysis, profit projections, ledger reviews
- **Audit Trails**: Deletion logs, product changes, returns tracking
- **Staff Management**: Multi-user accounts with role-based access control

### Key Features

✅ **Encrypted Storage** - All data encrypted with AES-256 on disk  
✅ **Offline Operation** - No cloud dependency, works without internet  
✅ **Multi-User** - Separate login accounts with owner and staff roles  
✅ **Windows Native** - Installs and runs like any Windows program  
✅ **No Terminal Required** - Graphical setup and operation only  
✅ **Data Ownership** - Complete control—data never leaves your machine  

## System Requirements

### Minimum (Most Mill PCs)
- **OS**: Windows 10 or Windows 11
- **RAM**: 4 GB
- **Disk**: 500 MB free space
- **Processor**: Intel/AMD x86-64

### Recommended (HP Victus or Newer)
- **OS**: Windows 10 or Windows 11 (latest updates)
- **RAM**: 8 GB+
- **Disk**: 1 GB SSD
- **Processor**: Modern x86-64 CPU

## Quick Start

### Installation (First Time)

1. **Download the Installer**
   - Visit [Releases](../../releases)
   - Download the latest `FlourMill-Setup-vX.X.X.exe`
   - No other software needs to be installed

2. **Run the Installer**
   - Double-click `FlourMill-Setup-vX.X.X.exe`
   - Click through the installation wizard
   - Select installation location (typically `C:\Program Files\FlourMill`)
   - Wait for installation to complete

3. **First-Run Setup**
   - Application opens automatically after installation
   - **Important**: Set a strong database encryption password
     - This password encrypts all your business data
     - If forgotten, data **cannot be recovered**
     - Write it down and store it safely
   - Create your owner account with a username and password
   - Click "Create Database" to begin

4. **You're Ready**
   - The app is now ready to use
   - Log in with your owner account
   - Start entering business data

### Upgrading to a New Version

1. **Check for Updates**
   - Click menu → Settings
   - Click "Check for Updates"
   - If a new version is available, you'll see a link to download it

2. **Download and Run New Installer**
   - Download the new installer from the link provided
   - Run it just like the first installation
   - **Your database is safe** – upgrading only updates the application

3. **Log In**
   - After upgrade, log in normally with your existing credentials
   - All your data is preserved

## Usage

### Creating User Accounts (Owner Only)

1. Go to Settings → Manage Staff
2. Click "Add Staff Member"
3. Enter name, username, and temporary password
4. Staff member logs in and can change their password

### Permissions

**Owner Can:**
- View and edit all data
- Access profit projections and financial reports
- View all audit logs (deletions, returns, product changes)
- Manage staff accounts
- Configure system settings

**Staff Can:**
- Enter daily sales (Quick Bill)
- Manage cost entries and overhead
- Log production and wheat grinding
- View own transaction history
- **Cannot** access financial reports or audit logs

## Troubleshooting

### "Attempt to write a readonly database"
- Ensure the installation folder has write permissions
- Run the application as Administrator
- Check disk space (need at least 500 MB free)

### "Wrong password" at login
- Verify CAPS LOCK is off
- Passwords are case-sensitive
- If you forgot your password, only the owner can reset it

### "Cannot find database" or application won't start
- Ensure Windows is updated to the latest version
- Reinstall the application
- Contact support if the problem persists

### Lost or forgot database encryption password
- **Your data cannot be recovered**
- The database encryption password is your last resort backup
- There is no "forgot password" recovery by design
- For future: write the password down and store it safely

## Data Safety & Backup

### Automatic Safety
- Data is encrypted with AES-256 at rest
- No internet connection required or used
- Changes are written immediately to disk

### Manual Backup
Your database file is located at:
```
C:\Users\[YourUsername]\AppData\Local\FlourMill\flour-mill.db
```

**To backup:**
1. Close the application completely
2. Copy `flour-mill.db` to a USB drive or cloud storage (OneDrive, Google Drive, etc.)
3. Reopen the application

**To restore from backup:**
1. Close the application
2. Replace the database file with your backup copy
3. Reopen the application

## How Updates Work

### Automatic Update Checking
The application automatically checks GitHub for new versions once per week. When an update is available, you'll see a notification in the Settings menu.

### Manual Update Check
1. Click Settings → Check for Updates
2. The app downloads the latest release list from GitHub
3. Only version numbers are compared—no data is sent

### Installing an Update
1. Click the "Download New Version" link
2. Run the new installer like you did during first installation
3. Your database stays in `%APPDATA%\FlourMill\` and is never touched
4. Log in normally after the upgrade

### How the Installer Works
- Extracts app files to `C:\Program Files\FlourMill` (or custom location)
- Bundles Node.js runtime—nothing else needs installing
- Keeps your database in user AppData folder (`%APPDATA%\FlourMill\`)
- Upgrading doesn't affect your data

### Version Numbers
We use semantic versioning:
- **0.1.0** = Major.Minor.Patch
- Major: Breaking changes (rare)
- Minor: New features
- Patch: Bug fixes

## Version History

### 0.1.0 (Beta)
- Initial release
- Core business features (sales, costs, production)
- Local encryption and multi-user support
- Windows installer and setup wizard

## Support & Feedback

### Getting Help
- Check [Troubleshooting](#troubleshooting) section above
- Email support: support@example.com
- Create an issue on [GitHub Issues](../../issues)

### Reporting Bugs
When reporting issues, include:
- Windows version (Settings → System → About)
- Application version (Help menu → About)
- What you were doing when the error occurred
- Any error messages (screenshot helpful)

### Feature Requests
We'd love to hear what you need. Email feature requests to support@example.com or create a GitHub issue marked `enhancement`.

## Security & Privacy

### Your Data is Yours
- **Never shared**: Data stays on your machine
- **Encrypted**: AES-256 encryption prevents unauthorized access
- **Offline**: No cloud syncing, no phone home
- **No tracking**: We don't monitor usage

### What We Check (Optional)
- Update checks: We only read public GitHub releases (version numbers only)
- No analytics, no user IDs, no session tracking

## For Developers

Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and development instructions.

## License

Proprietary — All rights reserved. See [LICENSE](LICENSE) file for details.

---

**Questions?** Email support@example.com  
**Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md)  
**Found a bug?** Create an [issue](../../issues)
