/**
 * Lisans Anahtarı Üretme Scripti
 * 
 * Kullanım:
 * node scripts/generate-license.js <machine-id>
 * 
 * Örnek:
 * node scripts/generate-license.js "abc123-def456-ghi789"
 */

import crypto from 'crypto'

function generateLicenseKey(machineId) {
  if (!machineId) {
    console.error('❌ Hata: Makine ID gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license.js <machine-id>')
    console.log('\nÖrnek:')
    console.log('  node scripts/generate-license.js "abc123-def456-ghi789"')
    process.exit(1)
  }

  // Bu hash fonksiyonu license-manager.ts ile birebir aynı olmalı
  const hash = crypto
    .createHash('sha256')
    .update(`${machineId}-seymen-transport-license`)
    .digest('hex')
  
  // Daha okunabilir bir format (XXXX-XXXX-XXXX-XXXX)
  const licenseKey = `${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase()
  
  return licenseKey
}

// Ana fonksiyon
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Hata: Makine ID parametresi gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/generate-license.js <machine-id>')
    console.log('\nÖrnek:')
    console.log('  node scripts/generate-license.js "abc123-def456-ghi789"')
    process.exit(1)
  }

  const machineId = args[0]
  const licenseKey = generateLicenseKey(machineId)
  
  console.log('\n' + '='.repeat(60))
  console.log('🔑 SEYMEN TRANSPORT - LİSANS ANAHTARI')
  console.log('='.repeat(60))
  console.log('\n📋 Makine ID:')
  console.log(`   ${machineId}`)
  console.log('\n🎫 Lisans Anahtarı:')
  console.log(`   ${licenseKey}`)
  console.log('\n' + '='.repeat(60))
  console.log('\n✅ Lisans anahtarı başarıyla oluşturuldu!')
  console.log('Bu anahtarı müşterinize verebilirsiniz.')
  console.log('\n💡 Not: Bu lisans anahtarı sadece yukarıdaki Makine ID')
  console.log('   ile çalışır ve başka bilgisayarlarda geçersizdir.\n')
}

main()

