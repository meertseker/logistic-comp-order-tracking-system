# Demo License Testing Guide

This guide helps you test the demo license functionality.

## Quick Test Checklist

### 1. Generate a Demo License

```bash
# Get your hardware fingerprint first by running the app (it will show on activation screen)
# Then generate a demo license:
node scripts/generate-license-advanced.js "<your-hw-fingerprint>" --demo
```

### 2. Activate Demo License

1. Open the application
2. Copy the Hardware Fingerprint shown
3. Generate a demo license using the command above
4. Enter the generated license key
5. Fill in company name and email
6. Click "Activate"
7. ✓ Application should open normally

### 3. Verify Demo Status

1. Navigate to **Settings > License** tab
2. Verify you see:
   - ✓ License Type: "Demo Lisans (Süreli)"
   - ✓ Expiration Date (60 days from now)
   - ✓ Days Remaining (should be ~60)
   - ✓ Company Name and Email you entered

### 4. Test Warning Banner

To test the warning banner without waiting 53 days:

**Option A: Modify Expiration Date (Development)**
```typescript
// Temporarily in advanced-license-manager.ts:
// Change line in activateLicense method:
const expiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days instead of 60
```

**Option B: Manual Database Edit**
1. Close the application
2. Open `%APPDATA%/Sekersoft/transport.db` in a SQLite editor
3. Note: License file is encrypted, so this won't work for license.dat
4. Restart and regenerate with short duration: `--days 5`

### 5. Test Expiration Warning

When days remaining < 7:
1. ✓ Warning banner appears at top of application
2. ✓ Banner shows correct days remaining
3. ✓ Banner is dismissible (remember dismissal for session)
4. ✓ "Upgrade to Full License" button navigates to settings
5. ✓ License tab shows warning message

### 6. Test Expired Demo

Generate a license that expires immediately:
```bash
node scripts/generate-license-advanced.js "<hw-fingerprint>" --days 0
```

Then:
1. ✓ Activation screen appears
2. ✓ Shows "Demo License Expired" message
3. ✓ Shows expiration date
4. ✓ Activation form still visible
5. ✓ Can enter new key immediately
6. ✓ All data preserved after reactivation

### 7. Test Full License

```bash
# Generate perpetual license
node scripts/generate-license-advanced.js "<hw-fingerprint>"
# or explicitly:
node scripts/generate-license-advanced.js "<hw-fingerprint>" --perpetual
```

Then:
1. ✓ Activate successfully
2. ✓ No warning banner shows
3. ✓ License tab shows "Tam Lisans (Süresiz)"
4. ✓ No expiration date shown
5. ✓ Status is green

### 8. Test Upgrade Path (Demo → Full)

1. Activate with demo license
2. Use the app (create some orders/data)
3. Wait for warning or expire the demo
4. Generate full license with **same Hardware Fingerprint**
5. Enter new full license key
6. ✓ All data still intact
7. ✓ License now shows as "Full License"
8. ✓ No more warnings

## Color Coding Tests

Verify correct colors at each threshold:

| Days Remaining | Expected Color | Location |
|---------------|---------------|----------|
| > 30 days | Green | Status badge, days counter |
| 8-30 days | Yellow | Status badge, days counter |
| 3-7 days | Orange | Warning banner, status badge |
| < 3 days | Red | Warning banner (critical), status badge |
| Expired | Red | Expiration message |

## Edge Cases to Test

### 1. Hardware Change
- Generate license for one fingerprint
- Try activating on different machine
- ✓ Should fail with "not valid for this system"

### 2. Invalid License Key Format
- Enter "1234-5678-9012-3456" (wrong algorithm)
- ✓ Should show "Invalid license key"

### 3. Expired Demo Reactivation
- Activate demo, let it expire
- Try activating same expired key again
- ✓ Should fail (already expired)
- Generate new key, activate successfully
- ✓ New license should work

### 4. Tamper Detection
- Activate license
- Close app
- Try to modify `license.dat` file directly
- Reopen app
- ✓ Should detect tampering and show activation screen

### 5. Backward Compatibility
- If you have an old license (no expiration):
- ✓ Should still work
- ✓ Should show as "Full License"
- ✓ No expiration date

## Manual Testing Scenarios

### Scenario 1: New Customer Trial
```
1. Customer installs app
2. Sees activation screen
3. Sends you Hardware Fingerprint
4. You generate --demo license
5. Customer activates
6. Customer uses for 50 days
7. Warning appears at day 53
8. Customer purchases
9. You generate full license
10. Customer activates full license
11. All data preserved, no more warnings
```

### Scenario 2: Immediate Purchase
```
1. Customer installs app
2. Sends Hardware Fingerprint immediately
3. You generate full license (no --demo flag)
4. Customer activates
5. Never sees warnings
6. Uses indefinitely
```

### Scenario 3: Trial Extension
```
1. Customer has active 60-day demo (30 days used)
2. Requests extension
3. You generate new --days 90 license
4. Customer activates (overwrites old license)
5. Now has 90 fresh days
```

## Automated Testing (Future)

### Unit Tests Needed
```typescript
describe('LicenseManager', () => {
  it('should calculate days remaining correctly')
  it('should detect expired licenses')
  it('should identify demo vs full licenses')
  it('should reject tampered licenses')
})
```

### Integration Tests Needed
```typescript
describe('License Activation Flow', () => {
  it('should activate demo license successfully')
  it('should show warning banner when < 7 days')
  it('should show activation screen when expired')
  it('should upgrade from demo to full')
})
```

## Performance Checks

- ✓ License validation < 100ms
- ✓ No UI lag when checking expiration
- ✓ Warning banner doesn't re-render constantly
- ✓ Periodic validation doesn't impact performance

## Security Checks

- ✓ License file is encrypted
- ✓ Cannot read license.dat in text editor
- ✓ Modifying license.dat triggers tamper detection
- ✓ License tied to hardware (cannot copy to another PC)
- ✓ Expiration date cannot be manipulated

## Known Issues / Limitations

1. **Date-based expiration**: Relies on system clock (user could change it)
   - Mitigation: Periodic online validation (future feature)
   
2. **Hardware changes**: Major hardware upgrade requires new license
   - Mitigation: Document this clearly to customers
   
3. **VM detection**: Currently logged but not blocked
   - Current: Warns in console
   - Future: Could block VMs if needed

## Success Criteria

All these should pass:
- [ ] Can generate demo licenses
- [ ] Can generate full licenses
- [ ] Demo activates and shows correct expiration
- [ ] Full license shows no expiration
- [ ] Warning appears at correct thresholds
- [ ] Expired demo shows proper message
- [ ] Can upgrade demo to full
- [ ] All data preserved during upgrade
- [ ] Settings page shows all license info
- [ ] Colors match urgency levels
- [ ] Tamper detection works
- [ ] Backward compatible with old licenses

## Troubleshooting Tests

If something doesn't work:

1. **Check Console Logs**
   - Open DevTools (Ctrl+Shift+I)
   - Look for license-related errors

2. **Verify License File**
   - Check `%APPDATA%/Sekersoft/license.dat` exists
   - Size should be > 0 bytes

3. **Check Database**
   - Settings should load without errors
   - License info appears in Settings tab

4. **Test Fresh Install**
   - Delete `%APPDATA%/Sekersoft/` folder
   - Reinstall and test activation

## Reporting Issues

When reporting license issues, include:
1. Hardware Fingerprint
2. License key used
3. License type (demo/full)
4. Days remaining (if demo)
5. Error message (if any)
6. Console logs
7. Steps to reproduce
