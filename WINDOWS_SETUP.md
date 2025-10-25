# Windows Development Setup

Since you're developing on Windows but the app is designed for Mac, here are your options:

## Option 1: Development on Windows ✅ (Recommended)

You can develop and test the app on Windows! The app will work in development mode.

### Steps:

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Build Electron Files**
   ```powershell
   node scripts/watch-electron.js
   ```
   
   Leave this running and open a new terminal.

3. **Start Vite Dev Server** (in new terminal)
   ```powershell
   npm run dev
   ```
   
   Leave this running and open another new terminal.

4. **Start Electron** (in third terminal)
   ```powershell
   npx electron .
   ```

### Alternative: Use the Combined Script

Or just run:
```powershell
npm run electron:dev
```

If this fails, use the manual 3-terminal approach above.

## Option 2: Build for Windows

If you want to create a Windows installer:

### Update package.json

Add Windows build target:

```json
"build": {
  "appId": "com.seymen.transport",
  "productName": "Seymen Transport",
  "directories": {
    "output": "release"
  },
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "mac": {
    "target": ["dmg"],
    "category": "public.app-category.business",
    "icon": "build/icon.icns"
  }
}
```

### Build for Windows

```powershell
npm run build
electron-builder --win
```

This creates a Windows `.exe` installer in the `release` folder.

## Option 3: Build Mac Installer from Windows

You'll need either:

1. **Access to a Mac** - Transfer code and run `npm run build:mac`
2. **GitHub Actions** - Set up CI/CD to build on Mac runners
3. **Cloud Mac** - Use services like MacInCloud, MacStadium

## Common Windows Issues

### Issue: "better-sqlite3 not found"

```powershell
npm run rebuild
```

### Issue: "Permission denied"

Run PowerShell as Administrator.

### Issue: "concurrently not working"

Use the 3-terminal manual approach (see Option 1 above).

### Issue: Scripts won't run

Enable scripts in PowerShell:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Recommended Windows Workflow

1. **Develop on Windows** using `npm run electron:dev`
2. **Test thoroughly** on Windows
3. **Build for Mac** using one of these:
   - Transfer to Mac computer
   - Use GitHub Actions
   - Use cloud Mac service

## Testing Without Building

You can fully test all features on Windows in development mode:

```powershell
# Terminal 1
node scripts/watch-electron.js

# Terminal 2  
npm run dev

# Terminal 3
npx electron .
```

All features work the same on Windows during development!

## Database Location on Windows

Data is stored at:
```
C:\Users\YourName\AppData\Roaming\seymen-transport\
```

## Next Steps

1. Get the app running on Windows first
2. Test all features
3. Decide if you need Windows installer or Mac installer
4. Contact me if you need help adding Windows build support

---

**Questions?** Open an issue or check README.md


