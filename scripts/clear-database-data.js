#!/usr/bin/env node

/**
 * Veritabanındaki tüm verileri siler (tabloları korur)
 * Kullanım: node scripts/clear-database-data.js
 */

import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Veritabanı yolunu belirle (OS'a göre)
let dbPath
if (process.platform === 'win32') {
  // Windows: AppData\Roaming\sekersoft-logistics\transport.db
  dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'sekersoft-logistics', 'transport.db')
} else if (process.platform === 'darwin') {
  // macOS: ~/Library/Application Support/sekersoft-logistics/transport.db
  dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'sekersoft-logistics', 'transport.db')
} else {
  // Linux: ~/.config/sekersoft-logistics/transport.db
  dbPath = path.join(os.homedir(), '.config', 'sekersoft-logistics', 'transport.db')
}

// Alternatif yol (eski versiyonlar için)
const altDbPath = process.env.APPDATA 
  ? path.join(process.env.APPDATA, 'sekersoft', 'transport.db')
  : path.join(process.env.HOME || '', 'Library/Application Support/sekersoft/transport.db')

console.log('🗑️  Veritabanı Verilerini Temizleme Scripti')
console.log('📁 Veritabanı yolu:', dbPath)

// Veritabanı dosyasının var olup olmadığını kontrol et
import fs from 'fs'
if (!fs.existsSync(dbPath) && fs.existsSync(altDbPath)) {
  console.log('⚠️  Ana yol bulunamadı, alternatif yol kullanılıyor:', altDbPath)
  dbPath = altDbPath
}

if (!fs.existsSync(dbPath)) {
  console.error('❌ Veritabanı dosyası bulunamadı:', dbPath)
  console.error('   Uygulamayı en az bir kez çalıştırmış olmanız gerekiyor.')
  process.exit(1)
}

try {
  const db = new Database(dbPath)
  
  console.log('✅ Veritabanına bağlandı\n')
  
  // Foreign key constraint'lerini geçici olarak devre dışı bırak
  db.pragma('foreign_keys = OFF')
  
  // Silinecek tablolar (foreign key sırasına göre)
  // Önce child tabloları, sonra parent tabloları sil
  const tablesToClear = [
    // Log ve ilişkili tablolar (orders'a bağlı)
    'whatsapp_logs',
    'mail_logs',
    'uyumsoft_invoices',
    'expenses',
    'invoices',
    'trailer_loads',
    
    // Ana veri tabloları
    'orders',
    'trailers',
    'vehicles',
    'routes',
    
    // Ayarlar (opsiyonel - yorum satırını kaldırarak ayarları da silebilirsiniz)
    // 'settings',
    // 'mail_settings',
    // 'uyumsoft_settings',
    // 'whatsapp_settings',
  ]
  
  let totalDeleted = 0
  
  for (const tableName of tablesToClear) {
    try {
      // Tablonun var olup olmadığını kontrol et
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(tableName)
      
      if (!tableExists) {
        console.log(`⏭️  ${tableName}: Tablo bulunamadı, atlanıyor`)
        continue
      }
      
      // Tablodaki kayıt sayısını al
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get()
      const count = countResult ? countResult.count : 0
      
      if (count === 0) {
        console.log(`✅ ${tableName}: Zaten boş`)
        continue
      }
      
      // Verileri sil
      const deleteStmt = db.prepare(`DELETE FROM ${tableName}`)
      const result = deleteStmt.run()
      
      totalDeleted += result.changes
      console.log(`🗑️  ${tableName}: ${result.changes} kayıt silindi`)
      
    } catch (error) {
      console.error(`❌ ${tableName} temizlenirken hata:`, error.message)
    }
  }
  
  // Foreign key constraint'lerini tekrar etkinleştir
  db.pragma('foreign_keys = ON')
  
  // VACUUM çalıştır (veritabanı boyutunu küçült)
  console.log('\n🧹 Veritabanı optimize ediliyor...')
  db.exec('VACUUM')
  
  console.log(`\n✅ Tamamlandı! Toplam ${totalDeleted} kayıt silindi.`)
  console.log('📊 Veritabanı yapısı korundu, sadece veriler temizlendi.')
  
  db.close()
  
} catch (error) {
  console.error('❌ Hata:', error.message)
  console.error('Detay:', error)
  process.exit(1)
}

