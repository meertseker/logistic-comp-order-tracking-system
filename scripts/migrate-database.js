import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Windows AppData yolu
const dbPath = process.env.APPDATA 
  ? path.join(process.env.APPDATA, 'seymen-transport', 'transport.db')
  : path.join(process.env.HOME || '', 'Library/Application Support/seymen-transport/transport.db')

console.log('🔧 Database Migration Script')
console.log('Database path:', dbPath)

try {
  const db = new Database(dbPath)
  
  console.log('✅ Database connected')
  
  // Mevcut kolonları kontrol et
  const tableInfo = db.prepare("PRAGMA table_info(orders)").all()
  const existingColumns = tableInfo.map(col => col.name)
  
  console.log('📋 Existing columns:', existingColumns.join(', '))
  
  // Yeni kolonları ekle (yoksa)
  const newColumns = [
    { name: 'gidis_km', type: 'REAL DEFAULT 0' },
    { name: 'donus_km', type: 'REAL DEFAULT 0' },
    { name: 'return_load_rate', type: 'REAL DEFAULT 0' },
    { name: 'etkin_km', type: 'REAL DEFAULT 0' },
    { name: 'tahmini_gun', type: 'INTEGER DEFAULT 1' },
    { name: 'yakit_litre', type: 'REAL DEFAULT 0' },
    { name: 'yakit_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'surucu_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'yemek_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'hgs_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'bakim_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'toplam_maliyet', type: 'REAL DEFAULT 0' },
    { name: 'onerilen_fiyat', type: 'REAL DEFAULT 0' },
    { name: 'kar_zarar', type: 'REAL DEFAULT 0' },
    { name: 'kar_zarar_yuzde', type: 'REAL DEFAULT 0' },
  ]
  
  let addedCount = 0
  for (const col of newColumns) {
    if (!existingColumns.includes(col.name)) {
      console.log(`➕ Adding column: ${col.name}`)
      db.exec(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`)
      addedCount++
    }
  }
  
  // Vehicles tablosu için de aynısını yap
  const vehicleInfo = db.prepare("PRAGMA table_info(vehicles)").all()
  const existingVehicleColumns = vehicleInfo.map(col => col.name)
  
  const newVehicleColumns = [
    { name: 'yakit_tuketimi', type: 'REAL DEFAULT 25' },
    { name: 'yakit_fiyati', type: 'REAL DEFAULT 40' },
    { name: 'yemek_gunluk', type: 'REAL DEFAULT 150' },
    { name: 'yag_maliyet', type: 'REAL DEFAULT 500' },
    { name: 'yag_aralik', type: 'REAL DEFAULT 5000' },
    { name: 'lastik_maliyet', type: 'REAL DEFAULT 8000' },
    { name: 'lastik_omur', type: 'REAL DEFAULT 50000' },
    { name: 'buyuk_bakim_maliyet', type: 'REAL DEFAULT 3000' },
    { name: 'buyuk_bakim_aralik', type: 'REAL DEFAULT 15000' },
    { name: 'ufak_onarim_aylik', type: 'REAL DEFAULT 200' },
    { name: 'hgs_per_km', type: 'REAL DEFAULT 0.50' },
    { name: 'sigorta_yillik', type: 'REAL DEFAULT 12000' },
    { name: 'mtv_yillik', type: 'REAL DEFAULT 5000' },
  ]
  
  for (const col of newVehicleColumns) {
    if (!existingVehicleColumns.includes(col.name)) {
      console.log(`➕ Adding vehicle column: ${col.name}`)
      db.exec(`ALTER TABLE vehicles ADD COLUMN ${col.name} ${col.type}`)
      addedCount++
    }
  }
  
  console.log(`\n✅ Migration complete! Added ${addedCount} columns.`)
  
  db.close()
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  console.error('Error:', error)
  process.exit(1)
}

