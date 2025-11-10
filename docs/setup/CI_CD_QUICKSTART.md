# CI/CD Quick Start Guide

Quick reference for building Sekersoft on macOS using GitHub Actions.

## 🎯 Quick Commands

### Trigger macOS Build
```bash
git push origin main
# OR
git push origin develop
```
→ Artifacts available in ~5-10 minutes

### Create Release Build
```bash
# Tag your version
git tag v1.0.0
git push origin v1.0.0
```
→ Draft release created automatically

### Manual Trigger
Go to: **GitHub → Actions → Select Workflow → Run workflow**

## 📦 What Gets Built

### macOS (via `build-macos.yml`)
- ✅ Intel Macs (x64): `Sekersoft-1.0.0-x64.dmg`
- ✅ Apple Silicon (arm64): `Sekersoft-1.0.0-arm64.dmg`

### Release (via `release-build.yml`)
- ✅ macOS: Both x64 and arm64 DMGs
- ✅ Windows: x64 EXE installer

## 📥 Download Built Files

1. Go to **Actions** tab
2. Click the workflow run
3. Scroll to **Artifacts**
4. Click to download

**Artifact Names:**
- `macos-dmg-<commit-sha>` - Development builds
- `macos-dmg-latest` - Latest from main branch
- `macos-release-dmg` - Release builds
- `windows-release-installer` - Windows release

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/build-macos.yml` | macOS dev builds |
| `.github/workflows/release-build.yml` | Production releases |
| `package.json` → `build` section | electron-builder config |

## 🔧 Common Tasks

### Change Node Version
```yaml
# In workflow file
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # ← Change here
```

### Change Build Targets
```bash
# In workflow file, change:
electron-builder --mac dmg --x64 --arm64

# To (example - only Intel):
electron-builder --mac dmg --x64
```

### Adjust Retention Period
```yaml
# In workflow file
- uses: actions/upload-artifact@v4
  with:
    retention-days: 30  # ← Change here (max: 90)
```

## 🐛 Troubleshooting

### Build Fails: "No space left on device"
→ Increase runner disk space or clean release folder

### Build Fails: "better-sqlite3 not found"
→ Add rebuild step:
```yaml
- run: npm rebuild better-sqlite3 --build-from-source
```

### Artifacts Not Generated
→ Check `release/` directory listing in logs
→ Verify path in upload-artifact step

### Slow Builds
- Use `npm ci` instead of `npm install` ✅
- Enable npm cache ✅
- Reduce dependencies if possible

## 💰 GitHub Actions Costs

**Free Tier Limits:**
- 2,000 macOS minutes/month (private repos)
- macOS runners: 10x multiplier (1 min = 10 billable)

**Typical Build:**
- macOS: ~5-10 real minutes = 50-100 billable minutes
- Windows: ~3-7 real minutes = 3-7 billable minutes

**💡 Tip:** Use manual triggers during development to save minutes

## 🚀 Best Practices

### 1. Branch Strategy
```
main (protected)
  ├── develop (auto-build)
  └── feature/* (PR to main)
```

### 2. Version Tags
```bash
# Semantic Versioning
v1.0.0  # Major.Minor.Patch
v1.2.3  # Bug fixes
v2.0.0  # Breaking changes
```

### 3. Testing Before Push
```bash
# Test locally first
npm run build:mac
# Verify release/Sekersoft-*.dmg works
```

### 4. Draft Releases
- Always review draft releases before publishing
- Test downloaded artifacts
- Add release notes

## 📚 Full Documentation

- [macOS CI Build Guide](MACOS_CI_BUILD.md) - Complete setup
- [GitHub Workflows README](../../.github/README.md) - Workflow details
- [Windows Installer Build](WINDOWS_INSTALLER_BUILD.md) - Windows setup

## 🔐 Code Signing Setup (Production)

For production releases, you'll need:

1. **Apple Developer Account** ($99/year)
2. **Create Certificates**
   - Developer ID Application
   - Developer ID Installer

3. **Add GitHub Secrets:**
   ```
   CSC_LINK (base64 .p12 certificate)
   CSC_KEY_PASSWORD (cert password)
   APPLE_ID (your Apple ID)
   APPLE_APP_SPECIFIC_PASSWORD
   APPLE_TEAM_ID
   ```

4. **Update Workflow:**
   ```yaml
   env:
     CSC_LINK: ${{ secrets.CSC_LINK }}
     CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
     # Remove CSC_IDENTITY_AUTO_DISCOVERY: false
   ```

See [MACOS_CI_BUILD.md](MACOS_CI_BUILD.md#code-signing) for details.

## ✅ Checklist

Before pushing to CI:

- [ ] Code builds locally (`npm run build:mac`)
- [ ] Tests pass (`npm test`)
- [ ] Native dependencies work (`npm run rebuild`)
- [ ] Version updated in `package.json`
- [ ] Commit message is clear
- [ ] Branch is up to date

Before creating a release:

- [ ] All features tested
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version tag follows semantic versioning
- [ ] Draft release reviewed
- [ ] Installers tested on real devices

## 🔄 Workflow Status

Check workflow status:
```bash
# View in browser
open https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Or use GitHub CLI
gh workflow list
gh run list
gh run view <run-id>
```

## 🎨 Add Status Badges

Add to your README.md:

```markdown
[![Build macOS](https://github.com/USER/REPO/actions/workflows/build-macos.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/build-macos.yml)
```

Replace `USER/REPO` with your GitHub username and repository name.

## 🆘 Need Help?

1. Check workflow logs in Actions tab
2. Review [MACOS_CI_BUILD.md](MACOS_CI_BUILD.md)
3. Test locally before pushing
4. Check GitHub Actions documentation
5. Verify GitHub Actions is enabled for your repo

---

**Quick Links:**
- [Main Workflow](.github/workflows/build-macos.yml)
- [Release Workflow](.github/workflows/release-build.yml)
- [Package Config](../../package.json)
- [Full Documentation](MACOS_CI_BUILD.md)

