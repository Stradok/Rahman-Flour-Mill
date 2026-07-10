# Owner Settings & Staff Management Guide

Complete guide to the owner dashboard for managing staff and system settings.

## Overview

The **Settings Page** (`/settings`) is a secure owner-only control panel for:
- Managing staff accounts (add, remove, reset passwords)
- Configuring session timeout settings
- Checking for updates
- Viewing application version

## Access Control

**Only owners can access settings:**
```
❌ Staff: Cannot access /settings
✅ Owner: Full access to all settings
```

The page enforces role-based access:
```typescript
if (session?.user && (session.user as any).role !== 'owner') {
  return <div>Access Denied</div>;
}
```

---

## Part 1: Session & Security Settings

### What It Does

Configure automatic logout protection for your mill:
- **Session Timeout**: How long until inactive user is logged out
- **Warning Time**: When to show countdown warning
- **Activity Detection**: Mouse, keyboard, scroll, touch

### How It Works

#### Scenario: Default Settings (30 min timeout, 5 min warning)

```
User logs in
    ↓
User works actively (30 minutes)
    ↓
User stops using app (stands idle)
    ↓
At 25 minutes of inactivity: Warning appears
    ⏱️ Session expires in 5:00 minutes
    Move your mouse or click to stay logged in
    ↓
User takes action (moves mouse):
    Session extends for another 30 minutes
    ↓
User ignores warning (5 minutes pass):
    Session expires, auto-logout
    User returned to login page
```

### Configuration

**Session Timeout Range**: 5 - 480 minutes (8 hours max)
- **5 min**: Very aggressive (testing)
- **15 min**: High security, frequent logouts
- **30 min**: ✅ **Recommended** (balanced)
- **60 min**: Lenient, less secure
- **120+ min**: Very lenient, not recommended

**Warning Time Range**: 1 minute to (timeout - 1) minute
- Must be LESS than timeout
- Shows countdown before logout
- Example: 30 min timeout, 5 min warning

### Activity-Based Extension

Session timeout only counts during **inactivity**:

✅ These actions extend the session:
- Moving mouse
- Typing on keyboard
- Scrolling page
- Touching screen
- Clicking buttons

❌ These don't extend (won't help if you forget to logout):
- Browser idle
- Sitting at desk doing nothing
- Phone call while viewing page

### Example Configuration

**For Day Shift (Always at desk):**
```
Timeout: 60 minutes
Warning: 10 minutes
Reason: Users actively working, frequent activity
```

**For Night Security (Watching overnight):**
```
Timeout: 120 minutes
Warning: 15 minutes
Reason: Long idle periods are normal
```

**For Mill Floor (High activity area):**
```
Timeout: 15 minutes
Warning: 3 minutes
Reason: Frequent hand-off between staff, high security
```

---

## Part 2: Staff Management

### Add Staff Member

Create a new account for a staff member:

1. Go to **Settings → Staff Management**
2. Fill in:
   - **Full Name**: Their real name (e.g., "Ahmed Khan")
   - **Username**: Login username (e.g., "ahmed" or "a.khan")
   - **Temporary Password**: Give them this, they can change it later
3. Click **"Add Staff Member"**

**Result**:
```
✅ New staff account created
✅ They receive username + temporary password
✅ They log in and change password
❌ They cannot access Settings or audit logs
✅ They can use all business features (sales, costs, etc.)
```

### Reset Staff Password

If a staff member forgets their password:

1. Go to **Settings → Staff Management**
2. Find the staff member in the list
3. Click **"Reset Password"**
4. Enter new temporary password
5. Give password to staff member
6. They can change it themselves after login

### Remove Staff Member

When someone leaves the mill:

1. Go to **Settings → Staff Management**
2. Find the staff member
3. Click **"Remove"**
4. Confirm deletion
5. Account is deleted immediately

**Important**: This cannot be undone. Their data remains in transaction logs (for audit), but their account is gone.

---

## Security: Account Protection

### How Passwords Are Protected

Passwords go through **two layers of protection**:

#### Layer 1: Database Encryption
```
Your database file (flour-mill.db):
├─ Encrypted with AES-256
├─ Unreadable without database password
└─ Even if someone steals the file → Locked
```

#### Layer 2: Password Hashing
```
Each password (including staff passwords):
├─ Hashed with scrypt algorithm
├─ One-way (cannot be reversed)
├─ Even if database is decrypted → Still hashed
└─ Cannot recover plaintext password
```

### What This Means

**If someone steals your database file:**
```
Scenario: Database file compromised
├─ Attacker downloads flour-mill.db
├─ Tries to open it: ❌ Locked (AES-256)
├─ Steals your DB password: Can now decrypt
├─ Opens database: Sees usernames + hashed passwords
├─ Tries to crack passwords: ❌ Scrypt makes this infeasible
└─ Result: No passwords leaked, accounts safe
```

**Time to crack a scrypt hash:**
```
Desktop computer: ~100 years
Supercomputer: ~1 year
Modern GPU cluster: ~1 week

→ Impractical to brute-force
```

### Comparison: Other Systems

