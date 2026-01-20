# Demo License System Guide

## Overview

The Sekersoft application now supports both **Demo Licenses** (time-limited) and **Full Licenses** (perpetual). This guide explains how to generate and manage both types of licenses.

## License Types

### 1. Demo License (2-Month Trial)
- **Duration**: 60 days (2 months) from activation date
- **Features**: Full access to all features
- **Expiration**: Requires new activation key after expiration
- **Use Case**: Trial periods, customer evaluation

### 2. Full License (Perpetual)
- **Duration**: Unlimited
- **Features**: Full access to all features
- **Expiration**: Never expires
- **Use Case**: Paid customers, permanent installations

## Generating License Keys

### Prerequisites
- Access to the customer's Hardware Fingerprint (provided when they try to activate)
- Node.js installed on your system

### Command Syntax

```bash
node scripts/generate-license-advanced.js <hardware-fingerprint> [options]
```

### Options

- **No flag** or `--perpetual`: Generate a full perpetual license (default)
- `--demo`: Generate a 60-day demo license
- `--days <number>`: Generate a custom duration license (in days)

### Examples

#### Generate a Full License (Perpetual)
```bash
node scripts/generate-license-advanced.js "abc123def456ghi789"
```

#### Generate a 2-Month Demo License
```bash
node scripts/generate-license-advanced.js "abc123def456ghi789" --demo
```

#### Generate a Custom 90-Day Trial
```bash
node scripts/generate-license-advanced.js "abc123def456ghi789" --days 90
```

### Output Example

```
======================================================================
🔐 SEKERSOFT - GELİŞMİŞ LİSANS ANAHTARI (PRO)
======================================================================

📋 Lisans Tipi:
   ⏱️  DEMO (60 Gün)

🖥️  Hardware Fingerprint:
   abc123def456ghi789

🎫 Lisans Anahtarı:
   A1B2-C3D4-E5F6-G7H8

⏰ Aktivasyon Tarihi:
   20 Ocak 2026 14:30

📅 Son Kullanım Tarihi:
   21 Mart 2026 14:30

⏳ Süre:
   60 gün
```

## Customer Activation Process

### Step 1: Customer Gets Hardware Fingerprint
1. Customer installs and opens the application
2. Activation screen appears automatically
3. Customer sees their unique **Hardware Fingerprint** (Machine ID)
4. Customer sends this ID to you (vendor)

### Step 2: Vendor Generates License
1. Use the customer's Hardware Fingerprint
2. Run the appropriate license generation command
3. Copy the generated license key

### Step 3: Customer Activates
1. Customer enters the license key in the activation screen
2. Customer enters company name and email
3. Customer clicks "Activate"
4. Application validates and activates the license

## License Expiration Behavior

### Demo License Warnings
- **30+ days remaining**: No warnings shown (green status)
- **8-30 days remaining**: Yellow status indicator
- **3-7 days remaining**: Orange warning banner appears
- **< 3 days remaining**: Red critical warning banner
- **Expired**: Activation screen shown with expired message

### What Happens When Demo Expires?
1. User sees "Demo License Expired" message
2. Activation form remains visible
3. User can enter a new activation key
4. **All data is preserved** - no data loss
5. Seamless transition to full license possible

### Full License
- No expiration warnings
- No time limits
- Permanent access

## UI Indicators

### License Status Display
The license status is shown in multiple places:

1. **Settings Page** (`Settings > License` tab)
   - License type (Demo/Full)
   - Company name and email
   - Activation date
   - Expiration date (for demos)
   - Days remaining (for demos)

2. **Warning Banner** (shown when < 7 days remain)
   - Appears at top of application
   - Shows days remaining
   - "Upgrade to Full License" button
   - Dismissible per session

3. **Activation Screen** (for expired demos)
   - Shows expiration message
   - Displays when license expired
   - Allows immediate reactivation

## Technical Details

### Security Features
- **Hardware Binding**: License tied to specific hardware (CPU, Disk, MAC)
- **HMAC Integrity**: Tampering detection using cryptographic checksums
- **Anti-Copying**: Cannot transfer license between machines
- **Encrypted Storage**: License file encrypted on disk
- **Periodic Validation**: Checks license every 5 minutes

### Expiration Calculation
```typescript
const now = new Date()
const expiresAt = new Date(license.expiresAt)
const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
```

### File Location
- **License File**: `%APPDATA%/Sekersoft/license.dat`
- **Database**: `%APPDATA%/Sekersoft/transport.db`
- **Logs**: `%APPDATA%/Sekersoft/logs/`

## Troubleshooting

### License Not Activating
1. Verify the Hardware Fingerprint matches exactly
2. Check license key format (XXXX-XXXX-XXXX-XXXX)
3. Ensure company name and email are filled
4. Try restarting the application

### Demo Expired But Full License Won't Activate
1. Make sure you generated the license for the correct Hardware Fingerprint
2. The Hardware Fingerprint may have changed if hardware was upgraded
3. Generate a new license with the current Hardware Fingerprint

### License Shows as Expired Incorrectly
1. Check system date/time is correct
2. Verify the expiration date in Settings > License tab
3. If date is correct but showing expired, regenerate license

## Best Practices

### For Vendors
1. **Keep Records**: Save Hardware Fingerprint and license key for each customer
2. **Demo Period**: Use 60-day demos for evaluation periods
3. **Trial Extensions**: Generate new demo license with longer duration if needed
4. **Upgrade Path**: When customer purchases, generate perpetual license with same Hardware Fingerprint

### For Customers
1. **Backup Hardware Fingerprint**: Save it in case you need support
2. **Monitor Expiration**: Check Settings > License tab regularly
3. **Plan Upgrades**: Contact vendor before demo expires
4. **Hardware Changes**: New license required if you change motherboard/CPU

## Migration from Old System

### Existing Licenses
- All existing licenses **without expiration dates** are automatically treated as **perpetual licenses**
- No action needed for current users
- System is fully backward compatible

### Database Schema
The license system uses the existing `AdvancedLicense` structure:
```typescript
interface AdvancedLicense {
  key: string
  hwFingerprint: string
  activatedAt: string
  expiresAt?: string  // NEW: Optional expiration date
  companyName: string
  email: string
  checksum: string
  lastVerified?: string
}
```

## API Reference

### Electron IPC Methods

```typescript
// Get detailed license status
const status = await window.electronAPI.license.getStatus()
// Returns: { valid, licenseType, daysRemaining, isExpired, isDemoLicense, expiresAt, ... }

// Check if license is demo
const isDemo = await window.electronAPI.license.isDemo()
// Returns: boolean

// Get days remaining
const days = await window.electronAPI.license.getDaysRemaining()
// Returns: number | null

// Validate license
const validation = await window.electronAPI.license.validate()
// Returns: { valid, reason?, license?, daysRemaining?, isExpired?, isDemoLicense?, expiresAt? }
```

## Support

For license-related issues:
- Contact: support@sekersoft.com
- Documentation: This file
- Technical Support: Include Hardware Fingerprint and error messages
