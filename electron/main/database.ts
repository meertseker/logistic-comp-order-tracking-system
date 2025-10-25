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
  
  // Orders table (geliştirilmiş - km bilgileri eklendi)
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
      gidis_km REAL DEFAULT 0,
      donus_km REAL DEFAULT 0,
      return_load_rate REAL DEFAULT 0,
      etkin_km REAL DEFAULT 0,
      toplam_maliyet REAL DEFAULT 0,
      onerilen_fiyat REAL DEFAULT 0,
      kar_zarar REAL DEFAULT 0,
      status TEXT DEFAULT 'Bekliyor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
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
  
  // Vehicles table (araç bilgileri)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plaka TEXT UNIQUE NOT NULL,
      arac_degeri REAL DEFAULT 2300000,
      amorti_sure_yil REAL DEFAULT 2,
      hedef_toplam_km REAL DEFAULT 72000,
      bakim_maliyet REAL DEFAULT 15000,
      bakim_aralik_km REAL DEFAULT 15000,
      ek_masraf_per_1000 REAL DEFAULT 1000,
      benzin_per_km REAL DEFAULT 7.5,
      gunluk_ucret REAL DEFAULT 1600,
      gunluk_ort_km REAL DEFAULT 500,
      kar_orani REAL DEFAULT 0.45,
      kdv REAL DEFAULT 0.20,
      include_amortisman INTEGER DEFAULT 0,
      aktif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
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

