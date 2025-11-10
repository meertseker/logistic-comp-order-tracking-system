# GitHub Actions Workflows

This directory contains automated CI/CD workflows for building the Sekersoft Transportation Management System.

## Workflows

### 1. Build macOS App (`build-macos.yml`)

**Purpose**: Automatically build macOS .dmg installers for testing and development

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual dispatch

**Output**:
- Universal DMG files (x64 + arm64)
- Artifacts stored for 30-90 days

**Use Case**: Regular development builds for testing on macOS

### 2. Release Build (`release-build.yml`)

**Purpose**: Build production-ready installers for both macOS and Windows

**Triggers**:
- Git tags starting with `v` (e.g., `v1.0.0`, `v1.2.3`)
- Manual dispatch with version input

**Output**:
- macOS: `.dmg` files (Intel + Apple Silicon)
- Windows: `.exe` installer
- Automatically creates GitHub Release (draft)

**Use Case**: Production releases

## Usage Examples

### Trigger Development Build (macOS)

```bash
# Simply push to main or develop
git push origin main
```

The build will automatically start and artifacts will be available in the Actions tab.

### Create a Release Build

```bash
# Tag your commit
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. Build both macOS and Windows installers
2. Create a draft GitHub Release
3. Attach all installers to the release
4. Generate release notes

### Manual Build Trigger

1. Go to **Actions** tab on GitHub
2. Select the workflow
3. Click **Run workflow**
4. Select branch/version
5. Click **Run workflow** button

## Artifact Downloads

After a successful build:

1. Go to **Actions** tab
2. Click on the workflow run
3. Scroll to **Artifacts** section
4. Download the DMG/EXE files

## Architecture Support

### macOS
- **x64**: Intel-based Macs (2006-2020)
- **arm64**: Apple Silicon Macs (M1/M2/M3, 2020+)

### Windows
- **x64**: 64-bit Windows systems

## Code Signing Status

⚠️ **Current Status**: Code signing is **disabled** for CI builds

**Impact**:
- macOS users will see "unidentified developer" warning
- Windows users may see SmartScreen warnings
- Apps are not notarized or signed

**To Enable**: See `docs/setup/MACOS_CI_BUILD.md` for setup instructions

## Build Times & Costs

| Platform | Build Time | Billable Minutes |
|----------|------------|------------------|
| macOS    | 5-10 min   | 50-100 min       |
| Windows  | 3-7 min    | 3-7 min          |

**GitHub Free Tier**:
- 2,000 macOS minutes/month (private repos)
- 2,000 Windows minutes/month (private repos)
- Unlimited for public repos

## Maintenance

### Updating Node.js Version

Edit the workflow files:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

### Adjusting Artifact Retention

```yaml
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # Change this (max: 90)
```

### Adding New Platforms

To add Linux support:

```yaml
build-linux:
  runs-on: ubuntu-latest
  steps:
    # ... similar steps
    - name: Build Linux AppImage
      run: electron-builder --linux AppImage
```

## Troubleshooting

### Build Fails: Native Dependencies

If native modules fail to compile:

```yaml
- name: Rebuild Native Modules
  run: npm rebuild better-sqlite3 --build-from-source
```

### Build Fails: Out of Memory

Increase Node memory:

```yaml
- name: Build with More Memory
  run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Artifacts Not Uploading

Check the path matches your output:

```bash
- name: List Files
  run: ls -la release/
```

## Security Considerations

1. **Secrets**: Never commit certificates or passwords
2. **Code Signing**: Required for production distribution
3. **Dependencies**: Use `npm ci` for reproducible builds
4. **Artifacts**: Set appropriate retention periods

## Documentation

For detailed information:
- [macOS CI Build Guide](../docs/setup/MACOS_CI_BUILD.md)
- [Windows Installer Build](../docs/setup/WINDOWS_INSTALLER_BUILD.md)

## Support

For issues with CI/CD:
1. Check workflow logs in Actions tab
2. Review documentation in `docs/setup/`
3. Test builds locally first
4. Check GitHub Actions status page

## Next Steps

- [ ] Test the macOS workflow
- [ ] Set up code signing certificates
- [ ] Test release workflow with tags
- [ ] Add custom app icons
- [ ] Configure automatic updates
- [ ] Add build status badges to README

