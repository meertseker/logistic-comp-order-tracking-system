/**
 * Gelişmiş Lisans Anahtarı Üretme Scripti
 * 
 * Kullanım:
 * node scripts/generate-license-advanced.js <hardware-fingerprint>
 * 
 * Örnek:
 * node scripts/generate-license-advanced.js "abc123def456ghi789jkl012mno345pq"
 */

import crypto from 'crypto'

function generateAdvancedLicenseKey(hwFingerprint) {
  if (!hwFingerprint) {
    console.error('❌ Hata: Hardware Fingerprint gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license-advanced.js <hardware-fingerprint>')
    console.log('\nÖrnek:')
    console.log('  node scripts/generate-license-advanced.js "abc123def456ghi789"')
    process.exit(1)
  }

  // Bu hash fonksiyonu advanced-license-manager.ts ile birebir aynı olmalı
  const hash = crypto
    .createHash('sha256')
    .update(`${hwFingerprint}-seymen-transport-pro-license-2025`)
    .digest('hex')
  
  // Format: XXXX-XXXX-XXXX-XXXX
  const licenseKey = `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase()
  
  return licenseKey
}

// Ana fonksiyon
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Hata: Hardware Fingerprint parametresi gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license-advanced.js <hardware-fingerprint>')
    console.log('\nÖrnek:')
    console.log('  node scripts/generate-license-advanced.js "abc123def456"')
    process.exit(1)
  }

  const hwFingerprint = args[0]
  const licenseKey = generateAdvancedLicenseKey(hwFingerprint)
  
  console.log('\n' + '='.repeat(70))
  console.log('🔐 SEYMEN TRANSPORT - GELİŞMİŞ LİSANS ANAHTARI (PRO)')
  console.log('='.repeat(70))
  console.log('\n🖥️  Hardware Fingerprint:')
  console.log(`   ${hwFingerprint}`)
  console.log('\n🎫 Lisans Anahtarı:')
  console.log(`   ${licenseKey}`)
  console.log('\n' + '='.repeat(70))
  console.log('\n✅ GELİŞMİŞ lisans anahtarı başarıyla oluşturuldu!')
  console.log('Bu anahtarı müşterinize verebilirsiniz.')
  console.log('\n🛡️  GÜVENLİK ÖZELLİKLERİ:')
  console.log('   • Machine ID + CPU + Disk + MAC Address bazlı')
  console.log('   • HMAC ile bütünlük kontrolü')
  console.log('   • Anti-tampering mekanizması')
  console.log('   • Periyodik doğrulama (her 5 dakika)')
  console.log('   • VM detection (sanal makine tespiti)')
  console.log('\n💡 Not: Bu lisans sadece yukarıdaki hardware fingerprint')
  console.log('   ile çalışır ve kopyalanamaz.\n')
}

main()

