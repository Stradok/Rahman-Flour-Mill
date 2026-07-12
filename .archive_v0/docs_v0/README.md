# Documentation Index

Complete documentation for the Flour Mill Management System.

## For Users

### Getting Started
- **[Installation Guide](INSTALLATION.md)** - Step-by-step installation instructions for Windows
  - System requirements
  - Download and install
  - First-run setup
  - Troubleshooting

### Using the Application
- **[Main README](../README.md)** - Overview, features, quick start
  - Feature list
  - Usage basics
  - Permission levels
  - Data backup

### Support
- **[Main README - Troubleshooting](../README.md#troubleshooting)** - Common issues and solutions
- Email: support@example.com
- GitHub Issues: Report bugs

## For Administrators

### Managing Users
- See Main README - "Creating User Accounts (Owner Only)"
- Staff roles and permissions
- Adding/removing staff members

### Data Management
- **[UPDATE_STRATEGY.md](UPDATE_STRATEGY.md)** - How to manage application updates
  - Checking for updates
  - Installing new versions
  - Database migrations
  - Rollback procedures

### Backup & Recovery
- See Main README - "Data Safety & Backup"
- Backup procedures
- Restore procedures
- Password recovery (important: there is none)

## For Developers

### Getting Started
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Development setup and contribution guidelines
  - Prerequisites
  - Project structure
  - Code style
  - Testing

### Technical Documentation

#### Database & API
- **[CONTRIBUTING.md - Database Layer](../CONTRIBUTING.md#database-layer)** - How the database works
  - Encryption and initialization
  - Adding new tables
  - API patterns and examples

#### Authentication
- **[CONTRIBUTING.md - Authentication](../CONTRIBUTING.md#authentication--authorization)** - Auth system
  - How login works
  - Role-based access
  - Implementing owner-only features

#### Architecture
- **[UPDATE_STRATEGY.md](UPDATE_STRATEGY.md)** - Update system architecture
  - How updates are distributed
  - Release process
  - Version management

### Building & Releasing

#### Creating Installers
- **[INSTALLER_NOTES.md](INSTALLER_NOTES.md)** - Build the Windows installer
  - Inno Setup script
  - Build process
  - Testing the installer
  - Distribution

#### Release Process
- **[UPDATE_STRATEGY.md - Release Process](UPDATE_STRATEGY.md#release-process)** - How to release new versions
  - Version numbering
  - Building and testing
  - Creating GitHub releases
  - Automating with GitHub Actions

## For Security

### Security Policy
- **[SECURITY.md](../SECURITY.md)** - Security information
  - Reporting vulnerabilities
  - Security principles
  - Encryption details
  - Best practices for users

### Encryption
- See SECURITY.md - "Encryption Details"
  - Database encryption (AES-256)
  - Password hashing (scrypt)

## Project Structure

```
flour-mill/
├── README.md              # Main documentation
├── CONTRIBUTING.md        # Developer guide
├── SECURITY.md            # Security policy
├── LICENSE                # Proprietary license
├── docs/
│   ├── README.md          # This file
│   ├── INSTALLATION.md    # Installation guide
│   ├── UPDATE_STRATEGY.md # Update system
│   └── INSTALLER_NOTES.md # Windows installer build
├── .github/
│   ├── workflows/         # GitHub Actions CI/CD
│   ├── ISSUE_TEMPLATE/    # Issue templates
│   └── pull_request_template.md
└── [source code]
```

## Documentation Standards

### For Issues
- Use issue templates in `.github/ISSUE_TEMPLATE/`
- Include relevant details (Windows version, app version, steps to reproduce)
- Search existing issues before creating new ones

### For Pull Requests
- Use pull request template
- Reference related issues
- Describe what changed and why
- Include testing notes

### For Commits
- Use descriptive messages
- Reference issues with #123
- Keep commits focused and atomic

## Keeping Documentation Updated

**Important**: Documentation should stay current with code changes.

When making changes:
1. Update relevant `.md` files
2. Update comments in code
3. Update examples if behavior changed
4. Create GitHub issue if documentation is missing

## Contributing Documentation

Found an error or missing documentation? Great! You can:

1. **Email**: support@example.com
2. **GitHub Issue**: Create an issue with label `documentation`
3. **Pull Request**: Submit a PR with improvements

---

**Last Updated**: July 2024  
**Version**: 0.1.0

**Questions?** See the relevant section above or email support@example.com
