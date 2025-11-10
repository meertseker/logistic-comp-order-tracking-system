# macOS CI Build Setup

This document explains how to build macOS installers (.dmg) for the Sekersoft Transportation Management System using GitHub Actions.

## Overview

The project uses GitHub Actions with macOS runners to automatically build `.dmg` installers for macOS. The workflow is triggered on every push to main/develop branches and can also be triggered manually.

## Architecture

- **Build Architecture**: Universal (x64 + arm64)
  - `x64`: Intel-based Macs
  - `arm64`: Apple Silicon (M1/M2/M3) Macs
- **Output Format**: DMG (macOS Disk Image)
- **Build Tool**: electron-builder
- **CI Platform**: GitHub Actions
- **Runner**: macos-latest

## Workflow Configuration

The workflow file is located at `.github/workflows/build-macos.yml`

### Trigger Events

The workflow runs on:
1. **Push** to `main` or `develop` branches
2. **Pull requests** targeting `main`
3. **Manual dispatch** (via GitHub Actions UI)

### Build Steps

1. **Checkout**: Clone the repository
2. **Setup Node.js**: Install Node.js 20 with npm caching
3. **Install Dependencies**: Run `npm ci` for clean install
4. **Build Renderer**: Build the React frontend with Vite
5. **Build Electron**: Compile Electron main process
6. **Build macOS DMG**: Create universal DMG for both architectures
7. **Upload Artifacts**: Save DMG files for download

### Code Signing

**Important**: Code signing is currently disabled for CI builds using:

```yaml
env:
  CSC_IDENTITY_AUTO_DISCOVERY: false
```

This means the built app will not be notarized or signed. Users will need to allow installation from "unidentified developers" in macOS System Preferences.

#### To Enable Code Signing (Production)

You'll need to:

1. **Create Apple Developer Account** ($99/year)
2. **Generate Certificates**:
   - Developer ID Application certificate
   - Developer ID Installer certificate
3. **Add GitHub Secrets**:
   ```yaml
   CSC_LINK: <base64-encoded .p12 certificate>
   CSC_KEY_PASSWORD: <certificate password>
   APPLE_ID: <your Apple ID>
   APPLE_APP_SPECIFIC_PASSWORD: <app-specific password>
   APPLE_TEAM_ID: <your team ID>
   ```
4. **Update workflow** to enable signing:
   ```yaml
   - name: Build macOS DMG
     run: electron-builder --mac dmg --x64 --arm64
     env:
       CSC_LINK: ${{ secrets.CSC_LINK }}
       CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
       APPLE_ID: ${{ secrets.APPLE_ID }}
       APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
       APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
   ```

## Artifact Storage

Built DMG files are stored as GitHub Actions artifacts:

- **Commit-specific artifact**: `macos-dmg-<commit-sha>`
  - Retention: 30 days
  - Available for all builds

- **Latest artifact** (main branch only): `macos-dmg-latest`
  - Retention: 90 days
  - Only from main branch builds

### Downloading Artifacts

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select the workflow run
4. Scroll down to **Artifacts** section
5. Click to download the DMG file

## Build Configuration

The macOS build configuration in `package.json`:

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ],
    "category": "public.app-category.business",
    "artifactName": "${productName}-${version}-${arch}.${ext}",
    "hardenedRuntime": false,
    "gatekeeperAssess": false
  },
  "dmg": {
    "title": "${productName} ${version}",
    "contents": [
      { "x": 130, "y": 220 },
      { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
    ],
    "window": {
      "width": 540,
      "height": 380
    }
  }
}
```

### Output Files

The build produces:
- `Sekersoft-1.0.0-x64.dmg` - Intel Mac version
- `Sekersoft-1.0.0-arm64.dmg` - Apple Silicon version

Both are universal builds that will work on their respective architectures.

## Local macOS Build

To build locally on a Mac:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Build macOS DMG
npm run build:mac

# Or build manually
electron-builder --mac dmg --x64 --arm64
```

Output will be in the `release/` directory.

## Native Dependencies

The project uses `better-sqlite3`, which requires native compilation. The GitHub Actions workflow handles this automatically using the macOS runner's native build tools.

If you add more native dependencies, ensure they're compatible with both x64 and arm64 architectures.

## Icon Files

Currently, the build doesn't include custom icons. To add macOS icons:

1. Create a 1024x1024 PNG icon
2. Convert to ICNS format:
   ```bash
   # On macOS
   mkdir icon.iconset
   # Create various sizes (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
   # with @2x retina versions
   iconutil -c icns icon.iconset -o icon.icns
   ```
3. Place `icon.icns` in `build/` directory
4. Update `package.json`:
   ```json
   {
     "mac": {
       "icon": "build/icon.icns"
     }
   }
   ```

## Troubleshooting

### Build Fails on Native Dependencies

If the build fails due to native dependencies:

```yaml
- name: Install dependencies
  run: |
    npm ci
    npm rebuild better-sqlite3 --build-from-source
```

### DMG Won't Open on macOS

If users can't open the DMG due to security settings:

1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

Or via Terminal:
```bash
xattr -cr /Applications/Sekersoft.app
```

### Missing Architecture Support

If the build only produces one architecture:

- Check that electron-builder command includes both `--x64 --arm64`
- Ensure `package.json` mac target includes both architectures
- Verify the runner is `macos-latest` (supports universal builds)

## GitHub Actions Costs

- GitHub provides **2,000 free macOS minutes/month** for private repos
- Public repos get **unlimited** macOS minutes
- macOS runners use **10x minutes** (1 minute = 10 billable minutes)
- A typical build takes ~5-10 minutes = 50-100 billable minutes

**Tip**: Use `workflow_dispatch` for manual triggers to save minutes during development.

## Manual Workflow Trigger

To manually trigger a build:

1. Go to **Actions** tab on GitHub
2. Select **Build macOS App** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Next Steps

1. **Test the workflow**: Push to trigger a build
2. **Download and test**: Test the DMG on both Intel and Apple Silicon Macs
3. **Add signing**: Set up code signing for production releases
4. **Add icons**: Create and add macOS icon files
5. **Optimize**: Adjust retention days based on needs
6. **Add release automation**: Integrate with GitHub Releases for version tags

## Additional Resources

- [electron-builder macOS Documentation](https://www.electron.build/configuration/mac)
- [GitHub Actions macOS Runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources)
- [Apple Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [Notarizing macOS Apps](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)

