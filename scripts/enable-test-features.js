#!/usr/bin/env node

/**
 * Enable WhatsApp and Uyumsoft features for UI testing (without real API credentials)
 * Run: node scripts/enable-test-features.js
 */

import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine database path based on OS
let dbPath
if (process.platform === 'win32') {
  dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'sekersoft-logistics', 'transport.db')
} else if (process.platform === 'darwin') {
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'sekersoft-logistics', 'transport.db')
} else {
  dbPath = path.join(os.homedir(), '.config', 'sekersoft-logistics', 'transport.db')
}

console.log('📊 Database path:', dbPath)

try {
  const db = new Database(dbPath)
  
  console.log('\n🔧 Enabling test features...\n')
  
  // Enable WhatsApp with test settings
  db.prepare(`
    UPDATE whatsapp_settings 
    SET enabled = 1,
        provider = 'iletimerkezi',
        api_key = 'TEST_API_KEY',
        api_secret = 'TEST_API_SECRET',
        sender_name = 'Test Şirket',
        sender_phone = '+905551234567',
        company_name = 'Sekersoft Test',
        auto_send_on_created = 1,
        auto_send_on_status_change = 1,
        auto_send_on_delivered = 1,
        auto_send_on_invoiced = 1,
        updated_at = datetime('now')
    WHERE id = 1
  `).run()
  
  console.log('✅ WhatsApp sistemi aktif edildi (Test modu)')
  console.log('   - Provider: İletimerkezi (Test)')
  console.log('   - API Key: TEST_API_KEY')
  console.log('   - Sender Phone: +905551234567')
  
  // Enable Uyumsoft with test settings
  db.prepare(`
    UPDATE uyumsoft_settings 
    SET enabled = 1,
        api_key = 'TEST_UYUMSOFT_API_KEY',
        api_secret = 'TEST_UYUMSOFT_SECRET',
        environment = 'TEST',
        company_name = 'Test Nakliyat A.Ş.',
        company_tax_number = '1234567890',
        company_tax_office = 'Kadıköy',
        company_address = 'Test Mahallesi Test Sokak No:1',
        company_city = 'İstanbul',
        company_district = 'Kadıköy',
        company_postal_code = '34000',
        company_phone = '+905551234567',
        company_email = 'info@test.com',
        sender_email = 'fatura@test.com',
        auto_send_email = 1,
        auto_approve = 0,
        invoice_prefix = 'TEST',
        updated_at = datetime('now')
    WHERE id = 1
  `).run()
  
  console.log('\n✅ Uyumsoft E-Fatura sistemi aktif edildi (Test modu)')
  console.log('   - Environment: TEST')
  console.log('   - API Key: TEST_UYUMSOFT_API_KEY')
  console.log('   - Company: Test Nakliyat A.Ş.')
  console.log('   - Tax Number: 1234567890')
  
  // Verify settings
  const whatsappSettings = db.prepare('SELECT * FROM whatsapp_settings WHERE id = 1').get()
  const uyumsoftSettings = db.prepare('SELECT * FROM uyumsoft_settings WHERE id = 1').get()
  
  console.log('\n📋 Doğrulama:')
  console.log('   WhatsApp enabled:', whatsappSettings?.enabled === 1 ? '✅ Evet' : '❌ Hayır')
  console.log('   Uyumsoft enabled:', uyumsoftSettings?.enabled === 1 ? '✅ Evet' : '❌ Hayır')
  
  db.close()
  
  console.log('\n🎉 Başarılı! Artık uygulamayı yeniden başlatın.\n')
  console.log('📱 Sipariş detay sayfasında göreceksiniz:')
  console.log('   • "WhatsApp Gönder" butonu 🟢')
  console.log('   • "Faturala" butonu 🧾')
  console.log('\n⚠️  NOT: Gerçek API çağrıları başarısız olacak (test modunda).')
  console.log('   Sadece UI ve butonları test edebilirsiniz.\n')
  
} catch (error) {
  console.error('\n❌ Hata:', error.message)
  console.error('\nÇözüm önerileri:')
  console.error('1. Uygulamayı en az bir kez çalıştırın (database oluşsun)')
  console.error('2. Database yolunu kontrol edin:', dbPath)
  console.error('3. Uygulamayı kapatın ve tekrar deneyin\n')
  process.exit(1)
}

