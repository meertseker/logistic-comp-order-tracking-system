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
    'is_subcontractor INTEGER DEFAULT 0',
    'subcontractor_company TEXT',
    'subcontractor_vehicle TEXT',
    'subcontractor_cost REAL DEFAULT 0',
    'customer_email TEXT',
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
  
  // Trailers (Dorseler) table - Gelişmiş
  // Önce eski tabloyu kontrol et, varsa yenisiyle değiştir
  const trailersTableInfo = db.prepare("PRAGMA table_info(trailers)").all() as any[]
  const hasOldSchema = trailersTableInfo.some((col: any) => col.name === 'musteri_adi')
  
  if (hasOldSchema) {
    console.log('🔄 Migrating trailers table to new schema...')
    // Eski tabloyu yedekle
    db.exec(`
      CREATE TABLE IF NOT EXISTS trailers_backup AS SELECT * FROM trailers;
      DROP TABLE trailers;
    `)
  }
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS trailers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dorse_no TEXT UNIQUE NOT NULL,
      
      -- Boyut bilgileri
      en_cm REAL DEFAULT 0,
      boy_cm REAL DEFAULT 0,
      yukseklik_cm REAL DEFAULT 0,
      hacim_m3 REAL DEFAULT 0,
      
      -- Kapasite
      max_agirlik_ton REAL DEFAULT 0,
      mevcut_agirlik_ton REAL DEFAULT 0,
      mevcut_hacim_m3 REAL DEFAULT 0,
      
      -- Durum
      durum TEXT DEFAULT 'Boş',
      lokasyon TEXT,
      arac_plakasi TEXT,
      
      -- Tip
      tip TEXT DEFAULT 'Kapalı',
      
      -- Diğer
      notlar TEXT,
      aktif INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Eski veriler varsa geri yükle (sadece ortak kolonları)
  if (hasOldSchema) {
    try {
      db.exec(`
        INSERT OR IGNORE INTO trailers (
          id, dorse_no, lokasyon, notlar, aktif, created_at, updated_at
        )
        SELECT 
          id, dorse_no, lokasyon, notlar, aktif, created_at, updated_at
        FROM trailers_backup;
        DROP TABLE trailers_backup;
      `)
      console.log('✅ Trailers table migration completed! Old data preserved.')
    } catch (error) {
      console.error('❌ Migration error:', error)
      // Hata olsa bile devam et, backup tablosunu sil
      try {
        db.exec(`DROP TABLE IF EXISTS trailers_backup`)
      } catch {}
    }
  }
  
  // Trailer Loads (Dorse Yükleri) table - YENİ!
  db.exec(`
    CREATE TABLE IF NOT EXISTS trailer_loads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trailer_id INTEGER NOT NULL,
      
      -- Yük bilgileri
      musteri_adi TEXT NOT NULL,
      yuk_aciklamasi TEXT,
      
      -- Boyutlar (cm)
      en_cm REAL NOT NULL,
      boy_cm REAL NOT NULL,
      yukseklik_cm REAL NOT NULL,
      hacim_m3 REAL DEFAULT 0,
      
      -- Ağırlık
      agirlik_ton REAL DEFAULT 0,
      
      -- Yük özellikleri
      yuk_tipi TEXT DEFAULT 'Normal',
      yukleme_sirasi INTEGER DEFAULT 0,
      bosaltma_noktasi TEXT,
      
      -- Durum
      durum TEXT DEFAULT 'Yüklendi',
      yukleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
      bosaltma_tarihi DATETIME,
      
      -- Notlar
      notlar TEXT,
      
      FOREIGN KEY (trailer_id) REFERENCES trailers(id) ON DELETE CASCADE
    )
  `)
  
  // Trailers tablosuna yeni kolonları ekle (migration)
  const trailerColumns = [
    'en_cm REAL DEFAULT 0',
    'boy_cm REAL DEFAULT 0',
    'yukseklik_cm REAL DEFAULT 0',
    'hacim_m3 REAL DEFAULT 0',
    'max_agirlik_ton REAL DEFAULT 0',
    'mevcut_agirlik_ton REAL DEFAULT 0',
    'mevcut_hacim_m3 REAL DEFAULT 0',
    'arac_plakasi TEXT',
    'tip TEXT DEFAULT \'Kapalı\'',
  ]
  
  for (const column of trailerColumns) {
    try {
      db.exec(`ALTER TABLE trailers ADD COLUMN ${column}`)
    } catch (error) {
      // Kolon zaten varsa hata verir, görmezden gel
    }
  }
  
  // Eski kolonları kaldır veya yeniden adlandır (opsiyonel - veri kaybı olmaması için yoruma alındı)
  // Eğer musteri_adi, kapasite, kapasite_birimi, mevcut_yuk kolonları varsa bunları kaldırmayalım
  // Sadece yeni sistemle çalışmaya başlayalım
  
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
    CREATE INDEX IF NOT EXISTS idx_trailers_dorse_no ON trailers(dorse_no);
    CREATE INDEX IF NOT EXISTS idx_trailers_durum ON trailers(durum);
    CREATE INDEX IF NOT EXISTS idx_trailer_loads_trailer_id ON trailer_loads(trailer_id);
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
  
  // Mail Settings table - SMTP yapılandırması (birden fazla servis desteği)
  // Önce eski tabloyu kontrol et ve migration yap
  try {
    const tableInfo = db.prepare("PRAGMA table_info(mail_settings)").all() as any[]
    const hasOldStructure = tableInfo.length > 0 && tableInfo.some(col => col.name === 'id' && col.pk === 1)
    
    if (hasOldStructure) {
      // Eski veriyi yedekle
      const oldData = db.prepare('SELECT * FROM mail_settings WHERE id = 1').get() as any
      
      // Eski tabloyu yedekle
      db.exec('DROP TABLE IF EXISTS mail_settings_backup')
      db.exec('CREATE TABLE mail_settings_backup AS SELECT * FROM mail_settings')
      
      // Yeni tabloyu oluştur
      db.exec('DROP TABLE IF EXISTS mail_settings')
      db.exec(`
        CREATE TABLE mail_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT DEFAULT 'Mail Servisi',
          provider TEXT,
          smtp_host TEXT,
          smtp_port INTEGER DEFAULT 587,
          smtp_secure INTEGER DEFAULT 0,
          smtp_user TEXT,
          smtp_password TEXT,
          from_email TEXT,
          from_name TEXT DEFAULT 'Sekersoft',
          company_name TEXT DEFAULT 'Şirket Adı',
          is_active INTEGER DEFAULT 0,
          enabled INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Eski veriyi yeni tabloya taşı
      if (oldData && oldData.smtp_host) {
        const detectProvider = (host: string) => {
          if (host.includes('gmail')) return { name: 'Gmail', provider: 'gmail' }
          if (host.includes('outlook') || host.includes('hotmail')) return { name: 'Outlook', provider: 'outlook' }
          if (host.includes('yandex')) return { name: 'Yandex', provider: 'yandex' }
          if (host.includes('yahoo')) return { name: 'Yahoo', provider: 'yahoo' }
          if (host.includes('zoho')) return { name: 'Zoho', provider: 'zoho' }
          if (host.includes('mail.me.com') || host.includes('icloud')) return { name: 'iCloud', provider: 'icloud' }
          return { name: 'Özel SMTP', provider: 'custom' }
        }
        
        const providerInfo = detectProvider(oldData.smtp_host)
        
        db.prepare(`
          INSERT INTO mail_settings (
            name, provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password,
            from_email, from_name, company_name, is_active, enabled, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).run(
          providerInfo.name,
          providerInfo.provider,
          oldData.smtp_host,
          oldData.smtp_port || 587,
          oldData.smtp_secure || 0,
          oldData.smtp_user,
          oldData.smtp_password,
          oldData.from_email,
          oldData.from_name || 'Sekersoft',
          oldData.company_name || 'Şirket Adı',
          oldData.enabled || 0,
          oldData.updated_at || new Date().toISOString()
        )
      }
      
      // Yedek tabloyu sil
      db.exec('DROP TABLE IF EXISTS mail_settings_backup')
    } else {
      // Yeni kurulum - direkt oluştur
      db.exec(`
        CREATE TABLE IF NOT EXISTS mail_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT DEFAULT 'Mail Servisi',
          provider TEXT,
          smtp_host TEXT,
          smtp_port INTEGER DEFAULT 587,
          smtp_secure INTEGER DEFAULT 0,
          smtp_user TEXT,
          smtp_password TEXT,
          from_email TEXT,
          from_name TEXT DEFAULT 'Sekersoft',
          company_name TEXT DEFAULT 'Şirket Adı',
          is_active INTEGER DEFAULT 0,
          enabled INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }
  } catch (error) {
    console.log('Mail settings migration error:', error)
    // Hata durumunda yeni tabloyu oluştur
    db.exec(`
      CREATE TABLE IF NOT EXISTS mail_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT 'Mail Servisi',
        provider TEXT,
        smtp_host TEXT,
        smtp_port INTEGER DEFAULT 587,
        smtp_secure INTEGER DEFAULT 0,
        smtp_user TEXT,
        smtp_password TEXT,
        from_email TEXT,
        from_name TEXT DEFAULT 'Sekersoft',
        company_name TEXT DEFAULT 'Şirket Adı',
        is_active INTEGER DEFAULT 0,
        enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }
  
  // Mail Logs table - Gönderilen maillerin kaydı
  db.exec(`
    CREATE TABLE IF NOT EXISTS mail_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )
  `)
  
  // İndexler ekle
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_mail_logs_order_id ON mail_logs(order_id);
    CREATE INDEX IF NOT EXISTS idx_mail_logs_status ON mail_logs(status);
  `)
  
  // Uyumsoft Settings table - API yapılandırması
  db.exec(`
    CREATE TABLE IF NOT EXISTS uyumsoft_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      api_key TEXT,
      api_secret TEXT,
      environment TEXT DEFAULT 'TEST',
      company_name TEXT,
      company_tax_number TEXT,
      company_tax_office TEXT,
      company_address TEXT,
      company_city TEXT,
      company_district TEXT,
      company_postal_code TEXT,
      company_phone TEXT,
      company_email TEXT,
      sender_email TEXT,
      auto_send_email INTEGER DEFAULT 1,
      auto_approve INTEGER DEFAULT 0,
      invoice_prefix TEXT DEFAULT 'SEK',
      enabled INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Uyumsoft Invoices table - Oluşturulan faturalar
  db.exec(`
    CREATE TABLE IF NOT EXISTS uyumsoft_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      invoice_uuid TEXT UNIQUE,
      invoice_number TEXT,
      invoice_type TEXT NOT NULL,
      invoice_date DATETIME NOT NULL,
      ettn TEXT,
      customer_name TEXT NOT NULL,
      customer_tax_number TEXT,
      customer_tax_office TEXT,
      customer_id_number TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      total_amount REAL NOT NULL,
      vat_amount REAL NOT NULL,
      grand_total REAL NOT NULL,
      invoice_status TEXT DEFAULT 'DRAFT',
      uyumsoft_status TEXT,
      pdf_url TEXT,
      html_content TEXT,
      sent_to_email TEXT,
      sent_at DATETIME,
      cancelled_at DATETIME,
      cancel_reason TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)
  
  // Uyumsoft İndexler
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_uyumsoft_invoices_order_id ON uyumsoft_invoices(order_id);
    CREATE INDEX IF NOT EXISTS idx_uyumsoft_invoices_status ON uyumsoft_invoices(invoice_status);
    CREATE INDEX IF NOT EXISTS idx_uyumsoft_invoices_uuid ON uyumsoft_invoices(invoice_uuid);
    CREATE INDEX IF NOT EXISTS idx_uyumsoft_invoices_invoice_number ON uyumsoft_invoices(invoice_number);
  `)
  
  // Mail settings'e company_name kolonu ekle (migration)
  try {
    db.exec(`ALTER TABLE mail_settings ADD COLUMN company_name TEXT DEFAULT 'Şirket Adı'`)
  } catch (error) {
    // Kolon zaten varsa hata verir, görmezden gel
  }
  
  // Default mail settings ekle (boş, kullanıcı dolduracak)
  db.prepare(`
    INSERT OR IGNORE INTO mail_settings (id, enabled)
    VALUES (1, 0)
  `).run()
  
  // Default Uyumsoft settings ekle (boş, kullanıcı dolduracak)
  db.prepare(`
    INSERT OR IGNORE INTO uyumsoft_settings (id, enabled, environment)
    VALUES (1, 0, 'TEST')
  `).run()
  
  // WhatsApp Settings table - API yapılandırması
  db.exec(`
    CREATE TABLE IF NOT EXISTS whatsapp_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      provider TEXT DEFAULT 'iletimerkezi',
      api_key TEXT,
      api_secret TEXT,
      api_username TEXT,
      api_password TEXT,
      sender_name TEXT,
      sender_phone TEXT,
      enabled INTEGER DEFAULT 0,
      
      -- Otomatik bildirim ayarları
      auto_send_on_created INTEGER DEFAULT 1,
      auto_send_on_status_change INTEGER DEFAULT 1,
      auto_send_on_delivered INTEGER DEFAULT 1,
      auto_send_on_invoiced INTEGER DEFAULT 1,
      
      -- Bildirim şablonları
      template_order_created TEXT,
      template_order_on_way TEXT,
      template_order_delivered TEXT,
      template_order_invoiced TEXT,
      template_order_cancelled TEXT,
      template_custom TEXT,
      
      company_name TEXT DEFAULT 'Sekersoft',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // WhatsApp Logs table - Gönderilen mesajların kaydı
  db.exec(`
    CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      recipient_phone TEXT NOT NULL,
      recipient_name TEXT,
      message_type TEXT NOT NULL,
      message_content TEXT NOT NULL,
      status TEXT NOT NULL,
      delivery_status TEXT,
      read_status INTEGER DEFAULT 0,
      error_message TEXT,
      provider_message_id TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      delivered_at DATETIME,
      read_at DATETIME,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )
  `)
  
  // WhatsApp İndexler
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_order_id ON whatsapp_logs(order_id);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_sent_at ON whatsapp_logs(sent_at);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_recipient_phone ON whatsapp_logs(recipient_phone);
  `)
  
  // Default WhatsApp settings ekle (boş, kullanıcı dolduracak)
  db.prepare(`
    INSERT OR IGNORE INTO whatsapp_settings (id, enabled)
    VALUES (1, 0)
  `).run()
  
  // Varsayılan WhatsApp şablonları ekle
  const defaultWhatsAppTemplates = {
    template_order_created: 'Sayın {musteri}, siparişiniz (#{orderId}) başarıyla alınmıştır. {nereden} - {nereye} güzergahı için araç tahsis edilmiştir. Detaylar için: {phone}',
    template_order_on_way: 'Sayın {musteri}, siparişiniz (#{orderId}) yola çıkmıştır. Plaka: {plaka}. Tahmini varış: {tahminiGun} gün. İyi yolculuklar!',
    template_order_delivered: 'Sayın {musteri}, siparişiniz (#{orderId}) başarıyla teslim edilmiştir. ✅ Bizi tercih ettiğiniz için teşekkür ederiz.',
    template_order_invoiced: 'Sayın {musteri}, siparişinize (#{orderId}) ait faturanız hazırlanmıştır. Fatura tutarı: {fiyat} TL. Ödeme bilgileri için: {phone}',
    template_order_cancelled: 'Sayın {musteri}, siparişiniz (#{orderId}) iptal edilmiştir. Bilgi için: {phone}',
    template_custom: 'Sayın {musteri}, siparişiniz (#{orderId}) hakkında bilgilendirme.'
  }
  
  try {
    const stmt = db.prepare(`
      UPDATE whatsapp_settings 
      SET template_order_created = ?,
          template_order_on_way = ?,
          template_order_delivered = ?,
          template_order_invoiced = ?,
          template_order_cancelled = ?,
          template_custom = ?
      WHERE id = 1 AND template_order_created IS NULL
    `)
    stmt.run(
      defaultWhatsAppTemplates.template_order_created,
      defaultWhatsAppTemplates.template_order_on_way,
      defaultWhatsAppTemplates.template_order_delivered,
      defaultWhatsAppTemplates.template_order_invoiced,
      defaultWhatsAppTemplates.template_order_cancelled,
      defaultWhatsAppTemplates.template_custom
    )
  } catch (error) {
    console.error('Error setting default WhatsApp templates:', error)
  }
  
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

