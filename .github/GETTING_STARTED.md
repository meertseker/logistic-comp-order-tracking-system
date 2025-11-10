# Getting Started with CI/CD

Welcome! This guide will help you get started with the automated macOS build system.

## ✅ Setup is Complete!

The CI/CD system has been configured and validated. You're ready to start using it!

## 🚀 Your First Build

### Option 1: Automatic Build (Recommended)

Simply push your code to trigger a build:

```bash
# Make sure you're on main or develop branch
git status

# Add and commit your changes
git add .
git commit -m "Your commit message"

# Push to trigger the build
git push origin main
```

**What happens next:**
1. GitHub Actions automatically starts the workflow
2. A macOS runner builds your app (~5-10 minutes)
3. DMG files are created for both Intel and Apple Silicon
4. Artifacts are uploaded and ready to download

### Option 2: Manual Trigger

1. Go to your repository: https://github.com/meertseker/logistic-comp-order-tracking-system
2. Click the **Actions** tab
3. Select **Build macOS App** workflow
4. Click **Run workflow** button
5. Select the branch and click **Run workflow**

## 📥 Downloading Your Build

After the workflow completes:

1. Go to **Actions** tab
2. Click on the workflow run (green ✓)
3. Scroll down to **Artifacts** section
4. Click on the artifact name to download (e.g., `macos-dmg-latest`)
5. Extract the ZIP file
6. You'll find the DMG files inside!

**Artifact Names:**
- `macos-dmg-<commit-sha>` - Build for specific commit
- `macos-dmg-latest` - Latest build from main branch

## 🧪 Testing Your Build

### On macOS

1. Download the DMG file
2. Double-click to mount the DMG
3. Drag the app to Applications folder
4. Right-click the app → Select **Open** (first time only)
5. Click **Open** in the security dialog

**Note:** The build is not signed, so you'll see a security warning. This is expected for CI builds.

### On Intel Mac
Use: `Sekersoft-1.0.0-x64.dmg`

### On Apple Silicon Mac (M1/M2/M3)
Use: `Sekersoft-1.0.0-arm64.dmg`

## 📊 Monitoring Builds

### View Build Status

**Live Workflow Runs:**
https://github.com/meertseker/logistic-comp-order-tracking-system/actions

**Build Badges in README:**
- Green ✓ = Passing
- Red ✗ = Failed
- Yellow ○ = In progress

### Check Build Logs

1. Go to Actions tab
2. Click on a workflow run
3. Click on the job name (e.g., "build-macos")
4. Expand steps to see detailed logs

## 🎯 Creating Your First Release

When you're ready to create a release:

```bash
# Tag your version (use semantic versioning)
git tag v1.0.0

# Push the tag
git push origin v1.0.0
```

**This will:**
1. Trigger the release workflow
2. Build both Windows and macOS installers
3. Create a draft GitHub Release
4. Attach all installers to the release

**Then:**
1. Go to **Releases** tab on GitHub
2. Find the draft release
3. Review the artifacts
4. Edit release notes if needed
5. Click **Publish release** when ready

## 🔄 Daily Workflow

### During Development

```bash
# Work on your feature
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to your branch
git push origin feature/my-feature

# Create a PR to main
# When merged, automatic build will trigger
```

### For Testing

```bash
# Push to develop branch for testing builds
git checkout develop
git merge feature/my-feature
git push origin develop

# Download artifact from Actions
# Test the DMG
# If good, merge to main
```

### For Release

```bash
# Update version in package.json
# Commit the version bump
git add package.json
git commit -m "Bump version to 1.0.0"

# Tag and release
git tag v1.0.0
git push origin main
git push origin v1.0.0

# Draft release created automatically
# Review and publish
```

## 💡 Tips & Tricks

### Save GitHub Actions Minutes

- **Test locally first**: Run `npm run build:mac` before pushing
- **Use manual dispatch**: Trigger builds manually when needed
- **Branch strategy**: Use `develop` for testing, `main` for stable builds

