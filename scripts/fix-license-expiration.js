/**
 * Manuel License Expiration Fixer
 * Bu script mevcut lisansa süre ekler
 * 
 * Kullanım:
 * node scripts/fix-license-expiration.js <days>
 * 
 * Örnek:
 * node scripts/fix-license-expiration.js 1  # 1 gün
 * node scripts/fix-license-expiration.js 60 # 60 gün
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import os from 'os'

const ALGORITHM = 'aes-256-cbc'
const LICENSE_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'Sekersoft', 'license.dat')

// Encryption key - advanced-license-manager.ts ile aynı olmalı
const masterKey = 'sekersoft-ultra-secure-2025-key'
const encryptionKey = crypto.scryptSync(masterKey, 'encryption-salt', 32)
const hmacKey = crypto.scryptSync(masterKey, 'hmac-salt', 32)

function decrypt(text) {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

function createChecksum(license) {
  const data = JSON.stringify({
    key: license.key,
    hwFingerprint: license.hwFingerprint,
    activatedAt: license.activatedAt,
    companyName: license.companyName,
    email: license.email
  })
  
  return crypto
    .createHmac('sha256', hmacKey)
    .update(data)
    .digest('hex')
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('❌ Hata: Gün sayısı gereklidir!')
    console.log('\nKullanım:')
    console.log('  node scripts/fix-license-expiration.js <days>')
    console.log('\nÖrnek:')
    console.log('  node scripts/fix-license-expiration.js 1   # 1 günlük')
    console.log('  node scripts/fix-license-expiration.js 60  # 60 günlük')
    process.exit(1)
  }

  const days = parseInt(args[0], 10)
  if (isNaN(days) || days <= 0) {
    console.error('❌ Hata: Geçerli bir gün sayısı girin')
    process.exit(1)
  }

  if (!fs.existsSync(LICENSE_PATH)) {
    console.error('❌ Hata: Lisans dosyası bulunamadı!')
    console.log(`   Aranan konum: ${LICENSE_PATH}`)
    console.log('\n💡 Önce uygulamayı açıp bir lisans aktive edin.')
    process.exit(1)
  }

  try {
    // Lisansı oku ve çöz
    const encrypted = fs.readFileSync(LICENSE_PATH, 'utf8')
    const decrypted = decrypt(encrypted)
    const license = JSON.parse(decrypted)
    
    console.log('\n' + '='.repeat(70))
    console.log('📝 MEVCUT LİSANS BİLGİLERİ')
    console.log('='.repeat(70))
    console.log(`Şirket: ${license.companyName}`)
    console.log(`Email: ${license.email}`)
    console.log(`Aktivasyon: ${new Date(license.activatedAt).toLocaleDateString('tr-TR')}`)
    if (license.expiresAt) {
      console.log(`Mevcut Bitiş: ${new Date(license.expiresAt).toLocaleDateString('tr-TR')}`)
    } else {
      console.log('Mevcut Bitiş: Süresiz')
    }
    
    // Yeni bitiş tarihi hesapla
    const now = new Date()
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    // Lisansı güncelle
    license.expiresAt = expiresAt.toISOString()
    license.lastVerified = now.toISOString()
    
    // Yeni checksum hesapla
    const checksum = createChecksum(license)
    license.checksum = checksum
    
    // Şifrele ve kaydet
    const licenseData = JSON.stringify(license)
    const newEncrypted = encrypt(licenseData)
    fs.writeFileSync(LICENSE_PATH, newEncrypted, 'utf8')
    
    console.log('\n' + '='.repeat(70))
    console.log('✅ LİSANS GÜNCELLENDİ')
    console.log('='.repeat(70))
    console.log(`Yeni Bitiş Tarihi: ${expiresAt.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`)
    console.log(`Süre: ${days} gün`)
    console.log('\n💡 Değişikliklerin aktif olması için uygulamayı yeniden başlatın.')
    console.log('='.repeat(70) + '\n')
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
    process.exit(1)
  }
}

main()
