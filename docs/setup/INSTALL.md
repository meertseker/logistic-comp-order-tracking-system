# Installation Guide - Sekersoft

## Mac Installation

### Option 1: DMG Installer (Recommended)

1. Download `Seymen-Transport-1.0.0.dmg` from releases
2. Double-click the DMG file
3. Drag the app to Applications folder
4. Open Applications folder
5. Right-click "Sekersoft" and select "Open"
6. Click "Open" when prompted (first time only)

### Option 2: Build from Source

#### Prerequisites

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version  # Should be v18+ or higher
npm --version   # Should be v9+ or higher
```

#### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/seymentransport.git
cd seymentransport

# 2. Install dependencies
npm install

# 3. Rebuild native modules
npm run rebuild

# 4. Run in development mode (to test)
npm run electron:dev

# 5. Build for production
npm run build:mac

# 6. Find the installer
# The .dmg file will be in the 'release' folder
open release
```

## First Time Setup

1. **Launch the App**
   - Open Sekersoft from Applications

2. **Database Initialization**
   - Database will be created automatically on first launch
   - Location: `~/Library/Application Support/seymen-transport/`

3. **Create Your First Order**
   - Click "Yeni Sipariş" button
   - Fill in the order details
   - Click "Sipariş Oluştur"

## Data Location

All app data is stored locally:

```
~/Library/Application Support/seymen-transport/
├── transport.db          # Main database
├── transport.db-shm      # SQLite shared memory
├── transport.db-wal      # SQLite write-ahead log
└── uploads/              # Invoice files
```

## Backup Your Data

### Manual Backup

```bash
# Create a backup
cp -r ~/Library/Application\ Support/seymen-transport ~/Desktop/seymen-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Stop the app first, then:
cp -r ~/Desktop/seymen-backup-YYYYMMDD ~/Library/Application\ Support/seymen-transport
```

## Troubleshooting

### App Won't Open

**Issue**: "App is damaged and can't be opened"

**Solution**:
```bash
# Remove quarantine attribute
sudo xattr -rd com.apple.quarantine /Applications/Seymen\ Transport.app
```

### Database Locked

**Issue**: "Database is locked"

**Solution**:
1. Close all instances of the app
2. Delete the `-shm` and `-wal` files
3. Restart the app

### Missing Dependencies

**Issue**: Build fails with native module errors

**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules
npm install
npm run rebuild
```

### Port Already in Use (Development)

**Issue**: Port 5173 is already in use

**Solution**:
```bash
# Find and kill the process
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

## Uninstallation

1. **Remove the App**
   ```bash
   rm -rf /Applications/Seymen\ Transport.app
   ```

2. **Remove Data (Optional)**
   ```bash
   rm -rf ~/Library/Application\ Support/seymen-transport
   ```

3. **Remove Preferences (Optional)**
   ```bash
   rm -rf ~/Library/Preferences/com.seymen.transport.plist
   ```

## System Requirements

- **OS**: macOS 10.15 (Catalina) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Display**: 1280x720 minimum resolution

## Security & Privacy

The app requires the following permissions:

- **Files and Folders**: To save invoice uploads
- **Network**: None (app works fully offline)

To grant permissions:
1. Open System Preferences
2. Go to Security & Privacy > Privacy
3. Select "Files and Folders"
4. Enable access for Sekersoft

## Updates

### Checking for Updates

Currently, updates need to be installed manually:

1. Download the latest DMG
2. Replace the app in Applications folder
3. Your data will be preserved

### Auto-Update (Coming Soon)

Future versions will include automatic update checking.

## Getting Help

- **Documentation**: See README.md
- **Issues**: Open an issue on GitHub
- **Email**: support@seymentransport.com

## Development Mode

For developers:

```bash
# Start in development mode
npm run electron:dev

# The app will:
# - Auto-reload on code changes
# - Show DevTools
# - Connect to Vite dev server at http://localhost:5173
```

## Building for Distribution

```bash
# Build optimized production version
npm run build:mac

# The output will be:
# - release/Sekersoft-1.0.0.dmg
# - release/mac/Sekersoft.app
```

## Code Signing (For Distribution)

To distribute outside the Mac App Store:

1. **Get a Developer ID Certificate**
   - Join Apple Developer Program
   - Create a Developer ID Application certificate

2. **Sign the App**
   ```bash
   # Add to package.json build config:
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```

3. **Notarize the App**
   ```bash
   # Add notarization credentials
   export APPLE_ID="your@email.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   export APPLE_TEAM_ID="YOUR_TEAM_ID"
   
   npm run build:mac
   ```

---

**Questions?** Check the README.md or contact support.

