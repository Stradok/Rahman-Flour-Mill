# Contributing to Flour Mill Management System

Thank you for your interest in contributing! This guide explains how to set up a development environment and contribute code.

## Development Setup

### Prerequisites

- **Node.js**: v18 or later
- **npm**: v9 or later
- **Git**: For version control
- **Windows 10/11** or **WSL2 on Windows**

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/flour-mill.git
   cd flour-mill
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

4. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Structure

```
flour-mill/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── brands/          # Brand management endpoints
│   │   ├── transactions/    # Sales and payments
│   │   ├── setup/           # Database initialization
│   │   └── ...
│   ├── login/               # Login page
│   ├── setup/               # First-run setup
│   └── dashboard/           # Protected pages
├── components/              # React components
│   ├── dashboard/           # Dashboard UI components
│   ├── sales/               # Sales-related components
│   └── clay/                # Design system components
├── lib/                      # Utilities and services
│   ├── db.ts                # Database initialization & unlocking
│   ├── schema.ts            # Drizzle ORM schema
│   ├── password.ts          # Password hashing
│   ├── calculations.ts      # Business logic
│   └── types.ts             # TypeScript types
├── public/                  # Static assets
├── auth.ts                  # NextAuth configuration
├── proxy.ts                 # Middleware (routing, auth checks)
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies
```

## Key Technologies

- **Frontend**: React 19, Next.js 16 (App Router)
- **Database**: SQLite + better-sqlite3-multiple-ciphers (encrypted)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5 with Credentials provider
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

## Database Layer

### Understanding the Setup

The database uses AES-256 encryption via SQLCipher (through better-sqlite3-multiple-ciphers):

1. **Initialization** (`lib/db.ts`):
   ```typescript
   - initializeDatabase() → creates DB file
   - encryptDatabase(password) → sets encryption key (rekey pragma)
   - getDatabase() → returns Drizzle instance for queries
   - unlockWithStoredPassword() → unlocks DB with saved password
   ```

2. **Schema** (`lib/schema.ts`):
   - Drizzle schema definitions for all tables
   - Types match business domain (transactions, costs, production, etc.)

3. **First-Run Flow** (`app/api/setup/route.ts`):
   - Creates new database file
   - Sets journal mode to DELETE (required for encryption)
   - Creates all tables
   - Stores encryption password in `.key` file
   - Switches to WAL mode for production

### Adding a New Table

1. **Define in Drizzle Schema** (`lib/schema.ts`):
   ```typescript
   export const myTable = sqliteTable("my_table", {
     id: text("id").primaryKey(),
     name: text("name").notNull(),
     createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
   });
   ```

2. **Create API Endpoint** (`app/api/my-resource/route.ts`):
   ```typescript
   import { unlockWithStoredPassword, getDatabase } from "@/lib/db";
   import { myTable } from "@/lib/schema";
   import { eq } from "drizzle-orm";

   export async function GET() {
     const session = await auth();
     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

     try {
       unlockWithStoredPassword();
       const db = getDatabase();
       const results = await db.select().from(myTable);
       return NextResponse.json(results);
     } catch (error) {
       console.error("Error:", error);
       return NextResponse.json({ error: "Database error" }, { status: 500 });
     }
   }
   ```

3. **Update Setup Endpoint** (`app/api/setup/route.ts`):
   - Add CREATE TABLE statement for new table in the SQL string

## Authentication & Authorization

### How Auth Works