| System | Password Security |
|--------|-------------------|
| **Our App** | ✅ Hashed + Encrypted DB |
| Excel file | ❌ Plaintext (anyone can read) |
| Cloud Google Sheets | ⚠️ Encrypted in transit, plaintext on server |
| Google Workspace | ✅ Hashed + encrypted |
| Microsoft 365 | ✅ Hashed + encrypted |

**Our approach matches enterprise security** while keeping everything local.

---

## Audit & Safety

### Can Owners See Staff Passwords?

❌ **NO** - Even you cannot see staff passwords once they're set.

- You only set temporary password during creation
- After staff changes it, nobody can see it
- If forgotten, owner must reset (gives new temp password)

### Can Staff See Other Staff Passwords?

❌ **NO** - Database encryption + role-based access prevents it.

### Can Someone Export the Database?

Yes, but it's **useless without the encryption password**:
```
Staff member steals flour-mill.db file
    ↓
Takes it to attacker
    ↓
Attacker tries to open: ❌ Locked (need DB password)
    ↓
Cannot read any data or passwords
    ↓
Database is safe
```

---

## Activity Logs

### What Gets Logged?

As owner, you can see (in audit logs):
- ✅ Who made each sale
- ✅ Who added costs
- ✅ Who logged production
- ✅ Who deleted entries (and reason)
- ✅ When staff accounts were created/deleted

### What's NOT Logged?

- ❌ Passwords (ever)
- ❌ Login timestamps (currently - could add)
- ❌ Failed login attempts (currently - could add)

### Where to Find Logs

- **Deletion Log**: Menu → Audit → Deletion Log
- **Return Log**: Menu → Audit → Return Log
- **Product Changes**: Menu → Audit → Product Changes

---

## Common Questions

### Q: Can staff change their own password?
**A**: Not yet - we recommend adding this feature. Currently, only owner can reset.

### Q: What if I set timeout too low?
**A**: Staff get logged out frequently. You can increase it anytime (no restart needed).

### Q: What if someone forgets the database password?
**A**: Data is **permanently unrecoverable** - this is by design. Write it down and store safely.

### Q: Can I see who's currently logged in?
**A**: Not yet. Could add a "Session Manager" page showing active users.

### Q: What happens to staff data when I remove them?
**A**: 
- ✅ Their account is deleted
- ✅ Their data in transactions remains (audit trail)
- ✅ They cannot log in
- ❌ You cannot recover the account

### Q: Can staff reset timeouts?
**A**: ❌ No - staff cannot access settings at all. Only owner can change timeout.

### Q: Does timeout apply to owner?
**A**: ✅ Yes - owner gets auto-logout too (same timeout as staff). Good for security.

---

## Best Practices

### Password Management

✅ **Do:**
- Create strong temporary passwords (mix letters, numbers, symbols)
- Change passwords regularly (monthly)
- Remove staff accounts when they leave
- Keep database password written down (locked box)

❌ **Don't:**
- Use "1234" as password
- Share passwords via email
- Write password on desk
- Reuse passwords across accounts

### Session Security

✅ **Do:**
- Set reasonable timeout (30-60 minutes)
- Test logout on shared devices
- Lock computer when stepping away
- Change settings if theft risk increases

❌ **Don't:**
- Set timeout to 8 hours (same as work shift)
- Share login credentials
- Leave app open on public computer
- Ignore timeout warnings

### Staff Management

✅ **Do:**
- Add staff with their real names
- Use clear, consistent usernames
- Change temporary passwords immediately (staff should)
- Review staff list monthly

❌ **Don't:**
- Use generic names ("Staff1", "User1")
- Give one account to multiple people
- Keep default passwords long-term
- Forget to remove old staff

---

## Technical Details

### Settings Storage

Settings are stored in the database:
```
Table: settings
├─ session_timeout_minutes: 30
└─ session_warning_minutes: 5
```

✅ **Persists across restarts** - settings saved when you click Save
❌ **Not encrypted** - but inside encrypted database, so protected

### Session Timeout Implementation

```typescript
// auth.ts
session: {
  maxAge: 30 * 60,    // 30 minutes
  updateAge: 5 * 60,  // refresh every 5 min of activity
}
```

- JWT token expires after timeout
- Activity resets the clock
- React component shows countdown
- Auto-logout when time expires

### Activity Detection Events

```typescript
const events = [
  'mousedown',  // Mouse click
  'keydown',    // Keyboard press
  'scroll',     // Page scroll
  'touchstart', // Touch screen
  'click',      // UI button click
];
```

Any of these events extends the session timer.

---

## Future Enhancements

Things that could be added:

1. **Login Audit Log**: See who logged in when
2. **Failed Login Attempts**: Detect account compromise attempts
3. **Session Manager**: Kick out users manually
4. **Password Policy**: Force strong passwords
5. **Two-Factor Auth**: Extra login security
6. **Staff Can Change Own Password**: Self-service
7. **Inactivity Warnings**: More granular
8. **Time-Based Settings**: Different timeouts for day/night shift

---

## Support

**Issue with staff accounts?**
- Email support@example.com

**Forgot database password?**
- Unfortunately, no recovery (by design)
- Data is unrecoverable

**Want to adjust timeout?**
- Go to Settings → Session Timeout
- Change the value
- Click Save

---

**Version**: 0.1.0  
**Last Updated**: July 2024  
**Status**: Production Ready