### Faster Debugging

- **Check validation**: Run `npm run validate:ci` before pushing
- **Review logs**: Always check the workflow logs if build fails
- **Test locally**: Most issues can be caught with local builds

### Best Practices

1. **Version your releases**: Use semantic versioning (v1.0.0, v1.1.0, etc.)
2. **Draft releases**: Always review before publishing
3. **Test artifacts**: Download and test before sharing
4. **Document changes**: Write clear commit messages

## 📚 Quick Reference

### Commands

```bash
# Validate setup
npm run validate:ci

# Local build (macOS)
npm run build:mac

# Local build (Windows)
npm run build:win-installer

# View Git tags
git tag -l

# Delete a tag (if needed)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### URLs

- **Repository**: https://github.com/meertseker/logistic-comp-order-tracking-system
- **Actions**: https://github.com/meertseker/logistic-comp-order-tracking-system/actions
- **Releases**: https://github.com/meertseker/logistic-comp-order-tracking-system/releases

### Documentation

- [Complete Guide](../docs/setup/MACOS_CI_BUILD.md)
- [Quick Reference](../docs/setup/CI_CD_QUICKSTART.md)
- [Workflow Details](README.md)
- [Visual Diagram](WORKFLOW_DIAGRAM.md)

## ❓ Common Questions

### Q: How long does a build take?
**A:** Typically 5-10 minutes for macOS, 3-7 minutes for Windows.

### Q: How do I know if the build succeeded?
**A:** Check the Actions tab or look at the badges in README. Green ✓ means success.

### Q: Can I cancel a build?
**A:** Yes! Go to Actions → click the running workflow → click "Cancel workflow".

### Q: Where are the artifacts stored?
**A:** In GitHub Actions artifacts storage, downloadable from the Actions tab.

### Q: How long are artifacts kept?
**A:** 30 days for development builds, 90 days for latest/release builds.

### Q: What if the build fails?
**A:** Check the workflow logs for errors. Common issues:
  - Native dependency compilation
  - Missing files
  - Syntax errors
  Run `npm run validate:ci` locally to check.

### Q: Can I build without pushing?
**A:** Yes! Use `npm run build:mac` locally, or trigger manually via Actions UI.

### Q: How do I update the app version?
**A:** Edit `version` in `package.json`, commit, and create a new tag.

## 🐛 Troubleshooting

### Build Fails Immediately
- Check workflow syntax (YAML)
- Verify all required files exist
- Run `npm run validate:ci`

### Build Fails During Dependencies
- Check package.json dependencies
- Native modules may need rebuilding
- See workflow logs for specific error

### Artifacts Not Generated
- Check `release/` directory in logs
- Verify electron-builder command ran
- Check for build errors in previous steps

### Can't Download Artifact
- Wait for workflow to complete
- Check artifact retention period
- Verify you have repository access

## 🎓 Next Steps

Now that you're set up:

1. ✅ **Test the system**: Make a small change and push
2. ✅ **Download & test**: Get the artifact and test on a Mac
3. ✅ **Create a release**: Tag v0.1.0 and test the release workflow
4. 📋 **Plan signing**: Review docs/setup/MACOS_CI_BUILD.md for code signing
5. 🎨 **Add icons**: Create custom app icons (see SETUP_SUMMARY.md)
6. 📝 **Update docs**: Document any project-specific build steps

## 🎉 You're All Set!

The CI/CD system is ready to use. Every push to main/develop will automatically build and package your app for macOS.

**Need help?** Check the full documentation:
- [MACOS_CI_BUILD.md](../docs/setup/MACOS_CI_BUILD.md) - Complete guide
- [CI_CD_QUICKSTART.md](../docs/setup/CI_CD_QUICKSTART.md) - Quick commands
- [WORKFLOW_DIAGRAM.md](WORKFLOW_DIAGRAM.md) - Visual overview

Happy building! 🚀