1. **Credentials Provider** (`auth.ts`):
   - Username + password checked against `users` table
   - Password hashing via scrypt (Node's built-in crypto)
   - JWT session with role information

2. **Role-Based Access Control**:
   ```typescript
   // Owner-only routes use requireOwner() helper
   import { requireOwner } from "@/lib/auth-helpers";

   export async function POST(req: Request) {
     const unauthorizedResponse = await requireOwner();
     if (unauthorizedResponse) return unauthorizedResponse;
     // ... handle route
   }
   ```

3. **Session Structure**:
   ```typescript
   session.user = {
     id: "uuid",
     name: "User Name",
     email: "username",
     role: "owner" | "staff"
   }
   ```

## API Patterns

### Standard GET Endpoint
```typescript
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    unlockWithStoredPassword();
    const db = getDatabase();
    const results = await db.select().from(table).orderBy(desc(table.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
```

### Standard POST Endpoint
```typescript
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    // Validate input
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    unlockWithStoredPassword();
    const db = getDatabase();

    const id = randomUUID();
    await db.insert(table).values({ id, ...body });

    const result = await db.select().from(table).where(eq(table.id, id)).limit(1);
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
```

## Code Style

### TypeScript
- Use explicit types, avoid `any`
- Use `const` by default, `let` only when necessary
- Use type guards for runtime validation

### Component Structure
```typescript
// Page component (app/page.tsx)
import { Metadata } from "next";

export const metadata: Metadata = { title: "Page Title" };

export default function Page() {
  return <div>content</div>;
}

// Server Component (default) vs Client Component
"use client"; // if using hooks/interactivity
```

### Naming Conventions
- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Functions**: `camelCase`
- **Constants**: `CONSTANT_CASE` for environment variables
- **Classes/Types**: `PascalCase`

### Comments
- Only document WHY, not WHAT
- Don't reference tickets or current task
- Keep it brief

```typescript
// ✅ Good
// SQLCipher requires DELETE journal mode for rekeying before WAL switch
db.pragma("journal_mode = DELETE");

// ❌ Bad
// Set the journal mode
db.pragma("journal_mode = DELETE");
```

## Testing

### Manual Testing (Current Approach)
1. Start dev server: `npm run dev`
2. Test setup flow at http://localhost:3000/setup
3. Test login at http://localhost:3000/login
4. Test API routes with curl or Postman

### Future: Automated Tests
```bash
npm run test          # Jest + React Testing Library
npm run test:e2e      # Playwright
npm run test:coverage # Coverage report
```

## Building for Production

### Local Build Test
```bash
npm run build
npm run start
```

### Creating a Release Build

1. **Update Version** in `package.json`:
   ```json
   "version": "0.2.0"
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Create GitHub Release**:
   - Tag: `v0.2.0`
   - Title: "Version 0.2.0 - Feature Name"
   - Description: What's new, bug fixes, etc.
   - Attach installer binary (built by Inno Setup)

## Windows Installer Build

The installer bundles everything needed:
- Node.js runtime (no installation required)
- Built Next.js application
- VBScript launcher
- Database directory stub

**Current Status**: Not yet implemented  
**Next Steps**: 
1. Create Inno Setup script (`FlourMill.iss`)
2. Add build step to GitHub Actions
3. Auto-publish to Releases

See [INSTALLER_NOTES.md](docs/INSTALLER_NOTES.md) for details.

## Update Mechanism

### How Updates are Delivered

1. **Version Check** (weekly automatic, or manual):
   - Calls `/api/check-updates`
   - Queries GitHub Releases API
   - Compares remote version vs `package.json` version

2. **Version Check Endpoint** (`app/api/check-updates/route.ts`):
   ```typescript
   // Returns: { currentVersion, latestVersion, downloadUrl, releaseNotes }
   ```

3. **Settings Page**:
   - Shows current version
   - "Check for Updates" button
   - Link to download if update available

4. **Installer Upgrade**:
   - Overwrites app files in `C:\Program Files\FlourMill`
   - Leaves database in `%APPDATA%\FlourMill\` untouched
   - User logs in normally after upgrade

## Contribution Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/meaningful-name
   ```

2. **Make Changes**
   - Keep commits focused and atomic
   - Write descriptive commit messages
   - Test your changes

3. **Push and Create PR**
   ```bash
   git push origin feature/meaningful-name
   ```
   - Go to GitHub and create a Pull Request
   - Reference related issues
   - Describe what your PR does

4. **Code Review**
   - Wait for maintainer feedback
   - Address any comments
   - Re-request review when done

5. **Merge**
   - Maintainer merges when approved
   - Your code is in the next release!

## Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Windows version & app version
- Screenshots if applicable

### Security Issues
**Do not create public issues for security problems.**  
Email security@example.com with details.

## Questions?

- Email: support@example.com
- GitHub Issues: For bugs and features
- Email support@example.com: For security or sensitive matters

---

**Thank you for contributing!** Your help makes the application better for everyone using it.
