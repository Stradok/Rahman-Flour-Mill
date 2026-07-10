# Update Strategy & Release Management

How the Flour Mill Management System handles updates, distributions, and version management.

## Overview

Updates are delivered through GitHub Releases. The application:
1. Periodically checks GitHub for new versions
2. Notifies the user when an update is available
3. Provides a download link to the new installer
4. User runs the new installer to upgrade (non-disruptive)
5. Database is never touched during upgrades

## Version Numbers

We use semantic versioning: `MAJOR.MINOR.PATCH`

```
0.1.0
│ │ └─ Patch: Bug fixes (0.1.1, 0.1.2, etc.)
│ └─── Minor: New features (0.2.0, 0.3.0, etc.)
└───── Major: Breaking changes (1.0.0, 2.0.0, etc.)
```

### Examples
- `0.1.0` → Initial release
- `0.1.1` → Bug fix
- `0.2.0` → New feature (e.g., multi-location support)
- `1.0.0` → Major redesign (rare)

## How Updates Work

### 1. Update Checking

#### Automatic (Weekly)
- Every 7 days, app checks GitHub Releases in the background
- Only compares version numbers (no data sent)
- If new version found, shows notification in Settings

#### Manual
- User clicks Settings → "Check for Updates"
- App queries GitHub immediately
- Displays current and latest version

### 2. Update Check API

**Endpoint**: `GET /api/check-updates`

**Response**:
```json
{
  "currentVersion": "0.1.0",
  "latestVersion": "0.2.0",
  "isUpdateAvailable": true,
  "releaseName": "Version 0.2.0 - Staff Permissions",
  "releaseNotes": "## New Features\n- Added staff role management...",
  "publishedAt": "2024-07-15T10:30:00Z",
  "downloadUrl": "https://github.com/.../FlourMill-Setup-v0.2.0.exe",
  "releaseUrl": "https://github.com/.../releases/tag/v0.2.0"
}
```

**Implementation**:
- Fetches from GitHub API: `GET /repos/yourusername/flour-mill/releases/latest`
- Compares semantic versions
- No authentication required (public repository)
- Caches response for 1 hour

### 3. User Notification

In the Settings page:
```
┌─────────────────────────────────────┐
│ Application Version                 │
├─────────────────────────────────────┤
│ Current Version: 0.1.0              │
│                                     │
│ [Check for Updates]                 │
│                                     │
│ ✓ You are up to date                │
│   or                                │
│ ⚠ Version 0.2.0 is available        │
│   [Download v0.2.0]                 │
└─────────────────────────────────────┘
```

### 4. Download and Install

- User clicks download link
- Browser opens GitHub Release page or downloads installer
- User runs `FlourMill-Setup-vX.X.X.exe` like normal installation
- **Installer detects existing installation**:
  - Offers to upgrade existing installation
  - Or install to new location
- Overwrites files in `C:\Program Files\FlourMill`
- Leaves database in `%APPDATA%\FlourMill\` completely untouched
- User logs in normally after restart

## Release Process

### Step 1: Prepare Release

1. **Update Version Number** (`package.json`):
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```
   - Compiles TypeScript
   - Optimizes for production
   - Outputs to `.next/` directory

3. **Create Windows Installer** (Inno Setup):
   ```bash
   # This step will be automated with GitHub Actions
   # Creates: FlourMill-Setup-v0.2.0.exe
   ```

### Step 2: Create GitHub Release

1. **Tag the Commit**:
   ```bash
   git tag -a v0.2.0 -m "Version 0.2.0 - New Features"
   git push origin v0.2.0
   ```

2. **Create Release on GitHub**:
   - Go to: https://github.com/yourusername/flour-mill/releases
   - Click "Draft a new release"
   - Fill in:
     - Tag: `v0.2.0`
     - Title: `Version 0.2.0 - Feature Description`
     - Description: See template below
     - Upload Files: `FlourMill-Setup-v0.2.0.exe`
   - Click "Publish release"

### Release Description Template

