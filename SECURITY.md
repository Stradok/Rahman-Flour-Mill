# Security Policy

## Reporting Security Issues

**Do not create public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, please email security concerns to:

📧 **security@example.com**

Please include:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

We will:
1. Acknowledge receipt within 24 hours
2. Investigate and assess severity
3. Work on a fix
4. Release a security patch
5. Credit you in the release notes (if you wish)

## Security Principles

### Data Protection
- **Encryption at Rest**: All data is encrypted with AES-256 using SQLCipher
- **No Cloud**: Data never leaves your machine
- **Passwords**: All passwords are hashed using scrypt (Node.js built-in)
- **No Tracking**: We don't collect usage data or analytics

### Authentication
- Database encryption password: Irretrievable by design
- Per-user passwords: Hashed, never stored in plain text
- JWT sessions: Signed with a secure key
- Role-based access: Owner-only pages require explicit authorization

### Database Security
- Single encryption key per machine (database password)
- Passwords stored in secure file: `%APPDATA%\FlourMill\.key`
- Journal mode: WAL (Write-Ahead Logging) for consistency
- No SQL injection: Drizzle ORM parameterizes all queries

## Known Limitations

### By Design
- **No password recovery**: Database encryption password cannot be recovered if lost
- **No cloud backup**: You must backup manually to external storage
- **Single encryption password**: All users share the database encryption (separate login passwords)
- **Local only**: No multi-device sync or remote access

### Future Improvements
- [ ] Windows Credential Manager for password storage
- [ ] Encrypted cloud backup option
- [ ] Audit log encryption rotation
- [ ] Hardware security key support (future)

## Security Best Practices for Users

1. **Backup Your Database**
   - Copy `%APPDATA%\FlourMill\flour-mill.db` regularly
   - Store backup on USB drive or encrypted cloud storage
   - Test restore occasionally to ensure backups work

2. **Protect Your Passwords**
   - Use strong, unique passwords (>12 characters)
   - Store database password in secure location (not written on desk!)
   - Change staff passwords regularly
   - Don't share passwords via email

3. **System Security**
   - Keep Windows updated
   - Use Windows Defender or reputable antivirus
   - Run as regular user, not administrator
   - Lock your computer when away

4. **Access Control**
   - Owner account: Use strong password
   - Staff accounts: Limited permissions by design
   - Remove staff accounts when they leave
   - Don't leave app unattended while logged in

## Vulnerability Disclosure Timeline

We follow responsible disclosure:
1. **Report received** → Acknowledged within 24 hours
2. **Assessment** → Severity determined within 3 days
3. **Fix development** → Patch created
4. **Testing** → Security patch tested thoroughly
5. **Release** → Patch published to GitHub Releases
6. **Notification** → Email sent to affected users
7. **Credit** → Researcher credited (with permission)

## Security Updates

Security patches are released as soon as possible:
- **Critical**: Released within 24-48 hours
- **High**: Released within 1 week
- **Medium**: Released within 2 weeks
- **Low**: Released in next regular update

All security updates are labeled `[SECURITY]` in release notes.

## Supported Versions

| Version | Status | Support Until |
|---------|--------|--------------|
| Latest  | ✅ Supported | Until next release |
| -1      | ⚠️ Limited | 3 months after release |
| Older   | ❌ Unsupported | N/A |

We recommend upgrading to the latest version for security fixes.

## Dependencies & Third-Party Security

### Trusted Dependencies
- **Next.js**: Industry-standard framework, maintained by Vercel
- **NextAuth.js**: Popular authentication library, widely used
- **Drizzle ORM**: Modern ORM with strong type safety
- **better-sqlite3-multiple-ciphers**: Maintained fork of better-sqlite3 with SQLCipher
- **Tailwind CSS**: Utility-first CSS framework

### Dependency Monitoring
We use npm's built-in audit to check for vulnerabilities:
```bash
npm audit
npm audit fix
```

Run this regularly to find and patch vulnerable dependencies.

## Encryption Details

### Database Encryption
- **Algorithm**: AES-256 (via SQLCipher)
- **Key Derivation**: PBKDF2
- **Initialization Vector**: Unique per database
- **Journal Mode**: WAL (Write-Ahead Logging)

### Password Hashing
- **Algorithm**: scrypt (NIST recommendation)
- **Parameters**: N=16384, r=8, p=1
- **Output**: 32 bytes (256 bits)

## Compliance

This application:
- ✅ Encrypts data at rest
- ✅ Requires authentication
- ✅ Supports role-based access
- ✅ Maintains audit logs (deletions, changes, returns)
- ✅ Allows data export/backup
- ✅ Does not collect personal data
- ✅ Does not track users
- ✅ No cloud storage

## Questions?

For security questions or concerns:
📧 Email: security@example.com

---

**Last Updated**: July 2024
**Version**: 0.1.0
