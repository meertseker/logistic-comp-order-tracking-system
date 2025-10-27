import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export const initDatabase = () => {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'transport.db')
  
  console.log('Database path:', dbPath)
  
  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
  
  db = new Database(dbPath)
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')
  
  // Create tables
  createTables()
  
  console.log('Database initialized successfully')
}

const createTables = () => {
  if (!db) return
  
  // Orders table - Basit versiyon (mevcut verilerle uyumlu)
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plaka TEXT NOT NULL,
      musteri TEXT NOT NULL,
      telefon TEXT NOT NULL,
      nereden TEXT NOT NULL,
      nereye TEXT NOT NULL,
      yuk_aciklamasi TEXT,
      baslangic_fiyati REAL NOT NULL,
      status TEXT DEFAULT 'Bekliyor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Yeni kolonları ekle (ALTER TABLE - mevcut veriler korunur)
  const ordersColumns = [
    'gidis_km REAL DEFAULT 0',
    'donus_km REAL DEFAULT 0',
    'return_load_rate REAL DEFAULT 0',
    'etkin_km REAL DEFAULT 0',
    'tahmini_gun INTEGER DEFAULT 1',
    'yakit_litre REAL DEFAULT 0',
    'yakit_maliyet REAL DEFAULT 0',
    'surucu_maliyet REAL DEFAULT 0',
    'yemek_maliyet REAL DEFAULT 0',
    'hgs_maliyet REAL DEFAULT 0',
    'bakim_maliyet REAL DEFAULT 0',
    'toplam_maliyet REAL DEFAULT 0',
    'onerilen_fiyat REAL DEFAULT 0',
    'kar_zarar REAL DEFAULT 0',
    'kar_zarar_yuzde REAL DEFAULT 0',
  ]
  
  for (const column of ordersColumns) {
    try {
      db.exec(`ALTER TABLE orders ADD COLUMN ${column}`)
    } catch (error) {
      // Kolon zaten varsa hata verir, görmezden gel
    }
  }
  
  // Expenses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)
  
  // Invoices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)
  
  // Settings table (sistem parametreleri)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Routes table (güzergah HGS/köprü maliyetleri)
  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nereden TEXT NOT NULL,
      nereye TEXT NOT NULL,
      mesafe_km REAL DEFAULT 0,
      hgs_maliyet REAL DEFAULT 0,
      kopru_maliyet REAL DEFAULT 0,
      sure_saat REAL DEFAULT 0,
      notlar TEXT,
      aktif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(nereden, nereye)
    )
  `)
  
  // Vehicles table - Basit versiyon
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plaka TEXT UNIQUE NOT NULL,
      aktif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Yeni kolonları ekle
  const vehicleColumns = [
    'yakit_tuketimi REAL DEFAULT 25',
    'yakit_fiyati REAL DEFAULT 40',
    'gunluk_ucret REAL DEFAULT 1600',
    'gunluk_ort_km REAL DEFAULT 500',
    'yemek_gunluk REAL DEFAULT 150',
    'yag_maliyet REAL DEFAULT 500',
    'yag_aralik REAL DEFAULT 5000',
    'lastik_maliyet REAL DEFAULT 8000',
    'lastik_omur REAL DEFAULT 50000',
    'buyuk_bakim_maliyet REAL DEFAULT 3000',
    'buyuk_bakim_aralik REAL DEFAULT 15000',
    'ufak_onarim_aylik REAL DEFAULT 200',
    'kar_orani REAL DEFAULT 0.45',
    'kdv REAL DEFAULT 0.20',
    'arac_degeri REAL DEFAULT 2300000',
    'amorti_sure_yil REAL DEFAULT 2',
    'hedef_toplam_km REAL DEFAULT 72000',
    'sigorta_yillik REAL DEFAULT 12000',
    'mtv_yillik REAL DEFAULT 5000',
    'muayene_yillik REAL DEFAULT 1500',
  ]
  
  for (const column of vehicleColumns) {
    try {
      db.exec(`ALTER TABLE vehicles ADD COLUMN ${column}`)
    } catch (error) {
      // Kolon zaten varsa hata verir, görmezden gel
    }
  }
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_plaka ON orders(plaka);
    CREATE INDEX IF NOT EXISTS idx_expenses_order_id ON expenses(order_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
    CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    CREATE INDEX IF NOT EXISTS idx_vehicles_plaka ON vehicles(plaka);
  `)
  
  // Insert default global settings if not exists
  const defaultSettings = [
    ['default_kar_orani', '0.45', 'Varsayılan kar oranı (%45)'],
    ['default_kdv', '0.20', 'Varsayılan KDV oranı (%20)'],
    ['currency', 'TRY', 'Para birimi'],
  ]
  
  defaultSettings.forEach(([key, value, description]) => {
    db.prepare(`
      INSERT OR IGNORE INTO settings (key, value, description)
      VALUES (?, ?, ?)
    `).run(key, value, description)
  })
  
  // Varsayılan güzergahları ekle
  const defaultRoutes = [
    ['İstanbul', 'Ankara', 450, 450, 150, 6, 'Ana güzergah'],
    ['Ankara', 'İstanbul', 450, 450, 150, 6, 'Dönüş güzergahı'],
    ['İstanbul', 'İzmir', 480, 380, 150, 7, ''],
    ['İzmir', 'İstanbul', 480, 380, 150, 7, ''],
    ['İstanbul', 'Bursa', 150, 120, 150, 2, ''],
    ['Bursa', 'İstanbul', 150, 120, 150, 2, ''],
    ['Ankara', 'İzmir', 550, 350, 0, 8, ''],
    ['İzmir', 'Ankara', 550, 350, 0, 8, ''],
    ['İstanbul', 'Adana', 940, 580, 150, 12, ''],
    ['Adana', 'İstanbul', 940, 580, 150, 12, ''],
    ['Ankara', 'Adana', 490, 420, 0, 7, ''],
    ['Adana', 'Ankara', 490, 420, 0, 7, ''],
    ['İstanbul', 'Antalya', 720, 480, 150, 10, ''],
    ['Antalya', 'İstanbul', 720, 480, 150, 10, ''],
    ['İstanbul', 'Trabzon', 1100, 680, 150, 14, ''],
    ['Trabzon', 'İstanbul', 1100, 680, 150, 14, ''],
    ['Ankara', 'Antalya', 490, 380, 0, 7, ''],
    ['Antalya', 'Ankara', 490, 380, 0, 7, ''],
    ['İzmir', 'Antalya', 490, 320, 0, 7, ''],
    ['Antalya', 'İzmir', 490, 320, 0, 7, ''],
  ]
  
  defaultRoutes.forEach(([nereden, nereye, mesafe, hgs, kopru, sure, notlar]) => {
    db.prepare(`
      INSERT OR IGNORE INTO routes (nereden, nereye, mesafe_km, hgs_maliyet, kopru_maliyet, sure_saat, notlar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(nereden, nereye, mesafe, hgs, kopru, sure, notlar)
  })
}

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export const closeDatabase = () => {
  if (db) {
    db.close()
    db = null
  }
}

