# How to Get Error Logs from GitHub Actions

I need the specific error message to fix the build issue. Please follow these steps:

## 📋 Steps to Get the Error Message

### 1. Go to GitHub Actions
Visit: https://github.com/meertseker/logistic-comp-order-tracking-system/actions

### 2. Click on the Failed Workflow Run
- Look for the run with a red ❌ 
- It should be titled "Build macOS App" or similar
- Click on it

### 3. Click on the Failed Job
- You'll see a job named "build-macos" with a red ❌
- Click on it

### 4. Find the Failed Step
- Expand each step to find which one failed
- Look for steps with red ❌ marks
- Common failing steps:
  - "Install dependencies"
  - "Rebuild native dependencies"
  - "Build Renderer"
  - "Build Electron"
  - "Build macOS DMG"

### 5. Copy the Error Message
- Click on the failed step
- Look for lines with:
  - `Error:`
  - `Failed:`
  - `error` (in red)
  - Stack traces
- Copy the **full error message** including:
  - The command that failed
  - The error text
  - Any stack trace
  - 5-10 lines before and after the error

### 6. Share With Me
Paste the error message here so I can diagnose and fix it.

---

## 🔍 What I'm Looking For

### Example Error Messages

**Dependency Error:**
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /Users/runner/work/.../package.json
npm ERR! errno -2
npm ERR! enoent ENOENT: no such file or directory
```

**Build Error:**
```
Error: Cannot find module 'electron'
  at /Users/runner/work/...
  at Module._compile
```

**electron-builder Error:**
```
Error: Exit code: ENOENT. 
spawn /usr/bin/python ENOENT
```

**File Not Found Error:**
```
Cannot find output directory dist/ or dist-electron/
```

---

## 🚀 Quick Fix - Try Building Just x64 First

While we diagnose, try this simpler approach:

### Option A: Build Only Intel (x64)
Edit `.github/workflows/build-macos.yml` line 49:

```yaml
# Change this:
run: npx electron-builder --mac dmg --x64 --arm64 --config.compression=store

# To this:
run: npx electron-builder --mac dmg --x64
```

### Option B: Use npm script instead
Edit `.github/workflows/build-macos.yml` line 49:

```yaml
# Change from:
run: npx electron-builder --mac dmg --x64 --arm64 --config.compression=store

# To:
run: npm run build:mac
```

---

## 📊 Viewing Logs - Screenshots Guide

If you're not sure where to find the logs:

### Step-by-Step Visual Guide

1. **Actions Tab**
   ```
   Repository → Actions (top navigation)
   ```

2. **Workflow List**
   ```
   All workflows → "Build macOS App" (with red X)
   ```

3. **Run Details**
   ```
   Shows all steps in the workflow
   Click on "build-macos" job
   ```

4. **Step Details**
   ```
   Expand each step to see output
   Red X = failed step
   Look for error messages in red text
   ```

5. **Raw Logs**
   ```
   Click "View raw logs" (top right)
   Can download entire log file
   Search for "error" or "failed"
   ```

---

## 🔧 While You Get Logs - I've Added Debugging

I've updated the workflow to include:

### New Debugging Steps:
1. ✅ Verify build output - checks if dist/ directories exist
2. ✅ Enable DEBUG mode for electron-builder
3. ✅ Better error messages if release/ not created
4. ✅ Upload logs on failure

### This Will Help Show:
- Whether `dist/` directory is created
- Whether `dist-electron/` directory is created
- Detailed electron-builder logs
- Where exactly the build process fails

---

## 💡 Common Issues & Quick Checks

### Issue 1: Python Not Found
**Error contains:** `python ENOENT` or `gyp`

**Quick Fix:** Add to workflow before rebuild:
```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
```

### Issue 2: Build Files Missing
**Error contains:** `Cannot find` or `ENOENT dist`

**Quick Fix:** The "Verify build output" step will show this now

### Issue 3: Permissions
**Error contains:** `EACCES` or `permission denied`

**Quick Fix:** Add before build:
```yaml
- name: Fix permissions
  run: chmod +x scripts/*.js
```

### Issue 4: Memory Issues
**Error contains:** `heap out of memory` or `JavaScript heap`

**Quick Fix:** Add to Build macOS DMG step:
```yaml
env:
  NODE_OPTIONS: --max-old-space-size=4096
```

---

## 📝 Information to Provide

Please share:

1. **The exact error message** (copy/paste from logs)
2. **Which step failed?** (step name)
3. **Any warnings** (yellow text before error)
4. **Output from "Verify build output" step** (if it ran)

With this information, I can provide an exact fix!

---

## 🎯 Next Steps

1. ✅ Commit current changes (with debugging)
2. ✅ Push to GitHub
3. ✅ Wait for build (will have more info now)
4. ✅ Get the error message using steps above
5. ✅ Share error with me
6. ✅ I'll provide exact fix

**Commit these changes now:**

```bash
git add .github/workflows/build-macos.yml
git add GET_ERROR_LOGS.md
git commit -m "debug: Add verbose logging and error handling to CI"
git push origin main
```

Then watch the build and get me the error details! 🔍