```markdown
## New Features
- Added staff account management
- Improved transaction search performance

## Bug Fixes
- Fixed issue where credit amounts weren't calculating correctly
- Fixed app crash when deleting brand with no transactions

## Improvements
- Updated database schema for better performance
- Improved error messages for clarity

## How to Update
Download the installer and run it. Your database is safe and will not be affected.

### Installation Notes
- Installation location: `C:\Program Files\FlourMill`
- Database location: `C:\Users\[You]\AppData\Local\FlourMill\`
- Upgrading: Just run the new installer over the old one
- Database: Fully preserved during upgrade

### Requirements
- Windows 10 or later
- 4 GB RAM minimum

### Known Issues
- None at this time

---

**Download**: See "Assets" section below
```

## Upgrade Scenarios

### Scenario 1: User Running Older Version Sees Update

1. Opens Settings
2. Clicks "Check for Updates"
3. Sees: "Version 0.2.0 available"
4. Clicks link, downloads installer
5. Runs installer → upgrade screen
6. Clicks "Upgrade FlourMill"
7. Files overwritten, database preserved
8. Logs in normally

### Scenario 2: Major Version Jump (0.1.0 → 1.0.0)

1. User updates normally
2. Application starts
3. If database schema changed, migrations run silently
4. User logs in, everything works

### Scenario 3: User Skips Updates

- No automatic installation
- Update checks silently happen weekly
- User can upgrade at any time
- Old versions remain fully functional

### Scenario 4: Offline User

- No internet connection
- Update check fails silently
- App continues working normally
- User can update manually later when connected

## Database Migrations

When an update requires database changes:

### SQLite Migration Strategy

1. **In the API Endpoint** (e.g., `/api/brands/route.ts`):
   ```typescript
   export async function GET() {
     const db = getDatabase();
     
     // Check if migration is needed
     try {
       const result = await db.select().from(newColumn).limit(1);
     } catch (e) {
       // Column doesn't exist, run migration
       db.exec(`ALTER TABLE brands ADD COLUMN newColumn TEXT;`);
     }
     
     // Continue normally
   }
   ```

2. **Or in a Setup/Migration Endpoint**:
   ```typescript
   // app/api/migrate/route.ts
   export async function POST(req: Request) {
     const session = await auth();
     if (!session?.user || session.user.role !== "owner") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const db = getDatabase();
     
     // List of migrations to run
     const migrations = [
       "ALTER TABLE brands ADD COLUMN color TEXT;",
       "ALTER TABLE transactions ADD COLUMN notes TEXT;",
     ];

     for (const migration of migrations) {
       try {
         db.exec(migration);
       } catch (e) {
         // Already migrated
       }
     }

     return NextResponse.json({ migrated: migrations.length });
   }
   ```

## Continuous Integration (GitHub Actions)

**Future Enhancement**: Automate builds and releases

```yaml
# .github/workflows/release.yml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - name: Build Installer
        run: iscc FlourMill.iss
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: Output/FlourMill-Setup-*.exe
```

## Rollback Plan

If an update causes critical issues:

1. **Immediate Action**:
   - Users stop using broken version
   - Mark release as "Draft" on GitHub (removes from list)
   - Announce in release notes

2. **Fix the Issue**:
   - Create emergency fix
   - Release patch version (e.g., `0.2.1`)
   - Users see new version available

3. **Database Rollback** (if needed):
   - User restores from backup
   - Uses previous installer
   - Continues with older version

## Release Checklist

- [ ] Test thoroughly on Windows 10 and 11
- [ ] Update `package.json` version
- [ ] Run `npm run build` successfully
- [ ] Create Windows installer
- [ ] Test the installer on clean Windows VM
- [ ] Create git tag: `git tag v0.X.X`
- [ ] Push tag: `git push origin v0.X.X`
- [ ] Create GitHub Release
- [ ] Upload installer binary
- [ ] Test update check API
- [ ] Announce release (if appropriate)

## FAQ

### Can users downgrade to an older version?
Yes. They can download and run any previous installer from GitHub Releases. Their database is preserved.

### What if the installer crashes?
Run it again with Administrator privileges. It will detect the incomplete installation and resume.

### Can users update while data is being entered?
Not recommended. Close the app completely, then run the installer. No data loss occurs.

### How long do past versions stay available?
Indefinitely on GitHub. Users can downgrade if needed.

### What if someone lost the database password?
By design, no recovery is possible. They cannot access their old database. They'd need to reinstall and start fresh.

---

**Current Status**: Manual release process  
**Next Steps**: Automate with GitHub Actions + Inno Setup integration
