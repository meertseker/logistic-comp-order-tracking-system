/**
 * Gelişmiş Lisans Anahtarı Üretme Scripti
 * 
 * Kullanım:
 * node scripts/generate-license-advanced.js <hardware-fingerprint> [--demo|--days <number>|--perpetual]
 * 
 * Örnekler:
 * node scripts/generate-license-advanced.js "abc123def456ghi789jkl012mno345pq"        # Perpetual (süresiz)
 * node scripts/generate-license-advanced.js "abc123def456ghi789jkl012mno345pq" --demo # 60 günlük demo
 * node scripts/generate-license-advanced.js "abc123def456ghi789jkl012mno345pq" --days 90 # 90 günlük
 */

import crypto from 'crypto'

function generateAdvancedLicenseKey(hwFingerprint, durationDays = null) {
  if (!hwFingerprint) {
    console.error('❌ Hata: Hardware Fingerprint gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license-advanced.js <hardware-fingerprint> [--demo|--days <number>|--perpetual]')
    console.log('\nÖrnekler:')
    console.log('  node scripts/generate-license-advanced.js "abc123def456ghi789"           # Perpetual')
    console.log('  node scripts/generate-license-advanced.js "abc123def456ghi789" --demo    # 60-day demo')
    console.log('  node scripts/generate-license-advanced.js "abc123def456ghi789" --days 90 # 90-day')
    process.exit(1)
  }

  // Süre bilgisini anahtara gömme
  const durationString = durationDays ? `-DAYS${durationDays}` : ''
  
  // Bu hash fonksiyonu advanced-license-manager.ts ile birebir aynı olmalı
  const hash = crypto
    .createHash('sha256')
    .update(`${hwFingerprint}-sekersoft-pro-license-2025${durationString}`)
    .digest('hex')
  
  // Format: XXXX-XXXX-XXXX-XXXX
  const licenseKey = `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase()
  
  return { key: licenseKey, durationDays }
}

function parseArgs(args) {
  const result = {
    hwFingerprint: null,
    durationDays: null, // null = perpetual
    isDemo: false,
    isPerpetual: false
  }

  if (args.length === 0) {
    return result
  }

  // First argument is always hardware fingerprint
  result.hwFingerprint = args[0]

  // Parse flags
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--demo') {
      result.isDemo = true
      result.durationDays = 60 // 2 months
    } else if (arg === '--days' && i + 1 < args.length) {
      const days = parseInt(args[i + 1], 10)
      if (isNaN(days) || days <= 0) {
        console.error('❌ Hata: --days parametresi pozitif bir sayı olmalıdır')
        process.exit(1)
      }
      result.durationDays = days
      i++ // Skip next arg (the number)
    } else if (arg === '--perpetual') {
      result.isPerpetual = true
      result.durationDays = null
    }
  }

  // If no flags specified, default to perpetual
  if (!result.isDemo && result.durationDays === null && !result.isPerpetual) {
    result.isPerpetual = true
  }

  return result
}

function calculateExpirationDate(durationDays) {
  if (!durationDays) return null
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
  return expiresAt
}

// Ana fonksiyon
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Hata: Hardware Fingerprint parametresi gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license-advanced.js <hardware-fingerprint> [--demo|--days <number>|--perpetual]')
    console.log('\nÖrnekler:')
    console.log('  node scripts/generate-license-advanced.js "abc123def456"           # Perpetual (süresiz)')
    console.log('  node scripts/generate-license-advanced.js "abc123def456" --demo    # 60 günlük demo')
    console.log('  node scripts/generate-license-advanced.js "abc123def456" --days 90 # 90 günlük')
    process.exit(1)
  }

  const config = parseArgs(args)
  
  if (!config.hwFingerprint) {
    console.error('❌ Hata: Hardware Fingerprint gereklidir!')
    process.exit(1)
  }

  const hwFingerprint = config.hwFingerprint
  const licenseResult = generateAdvancedLicenseKey(hwFingerprint, config.durationDays)
  const licenseKey = licenseResult.key
  const expiresAt = calculateExpirationDate(config.durationDays)
  
  // Determine license type
  let licenseType = '🔓 PERPETUAL (Süresiz)'
  if (config.isDemo) {
    licenseType = '⏱️  DEMO (60 Gün)'
  } else if (config.durationDays && !config.isDemo) {
    licenseType = `⏱️  TRIAL (${config.durationDays} Gün)`
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('🔐 SEKERSOFT - GELİŞMİŞ LİSANS ANAHTARI (PRO)')
  console.log('='.repeat(70))
  console.log('\n📋 Lisans Tipi:')
  console.log(`   ${licenseType}`)
  console.log('\n🖥️  Hardware Fingerprint:')
  console.log(`   ${hwFingerprint}`)
  console.log('\n🎫 Lisans Anahtarı:')
  console.log(`   ${licenseKey}`)
  
  if (expiresAt) {
    console.log('\n⏰ Aktivasyon Tarihi:')
    console.log(`   ${new Date().toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`)
    console.log('\n📅 Son Kullanım Tarihi:')
    console.log(`   ${expiresAt.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`)
    console.log('\n⏳ Süre:')
    console.log(`   ${config.durationDays} gün`)
  } else {
    console.log('\n⏰ Süre:')
    console.log('   Süresiz (Perpetual)')
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('\n✅ GELİŞMİŞ lisans anahtarı başarıyla oluşturuldu!')
  console.log('Bu anahtarı müşterinize verebilirsiniz.')
  console.log('\n🛡️  GÜVENLİK ÖZELLİKLERİ:')
  console.log('   • Machine ID + CPU + Disk + MAC Address bazlı')
  console.log('   • HMAC ile bütünlük kontrolü')
  console.log('   • Anti-tampering mekanizması')
  console.log('   • Periyodik doğrulama (her 5 dakika)')
  console.log('   • VM detection (sanal makine tespiti)')
  
  if (expiresAt) {
    console.log('\n⚠️  DİKKAT:')
    console.log(`   • Bu lisans ${config.durationDays} gün sonra otomatik olarak sona erecektir`)
    console.log('   • Süre dolduğunda yeni bir aktivasyon anahtarı gerekecektir')
    console.log('   • Lisans süresi aktivasyon tarihinden itibaren başlar')
  }
  
  console.log('\n💡 Not: Bu lisans sadece yukarıdaki hardware fingerprint')
  console.log('   ile çalışır ve kopyalanamaz.\n')
}

main()

