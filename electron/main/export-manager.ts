import { app, dialog } from 'electron'
import { getDB } from './database'
import path from 'path'
import fs from 'fs'

// Date formatter helper
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`
}

export class ExportManager {
  /**
   * Tüm veritabanı verilerini JSON formatında export eder
   */
  async exportAllData(): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const db = getDB()
      
      // Tüm tabloları export et
      const data = {
        exportDate: new Date().toISOString(),
        appVersion: app.getVersion(),
        orders: db.prepare('SELECT * FROM orders').all(),
        expenses: db.prepare('SELECT * FROM expenses').all(),
        invoices: db.prepare('SELECT * FROM invoices').all(),
        vehicles: db.prepare('SELECT * FROM vehicles').all(),
        routes: db.prepare('SELECT * FROM routes').all(),
        trailers: db.prepare('SELECT * FROM trailers').all(),
        trailer_loads: db.prepare('SELECT * FROM trailer_loads').all(),
        settings: db.prepare('SELECT * FROM settings').all(),
        mail_logs: db.prepare('SELECT * FROM mail_logs').all(),
      }
      
      // Kullanıcıya kayıt yerini seçtir
      const result = await dialog.showSaveDialog({
        title: 'Verileri Dışa Aktar',
        defaultPath: path.join(
          app.getPath('documents'),
          `nakliye-verileri-${formatDate(new Date())}.json`
        ),
        filters: [
          { name: 'JSON Dosyası', extensions: ['json'] }
        ]
      })
      
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Kullanıcı iptal etti' }
      }
      
      // JSON dosyasını kaydet
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
      
      return { success: true, path: result.filePath }
    } catch (error: any) {
      console.error('Export error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Siparişleri CSV formatında export eder
   */
  async exportOrdersToCSV(): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const db = getDB()
      const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[]
      
      // CSV başlıkları
      const headers = [
        'ID', 'Plaka', 'Müşteri', 'Telefon', 'Nereden', 'Nereye',
        'Yük Açıklaması', 'Başlangıç Fiyatı', 'Durum', 'Oluşturma Tarihi',
        'Gidiş KM', 'Dönüş KM', 'Efektif KM', 'Yakıt Maliyet',
        'Toplam Maliyet', 'Önerilen Fiyat', 'Kar/Zarar', 'Email'
      ]
      
      // CSV satırları
      const rows = orders.map(order => [
        order.id,
        order.plaka,
        order.musteri,
        order.telefon,
        order.nereden,
        order.nereye,
        order.yuk_aciklamasi || '',
        order.baslangic_fiyati,
        order.status,
        order.created_at,
        order.gidis_km || 0,
        order.donus_km || 0,
        order.etkin_km || 0,
        order.yakit_maliyet || 0,
        order.toplam_maliyet || 0,
        order.onerilen_fiyat || 0,
        order.kar_zarar || 0,
        order.customer_email || ''
      ])
      
      // CSV içeriği oluştur
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Virgül içeren hücreleri tırnak içine al
          const cellStr = String(cell)
          return cellStr.includes(',') ? `"${cellStr}"` : cellStr
        }).join(','))
      ].join('\n')
      
      // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
      const csvWithBOM = '\ufeff' + csvContent
      
      // Kullanıcıya kayıt yerini seçtir
      const result = await dialog.showSaveDialog({
        title: 'Siparişleri CSV Olarak Dışa Aktar',
        defaultPath: path.join(
          app.getPath('documents'),
          `siparisler-${formatDate(new Date())}.csv`
        ),
        filters: [
          { name: 'CSV Dosyası', extensions: ['csv'] }
        ]
      })
      
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Kullanıcı iptal etti' }
      }
      
      // CSV dosyasını kaydet
      fs.writeFileSync(result.filePath, csvWithBOM, 'utf-8')
      
      return { success: true, path: result.filePath }
    } catch (error: any) {
      console.error('CSV export error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Veritabanı dosyasını doğrudan kopyalar (yedekleme)
   */
  async exportDatabaseFile(): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const dbPath = path.join(app.getPath('userData'), 'transport.db')
      
      // Kullanıcıya kayıt yerini seçtir
      const result = await dialog.showSaveDialog({
        title: 'Veritabanını Yedekle',
        defaultPath: path.join(
          app.getPath('documents'),
          `transport-db-${formatDate(new Date())}.db`
        ),
        filters: [
          { name: 'SQLite Veritabanı', extensions: ['db'] }
        ]
      })
      
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Kullanıcı iptal etti' }
      }
      
      // Veritabanı dosyasını kopyala
      fs.copyFileSync(dbPath, result.filePath)
      
      return { success: true, path: result.filePath }
    } catch (error: any) {
      console.error('Database export error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * İstatistiksel rapor oluşturur
   */
  async exportStatisticsReport(): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const db = getDB()
      
      // İstatistikleri topla
      const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any
      const totalRevenue = db.prepare('SELECT SUM(baslangic_fiyati) as total FROM orders WHERE status != "İptal"').get() as any
      const totalCost = db.prepare('SELECT SUM(toplam_maliyet) as total FROM orders WHERE status != "İptal"').get() as any
      const totalProfit = db.prepare('SELECT SUM(kar_zarar) as total FROM orders WHERE status != "İptal"').get() as any
      
      const ordersByStatus = db.prepare(`
        SELECT status, COUNT(*) as count, SUM(baslangic_fiyati) as revenue
        FROM orders
        GROUP BY status
      `).all() as any[]
      
      const ordersByVehicle = db.prepare(`
        SELECT plaka, COUNT(*) as count, SUM(baslangic_fiyati) as revenue, SUM(kar_zarar) as profit
        FROM orders
        GROUP BY plaka
        ORDER BY count DESC
      `).all() as any[]
      
      const topRoutes = db.prepare(`
        SELECT nereden, nereye, COUNT(*) as count, AVG(baslangic_fiyati) as avg_price
        FROM orders
        GROUP BY nereden, nereye
        ORDER BY count DESC
        LIMIT 10
      `).all() as any[]
      
      const monthlyStats = db.prepare(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as order_count,
          SUM(baslangic_fiyati) as revenue,
          SUM(toplam_maliyet) as cost,
          SUM(kar_zarar) as profit
        FROM orders
        WHERE status != 'İptal'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `).all() as any[]
      
      // Rapor objesi
      const report = {
        exportDate: new Date().toISOString(),
        appVersion: app.getVersion(),
        summary: {
          totalOrders: totalOrders.count,
          totalRevenue: totalRevenue.total || 0,
          totalCost: totalCost.total || 0,
          totalProfit: totalProfit.total || 0,
          profitMargin: totalRevenue.total ? ((totalProfit.total / totalRevenue.total) * 100).toFixed(2) + '%' : '0%'
        },
        ordersByStatus,
        ordersByVehicle,
        topRoutes,
        monthlyStats
      }
      
      // Kullanıcıya kayıt yerini seçtir
      const result = await dialog.showSaveDialog({
        title: 'İstatistik Raporu Dışa Aktar',
        defaultPath: path.join(
          app.getPath('documents'),
          `istatistik-raporu-${formatDate(new Date())}.json`
        ),
        filters: [
          { name: 'JSON Dosyası', extensions: ['json'] }
        ]
      })
      
      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Kullanıcı iptal etti' }
      }
      
      // JSON dosyasını kaydet
      fs.writeFileSync(result.filePath, JSON.stringify(report, null, 2), 'utf-8')
      
      return { success: true, path: result.filePath }
    } catch (error: any) {
      console.error('Statistics export error:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Veritabanı verilerini içe aktarır (import)
   */
  async importData(filePath: string): Promise<{ success: boolean; imported?: number; error?: string }> {
    try {
      // JSON dosyasını oku
      const content = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content)
      
      const db = getDB()
      let importedCount = 0
      
      // Transaction başlat
      const transaction = db.transaction(() => {
        // Her tablo için import
        const tables = ['orders', 'expenses', 'invoices', 'vehicles', 'routes', 'trailers', 'trailer_loads']
        
        for (const table of tables) {
          if (data[table] && Array.isArray(data[table])) {
            for (const row of data[table]) {
              try {
                const columns = Object.keys(row).filter(key => key !== 'id')
                const placeholders = columns.map(() => '?').join(', ')
                const values = columns.map(col => row[col])
                
                db.prepare(`
                  INSERT OR REPLACE INTO ${table} (${columns.join(', ')})
                  VALUES (${placeholders})
                `).run(...values)
                
                importedCount++
              } catch (err) {
                console.error(`Error importing row to ${table}:`, err)
              }
            }
          }
        }
      })
      
      transaction()
      
      return { success: true, imported: importedCount }
    } catch (error: any) {
      console.error('Import error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Singleton instance
let exportManager: ExportManager | null = null

export const getExportManager = (): ExportManager => {
  if (!exportManager) {
    exportManager = new ExportManager()
  }
  return exportManager
}

