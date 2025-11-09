import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, getDB } from './database'
import { 
  ProfessionalCostCalculator, 
  DEFAULT_PROFESSIONAL_PARAMS, 
  type ProfessionalVehicleParams,
  type RouteInfo
} from './professional-cost-calculator'
import { BackupManager } from './backup'
import { getAdvancedLicenseManager } from './advanced-license-manager'
import { getMailService } from './mail-service'

// __dirname is available in CommonJS (esbuild handles this)

let backupManager: BackupManager | null = null

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../../dist/index.html')
    console.log('Loading app from:', indexPath)
    mainWindow.loadFile(indexPath)
    mainWindow.webContents.openDevTools() // Dev tools'u production'da da aç
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  // Initialize database
  initDatabase()
  
  // Initialize backup manager
  const dbPath = path.join(app.getPath('userData'), 'transport.db')
  backupManager = new BackupManager(dbPath)
  backupManager.startAutoBackup()
  
  // Initialize advanced license manager ve periyodik doğrulamayı başlat
  try {
    const licenseManager = await getAdvancedLicenseManager()
    const validation = await licenseManager.validateLicense()
    
    if (validation.valid) {
      console.log('✅ License valid - starting periodic verification')
      licenseManager.startPeriodicVerification()
    } else {
      console.log('⚠️ License not valid:', validation.reason)
    }
  } catch (error) {
    console.error('License initialization error:', error)
  }
  
  // Create window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Database IPC Handlers
ipcMain.handle('db:getOrders', async (_, filters) => {
  const db = getDB()
  try {
    let query = 'SELECT * FROM orders'
    const params: any[] = []
    
    if (filters?.status) {
      query += ' WHERE status = ?'
      params.push(filters.status)
    }
    
    if (filters?.search) {
      query += params.length ? ' AND' : ' WHERE'
      query += ' (plaka LIKE ? OR musteri LIKE ? OR telefon LIKE ?)'
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const stmt = db.prepare(query)
    return stmt.all(...params)
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
})

ipcMain.handle('db:getOrder', async (_, id) => {
  const db = getDB()
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    const expenses = db.prepare('SELECT * FROM expenses WHERE order_id = ? ORDER BY timestamp DESC').all(id)
    const invoices = db.prepare('SELECT * FROM invoices WHERE order_id = ?').all(id)
    
    return { order, expenses, invoices }
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
})

ipcMain.handle('db:createOrder', async (_, orderData) => {
  const db = getDB()
  try {
    const stmt = db.prepare(`
      INSERT INTO orders (
        plaka, musteri, telefon, customer_email, nereden, nereye, yuk_aciklamasi, baslangic_fiyati,
        gidis_km, donus_km, return_load_rate, etkin_km, tahmini_gun,
        yakit_litre, yakit_maliyet, surucu_maliyet, yemek_maliyet, hgs_maliyet, bakim_maliyet,
        toplam_maliyet, onerilen_fiyat, kar_zarar, kar_zarar_yuzde,
        is_subcontractor, subcontractor_company, subcontractor_vehicle, subcontractor_cost,
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    
    const result = stmt.run(
      orderData.plaka,
      orderData.musteri,
      orderData.telefon,
      orderData.customerEmail || null,
      orderData.nereden,
      orderData.nereye,
      orderData.yukAciklamasi,
      orderData.baslangicFiyati,
      orderData.gidisKm || 0,
      orderData.donusKm || 0,
      orderData.returnLoadRate || 0,
      orderData.etkinKm || 0,
      orderData.tahminiGun || 1,
      orderData.yakitLitre || 0,
      orderData.yakitMaliyet || 0,
      orderData.surucuMaliyet || 0,
      orderData.yemekMaliyet || 0,
      orderData.hgsMaliyet || 0,
      orderData.bakimMaliyet || 0,
      orderData.toplamMaliyet || 0,
      orderData.onerilenFiyat || 0,
      orderData.karZarar || 0,
      orderData.karZararYuzde || 0,
      orderData.isSubcontractor ? 1 : 0,
      orderData.subcontractorCompany || null,
      orderData.subcontractorVehicle || null,
      orderData.subcontractorCost || 0,
      'Bekliyor'
    )
    
    return { id: result.lastInsertRowid, success: true }
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
})

ipcMain.handle('db:updateOrder', async (_, id, orderData) => {
  const db = getDB()
  try {
    const stmt = db.prepare(`
      UPDATE orders 
      SET plaka = ?, musteri = ?, telefon = ?, customer_email = ?, nereden = ?, nereye = ?, 
          yuk_aciklamasi = ?, baslangic_fiyati = ?,
          gidis_km = ?, donus_km = ?, return_load_rate = ?, etkin_km = ?, tahmini_gun = ?,
          yakit_litre = ?, yakit_maliyet = ?, surucu_maliyet = ?, yemek_maliyet = ?, 
          hgs_maliyet = ?, bakim_maliyet = ?, toplam_maliyet = ?,
          onerilen_fiyat = ?, kar_zarar = ?, kar_zarar_yuzde = ?, status = ?,
          is_subcontractor = ?, subcontractor_company = ?, subcontractor_vehicle = ?, subcontractor_cost = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    
    stmt.run(
      orderData.plaka,
      orderData.musteri,
      orderData.telefon,
      orderData.customerEmail || null,
      orderData.nereden,
      orderData.nereye,
      orderData.yukAciklamasi,
      orderData.baslangicFiyati,
      orderData.gidisKm || 0,
      orderData.donusKm || 0,
      orderData.returnLoadRate || 0,
      orderData.etkinKm || 0,
      orderData.tahminiGun || 1,
      orderData.yakitLitre || 0,
      orderData.yakitMaliyet || 0,
      orderData.surucuMaliyet || 0,
      orderData.yemekMaliyet || 0,
      orderData.hgsMaliyet || 0,
      orderData.bakimMaliyet || 0,
      orderData.toplamMaliyet || 0,
      orderData.onerilenFiyat || 0,
      orderData.karZarar || 0,
      orderData.karZararYuzde || 0,
      orderData.status || 'Bekliyor',
      orderData.isSubcontractor ? 1 : 0,
      orderData.subcontractorCompany || null,
      orderData.subcontractorVehicle || null,
      orderData.subcontractorCost || 0,
      id
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
})

ipcMain.handle('db:updateOrderStatus', async (_, id, status) => {
  const db = getDB()
  try {
    const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
    stmt.run(status, id)
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
})

ipcMain.handle('db:deleteOrder', async (_, id) => {
  const db = getDB()
  try {
    db.prepare('DELETE FROM expenses WHERE order_id = ?').run(id)
    db.prepare('DELETE FROM invoices WHERE order_id = ?').run(id)
    db.prepare('DELETE FROM orders WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
})

ipcMain.handle('db:addExpense', async (_, expenseData) => {
  const db = getDB()
  try {
    const stmt = db.prepare(`
      INSERT INTO expenses (order_id, type, amount, description, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `)
    
    const result = stmt.run(
      expenseData.orderId,
      expenseData.type,
      expenseData.amount,
      expenseData.description
    )
    
    return { id: result.lastInsertRowid, success: true }
  } catch (error) {
    console.error('Error adding expense:', error)
    throw error
  }
})

ipcMain.handle('db:getExpenses', async (_, orderId) => {
  const db = getDB()
  try {
    return db.prepare('SELECT * FROM expenses WHERE order_id = ? ORDER BY timestamp DESC').all(orderId)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    throw error
  }
})

ipcMain.handle('db:deleteExpense', async (_, id) => {
  const db = getDB()
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw error
  }
})

ipcMain.handle('db:addInvoice', async (_, invoiceData) => {
  const db = getDB()
  try {
    const stmt = db.prepare(`
      INSERT INTO invoices (order_id, file_name, file_path, file_type, uploaded_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `)
    
    const result = stmt.run(
      invoiceData.orderId,
      invoiceData.fileName,
      invoiceData.filePath,
      invoiceData.fileType
    )
    
    return { id: result.lastInsertRowid, success: true }
  } catch (error) {
    console.error('Error adding invoice:', error)
    throw error
  }
})

ipcMain.handle('db:getInvoices', async (_, orderId) => {
  const db = getDB()
  try {
    return db.prepare('SELECT * FROM invoices WHERE order_id = ?').all(orderId)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
})

ipcMain.handle('db:deleteInvoice', async (_, id) => {
  const db = getDB()
  try {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw error
  }
})

ipcMain.handle('db:getMonthlyReport', async (_, year, month) => {
  const db = getDB()
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${String(month + 1).padStart(2, '0')}-01`
    
    // Total earnings from orders
    const earnings = db.prepare(`
      SELECT COALESCE(SUM(baslangic_fiyati), 0) as total
      FROM orders
      WHERE created_at >= ? AND created_at < ?
    `).get(startDate, endDate)
    
    // Total expenses (manuel eklenen)
    const expenses = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN orders o ON e.order_id = o.id
      WHERE o.created_at >= ? AND o.created_at < ?
    `).get(startDate, endDate)
    
    // Tahmini maliyetler (hesaplanan)
    const estimatedCosts = db.prepare(`
      SELECT COALESCE(SUM(toplam_maliyet), 0) as total
      FROM orders
      WHERE created_at >= ? AND created_at < ?
    `).get(startDate, endDate)
    
    // Orders by vehicle
    const byVehicle = db.prepare(`
      SELECT plaka, COUNT(*) as count, 
             SUM(baslangic_fiyati) as total,
             SUM(toplam_maliyet) as totalCost,
             (SUM(baslangic_fiyati) - SUM(toplam_maliyet)) as totalProfit
      FROM orders
      WHERE created_at >= ? AND created_at < ?
      GROUP BY plaka
      ORDER BY count DESC
    `).all(startDate, endDate)
    
    // Orders by customer
    const byCustomer = db.prepare(`
      SELECT musteri, COUNT(*) as count, SUM(baslangic_fiyati) as total
      FROM orders
      WHERE created_at >= ? AND created_at < ?
      GROUP BY musteri
      ORDER BY count DESC
    `).all(startDate, endDate)
    
    // Orders by status
    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= ? AND created_at < ?
      GROUP BY status
    `).all(startDate, endDate)
    
    const netIncome = (earnings as any).total - (expenses as any).total - (estimatedCosts as any).total
    const gercekKar = (earnings as any).total - (estimatedCosts as any).total  // Ek giderler hariç gerçek kâr
    const gercekKarMarji = (earnings as any).total > 0 ? (gercekKar / (earnings as any).total) * 100 : 0
    
    return {
      earnings: (earnings as any).total,
      expenses: (expenses as any).total,
      estimatedCosts: (estimatedCosts as any).total,
      netIncome: netIncome,
      gercekKar: gercekKar,
      gercekKarMarji: gercekKarMarji,
      byVehicle,
      byCustomer,
      byStatus,
    }
  } catch (error) {
    console.error('Error generating monthly report:', error)
    throw error
  }
})

ipcMain.handle('db:getDashboardStats', async () => {
  const db = getDB()
  try {
    // Temel sayılar
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()
    const activeOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?)').get('Yolda', 'Bekliyor')
    const completedOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('Teslim Edildi')
    
    const thisMonth = new Date()
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1)
    const thisMonthStart = `${thisMonth.getFullYear()}-${String(thisMonth.getMonth() + 1).padStart(2, '0')}-01`
    const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`
    const lastMonthEnd = thisMonthStart
    
    // Bu ay verileri
    const monthlyEarnings = db.prepare(`
      SELECT COALESCE(SUM(baslangic_fiyati), 0) as total
      FROM orders
      WHERE created_at >= ?
    `).get(thisMonthStart)
    
    const monthlyExpenses = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN orders o ON e.order_id = o.id
      WHERE o.created_at >= ?
    `).get(thisMonthStart)
    
    const monthlyEstimatedCosts = db.prepare(`
      SELECT COALESCE(SUM(toplam_maliyet), 0) as total
      FROM orders
      WHERE created_at >= ?
    `).get(thisMonthStart)
    
    // Geçen ay verileri (trend için)
    const lastMonthEarnings = db.prepare(`
      SELECT COALESCE(SUM(baslangic_fiyati), 0) as total
      FROM orders
      WHERE created_at >= ? AND created_at < ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const lastMonthExpenses = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN orders o ON e.order_id = o.id
      WHERE o.created_at >= ? AND o.created_at < ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const lastMonthEstimatedCosts = db.prepare(`
      SELECT COALESCE(SUM(toplam_maliyet), 0) as total
      FROM orders
      WHERE created_at >= ? AND created_at < ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const lastMonthOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE created_at >= ? AND created_at < ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const thisMonthOrders = db.prepare(`
      SELECT COUNT(*) as count FROM orders
      WHERE created_at >= ?
    `).get(thisMonthStart)
    
    // Son 30 gün günlük veriler (grafikler için)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysStart = thirtyDaysAgo.toISOString().split('T')[0]
    
    const dailyData = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(baslangic_fiyati), 0) as earnings,
        COALESCE(SUM(toplam_maliyet), 0) as costs
      FROM orders
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(thirtyDaysStart)
    
    // Son 7 gün günlük veriler
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysStart = sevenDaysAgo.toISOString().split('T')[0]
    
    const weeklyData = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(baslangic_fiyati), 0) as earnings,
        COALESCE(SUM(toplam_maliyet), 0) as costs
      FROM orders
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(sevenDaysStart)
    
    // En çok çalışan araçlar (bu ay)
    const topVehicles = db.prepare(`
      SELECT 
        plaka,
        COUNT(*) as orderCount,
        SUM(baslangic_fiyati) as totalEarnings,
        SUM(toplam_maliyet) as totalCosts,
        SUM(kar_zarar) as totalProfit
      FROM orders
      WHERE created_at >= ?
      GROUP BY plaka
      ORDER BY orderCount DESC
      LIMIT 5
    `).all(thisMonthStart)
    
    // Durum dağılımı
    const statusDistribution = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(baslangic_fiyati) as totalValue
      FROM orders
      GROUP BY status
    `).all()
    
    // Yaklaşan teslimatlar
    const upcomingDeliveries = db.prepare(`
      SELECT * FROM orders
      WHERE status IN ('Yolda', 'Bekliyor')
      ORDER BY created_at ASC
      LIMIT 5
    `).all()
    
    // Son siparişler
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all()
    
    // Trend hesaplamaları
    const earningsTrend = (lastMonthEarnings as any).total > 0 
      ? (((monthlyEarnings as any).total - (lastMonthEarnings as any).total) / (lastMonthEarnings as any).total) * 100 
      : 0
    
    const expensesTrend = (lastMonthExpenses as any).total > 0
      ? (((monthlyExpenses as any).total - (lastMonthExpenses as any).total) / (lastMonthExpenses as any).total) * 100
      : 0
    
    const ordersTrend = (lastMonthOrders as any).count > 0
      ? (((thisMonthOrders as any).count - (lastMonthOrders as any).count) / (lastMonthOrders as any).count) * 100
      : 0
    
    const netIncome = (monthlyEarnings as any).total - (monthlyExpenses as any).total - (monthlyEstimatedCosts as any).total
    const lastMonthNetIncome = (lastMonthEarnings as any).total - (lastMonthExpenses as any).total - (lastMonthEstimatedCosts as any).total
    const netIncomeTrend = lastMonthNetIncome !== 0
      ? ((netIncome - lastMonthNetIncome) / Math.abs(lastMonthNetIncome)) * 100
      : 0
    
    // Toplam aktif araç sayısı
    const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles WHERE aktif = 1').get()
    
    return {
      // Temel istatistikler
      totalOrders: (totalOrders as any).count,
      activeOrders: (activeOrders as any).count,
      completedOrders: (completedOrders as any).count,
      totalVehicles: (totalVehicles as any).count,
      
      // Mali veriler
      monthlyEarnings: (monthlyEarnings as any).total,
      monthlyExpenses: (monthlyExpenses as any).total,
      monthlyEstimatedCosts: (monthlyEstimatedCosts as any).total,
      monthlyNetIncome: netIncome,
      
      // Trend verileri
      earningsTrend,
      expensesTrend,
      ordersTrend,
      netIncomeTrend,
      
      // Grafikler için veriler
      dailyData,
      weeklyData,
      topVehicles,
      statusDistribution,
      
      // Listeler
      upcomingDeliveries,
      recentOrders,
      
      // Geçen ay karşılaştırma
      lastMonthEarnings: (lastMonthEarnings as any).total,
      lastMonthExpenses: (lastMonthExpenses as any).total,
      lastMonthNetIncome,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
})

// File operations
ipcMain.handle('fs:saveFile', async (_, fileData) => {
  try {
    const fs = await import('fs/promises')
    const uploadsDir = path.join(app.getPath('userData'), 'uploads')
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.mkdir(uploadsDir, { recursive: true })
    } catch (err) {
      // Directory already exists
    }
    
    const fileName = `${Date.now()}_${fileData.name}`
    const filePath = path.join(uploadsDir, fileName)
    
    // Decode base64 and save file
    const buffer = Buffer.from(fileData.data, 'base64')
    await fs.writeFile(filePath, buffer)
    
    return { filePath, fileName, success: true }
  } catch (error) {
    console.error('Error saving file:', error)
    throw error
  }
})

ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    const fs = await import('fs/promises')
    const buffer = await fs.readFile(filePath)
    return buffer.toString('base64')
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

ipcMain.handle('fs:deleteFile', async (_, filePath) => {
  try {
    const fs = await import('fs/promises')
    await fs.unlink(filePath)
    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
})

ipcMain.handle('app:getPath', async (_, name) => {
  return app.getPath(name as any)
})

// ==================== BACKUP İŞLEMLERİ ====================

ipcMain.handle('backup:create', async () => {
  try {
    if (!backupManager) throw new Error('Backup manager not initialized')
    const backupPath = await backupManager.createBackup()
    return { success: true, path: backupPath }
  } catch (error) {
    console.error('Error creating backup:', error)
    throw error
  }
})

ipcMain.handle('backup:list', async () => {
  try {
    if (!backupManager) throw new Error('Backup manager not initialized')
    return await backupManager.listBackups()
  } catch (error) {
    console.error('Error listing backups:', error)
    throw error
  }
})

ipcMain.handle('backup:restore', async (_, backupPath) => {
  try {
    if (!backupManager) throw new Error('Backup manager not initialized')
    await backupManager.restoreBackup(backupPath)
    return { success: true }
  } catch (error) {
    console.error('Error restoring backup:', error)
    throw error
  }
})

ipcMain.handle('backup:delete', async (_, backupPath) => {
  try {
    if (!backupManager) throw new Error('Backup manager not initialized')
    await backupManager.deleteBackup(backupPath)
    return { success: true }
  } catch (error) {
    console.error('Error deleting backup:', error)
    throw error
  }
})

// ==================== GÜZERGAH YÖNETİMİ ====================

ipcMain.handle('db:getRoutes', async () => {
  const db = getDB()
  try {
    return db.prepare('SELECT * FROM routes WHERE aktif = 1 ORDER BY nereden, nereye').all()
  } catch (error) {
    console.error('Error fetching routes:', error)
    throw error
  }
})

ipcMain.handle('db:getRoute', async (_, nereden, nereye) => {
  const db = getDB()
  try {
    return db.prepare('SELECT * FROM routes WHERE nereden = ? AND nereye = ? AND aktif = 1').get(nereden, nereye)
  } catch (error) {
    console.error('Error fetching route:', error)
    return null
  }
})

ipcMain.handle('db:saveRoute', async (_, routeData) => {
  const db = getDB()
  try {
    const existing = db.prepare('SELECT id FROM routes WHERE nereden = ? AND nereye = ?').get(
      routeData.nereden, routeData.nereye
    )
    
    if (existing) {
      // Güncelle
      db.prepare(`
        UPDATE routes SET
          mesafe_km = ?, hgs_maliyet = ?, kopru_maliyet = ?, sure_saat = ?, notlar = ?,
          updated_at = datetime('now')
        WHERE nereden = ? AND nereye = ?
      `).run(
        routeData.mesafeKm, routeData.hgsMaliyet, routeData.kopruMaliyet, 
        routeData.sureSaat, routeData.notlar,
        routeData.nereden, routeData.nereye
      )
    } else {
      // Yeni kayıt
      db.prepare(`
        INSERT INTO routes (nereden, nereye, mesafe_km, hgs_maliyet, kopru_maliyet, sure_saat, notlar)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        routeData.nereden, routeData.nereye, routeData.mesafeKm, 
        routeData.hgsMaliyet, routeData.kopruMaliyet, routeData.sureSaat, routeData.notlar
      )
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving route:', error)
    throw error
  }
})

ipcMain.handle('db:deleteRoute', async (_, id) => {
  const db = getDB()
  try {
    db.prepare('DELETE FROM routes WHERE id = ?').run(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting route:', error)
    throw error
  }
})

// ==================== YENİ: ARAÇ ve MALİYET HESAPLAMALARI ====================

// Araç bilgilerini getir veya varsayılan parametreleri döndür (PROFESYONEL)
ipcMain.handle('db:getVehicleParams', async (_, plaka) => {
  const db = getDB()
  try {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE plaka = ? AND aktif = 1').get(plaka)
    
    if (vehicle) {
      return {
        yakitTuketimi: vehicle.yakit_tuketimi,
        yakitFiyati: vehicle.yakit_fiyati,
        gunlukUcret: vehicle.gunluk_ucret,
        gunlukOrtKm: vehicle.gunluk_ort_km,
        yemekGunluk: vehicle.yemek_gunluk,
        yagDegisimMaliyet: vehicle.yag_maliyet,
        yagDegisimAralik: vehicle.yag_aralik,
        lastikMaliyet: vehicle.lastik_maliyet,
        lastikOmur: vehicle.lastik_omur,
        buyukBakimMaliyet: vehicle.buyuk_bakim_maliyet,
        buyukBakimAralik: vehicle.buyuk_bakim_aralik,
        ufakOnarimAylik: vehicle.ufak_onarim_aylik,
        hgsPerKm: vehicle.hgs_per_km,
        karOrani: vehicle.kar_orani,
        kdv: vehicle.kdv,
      } as ProfessionalVehicleParams
    }
    
    // Araç yoksa varsayılan parametreleri döndür
    return DEFAULT_PROFESSIONAL_PARAMS
  } catch (error) {
    console.error('Error fetching vehicle params:', error)
    return DEFAULT_PROFESSIONAL_PARAMS
  }
})

// Araç kaydet/güncelle (PROFESYONEL PARAMETRELER)
ipcMain.handle('db:saveVehicle', async (_, vehicleData) => {
  const db = getDB()
  try {
    const existing = db.prepare('SELECT id FROM vehicles WHERE plaka = ?').get(vehicleData.plaka)
    
    if (existing) {
      // Güncelle
      db.prepare(`
        UPDATE vehicles SET
          yakit_tuketimi = ?, yakit_fiyati = ?, gunluk_ucret = ?, gunluk_ort_km = ?,
          yemek_gunluk = ?, yag_maliyet = ?, yag_aralik = ?, lastik_maliyet = ?,
          lastik_omur = ?, buyuk_bakim_maliyet = ?, buyuk_bakim_aralik = ?,
          ufak_onarim_aylik = ?, sigorta_yillik = ?, mtv_yillik = ?, muayene_yillik = ?,
          kar_orani = ?, kdv = ?, arac_degeri = ?, amorti_sure_yil = ?, hedef_toplam_km = ?,
          updated_at = datetime('now')
        WHERE plaka = ?
      `).run(
        vehicleData.yakitTuketimi, vehicleData.yakitFiyati, vehicleData.gunlukUcret, vehicleData.gunlukOrtKm,
        vehicleData.yemekGunluk, vehicleData.yagMaliyet, vehicleData.yagAralik, vehicleData.lastikMaliyet,
        vehicleData.lastikOmur, vehicleData.buyukBakimMaliyet, vehicleData.buyukBakimAralik,
        vehicleData.ufakOnarimAylik, vehicleData.sigortaYillik, vehicleData.mtvYillik, vehicleData.muayeneYillik,
        vehicleData.karOrani, vehicleData.kdv,
        vehicleData.aracDegeri || 2300000, vehicleData.amortiSureYil || 2, vehicleData.hedefToplamKm || 72000,
        vehicleData.plaka
      )
    } else {
      // Yeni kayıt
      db.prepare(`
        INSERT INTO vehicles (
          plaka, yakit_tuketimi, yakit_fiyati, gunluk_ucret, gunluk_ort_km,
          yemek_gunluk, yag_maliyet, yag_aralik, lastik_maliyet,
          lastik_omur, buyuk_bakim_maliyet, buyuk_bakim_aralik,
          ufak_onarim_aylik, sigorta_yillik, mtv_yillik, muayene_yillik,
          kar_orani, kdv, arac_degeri, amorti_sure_yil, hedef_toplam_km
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        vehicleData.plaka, vehicleData.yakitTuketimi, vehicleData.yakitFiyati, vehicleData.gunlukUcret, vehicleData.gunlukOrtKm,
        vehicleData.yemekGunluk, vehicleData.yagMaliyet, vehicleData.yagAralik, vehicleData.lastikMaliyet,
        vehicleData.lastikOmur, vehicleData.buyukBakimMaliyet, vehicleData.buyukBakimAralik,
        vehicleData.ufakOnarimAylik, vehicleData.sigortaYillik, vehicleData.mtvYillik, vehicleData.muayeneYillik,
        vehicleData.karOrani, vehicleData.kdv,
        vehicleData.aracDegeri || 2300000, vehicleData.amortiSureYil || 2, vehicleData.hedefToplamKm || 72000
      )
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error saving vehicle:', error)
    throw error
  }
})

// Tüm araçları getir
ipcMain.handle('db:getVehicles', async () => {
  const db = getDB()
  try {
    return db.prepare('SELECT * FROM vehicles WHERE aktif = 1 ORDER BY plaka').all()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    throw error
  }
})

// Maliyet analizi yap (PROFESYONEL)
ipcMain.handle('cost:analyze', async (_, orderData) => {
  try {
    // Araç parametrelerini al
    const db = getDB()
    let params: ProfessionalVehicleParams = DEFAULT_PROFESSIONAL_PARAMS
    
    if (orderData.plaka) {
      const vehicle = db.prepare('SELECT * FROM vehicles WHERE plaka = ? AND aktif = 1').get(orderData.plaka)
      if (vehicle) {
        params = {
          yakitTuketimi: vehicle.yakit_tuketimi || 25,
          yakitFiyati: vehicle.yakit_fiyati || 40,
          gunlukUcret: vehicle.gunluk_ucret || 1600,
          gunlukOrtKm: vehicle.gunluk_ort_km || 500,
          yemekGunluk: vehicle.yemek_gunluk || 150,
          yagDegisimMaliyet: vehicle.yag_maliyet || 500,
          yagDegisimAralik: vehicle.yag_aralik || 5000,
          lastikMaliyet: vehicle.lastik_maliyet || 8000,
          lastikOmur: vehicle.lastik_omur || 50000,
          buyukBakimMaliyet: vehicle.buyuk_bakim_maliyet || 3000,
          buyukBakimAralik: vehicle.buyuk_bakim_aralik || 15000,
          ufakOnarimAylik: vehicle.ufak_onarim_aylik || 200,
          sigorta: vehicle.sigorta_yillik || 12000,
          mtv: vehicle.mtv_yillik || 5000,
          muayene: vehicle.muayene_yillik || 1500,
          karOrani: vehicle.kar_orani || 0.45,
          kdv: vehicle.kdv || 0.20,
        }
      }
    }
    
    // Database'den güzergah bilgisini al
    let routeFromDB = null
    if (orderData.nereden && orderData.nereye) {
      routeFromDB = db.prepare('SELECT * FROM routes WHERE nereden = ? AND nereye = ? AND aktif = 1').get(
        orderData.nereden, orderData.nereye
      )
    }
    
    const calculator = new ProfessionalCostCalculator(params)
    const route: RouteInfo = {
      nereden: orderData.nereden || '',
      nereye: orderData.nereye || '',
      gidisKm: orderData.gidisKm || (routeFromDB?.mesafe_km || 0),
      donusKm: orderData.donusKm || 0,
      returnLoadRate: orderData.returnLoadRate || 0,
      tahminiGun: orderData.tahminiGun || Math.max(1, Math.ceil((orderData.gidisKm || 0) / (params.gunlukOrtKm || 500))),
    }
    
    const analysis = calculator.analyzeDetailedCost(route, orderData.ilkFiyat || 0, routeFromDB)
    
    return analysis
  } catch (error) {
    console.error('Error analyzing cost:', error)
    throw error
  }
})

// Önerilen fiyat hesapla (PROFESYONEL)
// Not: Bu fonksiyon cost:analyze ile birleştirildi, ama geriye uyumluluk için kalıyor
ipcMain.handle('cost:calculateRecommended', async (_, orderData) => {
  try {
    // cost:analyze kullan ve sadece önerilen fiyatları döndür
    const analysis = await ipcMain.emit('cost:analyze', {}, orderData)
    return {
      recommended: analysis.fiyatKdvli || 0,
      breakEven: analysis.onerilenMinFiyat || 0
    }
  } catch (error) {
    console.error('Error calculating recommended price:', error)
    throw error
  }
})

// Km başı maliyet detayını getir (basit özet)
ipcMain.handle('cost:getBreakdown', async (_, plaka) => {
  try {
    const db = getDB()
    let params: ProfessionalVehicleParams = DEFAULT_PROFESSIONAL_PARAMS
    
    if (plaka) {
      const vehicle = db.prepare('SELECT * FROM vehicles WHERE plaka = ? AND aktif = 1').get(plaka)
      if (vehicle) {
        params = {
          yakitTuketimi: vehicle.yakit_tuketimi || 25,
          yakitFiyati: vehicle.yakit_fiyati || 40,
          gunlukUcret: vehicle.gunluk_ucret || 1600,
          gunlukOrtKm: vehicle.gunluk_ort_km || 500,
          yemekGunluk: vehicle.yemek_gunluk || 150,
          yagDegisimMaliyet: vehicle.yag_maliyet || 500,
          yagDegisimAralik: vehicle.yag_aralik || 5000,
          lastikMaliyet: vehicle.lastik_maliyet || 8000,
          lastikOmur: vehicle.lastik_omur || 50000,
          buyukBakimMaliyet: vehicle.buyuk_bakim_maliyet || 3000,
          buyukBakimAralik: vehicle.buyuk_bakim_aralik || 15000,
          ufakOnarimAylik: vehicle.ufak_onarim_aylik || 200,
          sigorta: vehicle.sigorta_yillik || 12000,
          mtv: vehicle.mtv_yillik || 5000,
          muayene: vehicle.muayene_yillik || 1500,
          karOrani: vehicle.kar_orani || 0.45,
          kdv: vehicle.kdv || 0.20,
        }
      }
    }
    
    // Bu özet, Araçlar sayfasındaki kartlarla birebir aynı hesap olsun diye
    // doğrudan parametre bazlı per-km formülü kullanır (100 km/gün varsayımı YOK)
    const yakitPerKm = (params.yakitTuketimi * params.yakitFiyati) / 100
    const surucuPerKm = params.gunlukUcret / params.gunlukOrtKm
    const yemekPerKm = params.yemekGunluk / params.gunlukOrtKm
    // Araçlar sayfasıyla tutarlılık: bakım per-km = yağ + lastik + büyük bakım; ufak onarım kartlara dahil değil
    const bakimPerKm = 
      (params.yagDegisimMaliyet / params.yagDegisimAralik) +
      (params.lastikMaliyet / params.lastikOmur) +
      (params.buyukBakimMaliyet / params.buyukBakimAralik)
    // HGS/km yerine 0 kullanıyoruz çünkü HGS güzergah bazlı hesaplanıyor, sabit km başına değil
    const hgsPerKm = 0
    
    const toplamPerKm = yakitPerKm + surucuPerKm + yemekPerKm + bakimPerKm + hgsPerKm
    
    return {
      yakitPerKm,
      surucuPerKm,
      yemekPerKm,
      bakimPerKm,
      hgsPerKm,
      toplamMaliyetPerKm: toplamPerKm,
      // Eski format uyumluluk
      benzinPerKm: yakitPerKm,
      driverPerKm: surucuPerKm,
      ekMasrafPerKm: yemekPerKm + hgsPerKm,
      amortPerKm: 0,
    }
  } catch (error) {
    console.error('Error getting cost breakdown:', error)
    throw error
  }
})

// ==================== ADVANCED LICENSE HANDLERS ====================

// Hardware Fingerprint al
ipcMain.handle('license:getMachineId', async () => {
  try {
    const licenseManager = await getAdvancedLicenseManager()
    const hwFingerprint = await licenseManager.getHardwareFingerprint()
    return { success: true, machineId: hwFingerprint }
  } catch (error) {
    console.error('Error getting hardware fingerprint:', error)
    return { success: false, error: 'Hardware fingerprint alınamadı' }
  }
})

// Lisans durumunu kontrol et (Gelişmiş)
ipcMain.handle('license:validate', async () => {
  try {
    const licenseManager = await getAdvancedLicenseManager()
    const validation = await licenseManager.validateLicense()
    return validation
  } catch (error) {
    console.error('Error validating license:', error)
    return { valid: false, reason: 'Lisans doğrulama hatası' }
  }
})

// Lisansı aktive et (Gelişmiş)
ipcMain.handle('license:activate', async (_, licenseKey: string, companyName: string, email: string) => {
  try {
    const licenseManager = await getAdvancedLicenseManager()
    const result = await licenseManager.activateLicense(licenseKey, companyName, email)
    return result
  } catch (error) {
    console.error('Error activating license:', error)
    return { success: false, message: 'Aktivasyon sırasında bir hata oluştu' }
  }
})

// Lisans bilgilerini al (Gelişmiş)
ipcMain.handle('license:getInfo', async () => {
  try {
    const licenseManager = await getAdvancedLicenseManager()
    return await licenseManager.getLicenseInfo()
  } catch (error) {
    console.error('Error getting license info:', error)
    return { licensed: false }
  }
})

// Lisansı deaktive et (Gelişmiş)
ipcMain.handle('license:deactivate', async () => {
  try {
    const licenseManager = await getAdvancedLicenseManager()
    const result = licenseManager.deactivateLicense()
    return { success: result }
  } catch (error) {
    console.error('Error deactivating license:', error)
    return { success: false }
  }
})

// ============================================
// DORSE (TRAILER) OPERATIONS
// ============================================

ipcMain.handle('db:getTrailers', async () => {
  const db = getDB()
  try {
    const trailers = db.prepare('SELECT * FROM trailers WHERE aktif = 1 ORDER BY created_at DESC').all()
    return trailers
  } catch (error) {
    console.error('Error getting trailers:', error)
    throw error
  }
})

ipcMain.handle('db:getTrailer', async (_, id) => {
  const db = getDB()
  try {
    const trailer = db.prepare('SELECT * FROM trailers WHERE id = ?').get(id)
    return trailer
  } catch (error) {
    console.error('Error getting trailer:', error)
    throw error
  }
})

ipcMain.handle('db:createTrailer', async (_, trailerData) => {
  const db = getDB()
  try {
    console.log('🚛 Creating trailer with data:', trailerData)
    
    // Hacim hesapla (cm³ to m³)
    const hacim_m3 = (trailerData.enCm * trailerData.boyCm * trailerData.yukseklikCm) / 1000000
    console.log('📊 Calculated hacim_m3:', hacim_m3)
    
    // Önce tablo yapısını kontrol et
    const tableInfo = db.prepare("PRAGMA table_info(trailers)").all()
    console.log('📋 Trailers table columns:', tableInfo.map((col: any) => col.name).join(', '))
    
    const stmt = db.prepare(`
      INSERT INTO trailers (
        dorse_no, en_cm, boy_cm, yukseklik_cm, hacim_m3,
        max_agirlik_ton, mevcut_agirlik_ton, mevcut_hacim_m3,
        durum, lokasyon, arac_plakasi, tip, notlar,
        aktif, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `)
    
    const result = stmt.run(
      trailerData.dorseNo,
      trailerData.enCm,
      trailerData.boyCm,
      trailerData.yukseklikCm,
      hacim_m3,
      trailerData.maxAgirlikTon || 0,
      trailerData.durum || 'Boş',
      trailerData.lokasyon || '',
      trailerData.aracPlakasi || '',
      trailerData.tip || 'Kapalı',
      trailerData.notlar || ''
    )
    
    console.log('✅ Trailer created successfully with ID:', result.lastInsertRowid)
    return { id: result.lastInsertRowid, success: true }
  } catch (error) {
    console.error('❌ Error creating trailer:', error)
    console.error('Stack trace:', (error as Error).stack)
    throw error
  }
})

ipcMain.handle('db:updateTrailer', async (_, id, trailerData) => {
  const db = getDB()
  try {
    // Hacim hesapla (cm³ to m³)
    const hacim_m3 = (trailerData.enCm * trailerData.boyCm * trailerData.yukseklikCm) / 1000000
    
    const stmt = db.prepare(`
      UPDATE trailers 
      SET dorse_no = ?, en_cm = ?, boy_cm = ?, yukseklik_cm = ?, hacim_m3 = ?,
          max_agirlik_ton = ?, lokasyon = ?, arac_plakasi = ?, tip = ?, notlar = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    
    stmt.run(
      trailerData.dorseNo,
      trailerData.enCm,
      trailerData.boyCm,
      trailerData.yukseklikCm,
      hacim_m3,
      trailerData.maxAgirlikTon || 0,
      trailerData.lokasyon || '',
      trailerData.aracPlakasi || '',
      trailerData.tip || 'Kapalı',
      trailerData.notlar || '',
      id
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error updating trailer:', error)
    throw error
  }
})

ipcMain.handle('db:deleteTrailer', async (_, id) => {
  const db = getDB()
  try {
    // Soft delete
    const stmt = db.prepare('UPDATE trailers SET aktif = 0, updated_at = datetime(\'now\') WHERE id = ?')
    stmt.run(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting trailer:', error)
    throw error
  }
})

// ============================================
// TRAILER LOADS (Dorse Yükleri) OPERATIONS
// ============================================

ipcMain.handle('db:getTrailerLoads', async (_, trailerId) => {
  const db = getDB()
  try {
    const loads = db.prepare('SELECT * FROM trailer_loads WHERE trailer_id = ? ORDER BY yukleme_sirasi, yukleme_tarihi').all(trailerId)
    return loads
  } catch (error) {
    console.error('Error getting trailer loads:', error)
    throw error
  }
})

ipcMain.handle('db:addTrailerLoad', async (_, loadData) => {
  const db = getDB()
  try {
    // Hacim hesapla (cm³ to m³)
    const hacim_m3 = (loadData.enCm * loadData.boyCm * loadData.yukseklikCm) / 1000000
    
    const stmt = db.prepare(`
      INSERT INTO trailer_loads (
        trailer_id, musteri_adi, yuk_aciklamasi,
        en_cm, boy_cm, yukseklik_cm, hacim_m3,
        agirlik_ton, yuk_tipi, bosaltma_noktasi, notlar
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      loadData.trailerId,
      loadData.musteriAdi,
      loadData.yukAciklamasi || '',
      loadData.enCm,
      loadData.boyCm,
      loadData.yukseklikCm,
      hacim_m3,
      loadData.agirlikTon || 0,
      loadData.yukTipi || 'Normal',
      loadData.bosaltmaNoktasi || '',
      loadData.notlar || ''
    )
    
    // Dorse'nin mevcut hacim ve ağırlığını güncelle
    // Önce mevcut değerleri al
    const trailer = db.prepare('SELECT * FROM trailers WHERE id = ?').get(loadData.trailerId)
    if (trailer) {
      const yeniHacim = (trailer.mevcut_hacim_m3 || 0) + hacim_m3
      const yeniAgirlik = (trailer.mevcut_agirlik_ton || 0) + (loadData.agirlikTon || 0)
      const toplamHacim = trailer.hacim_m3 || 0
      
      let yeniDurum = 'Boş'
      if (yeniHacim >= toplamHacim * 0.9) {
        yeniDurum = 'Dolu'
      } else if (yeniHacim > 0) {
        yeniDurum = 'Kısmi Dolu'
      }
      
      db.prepare(`
        UPDATE trailers 
        SET mevcut_hacim_m3 = ?,
            mevcut_agirlik_ton = ?,
            durum = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(yeniHacim, yeniAgirlik, yeniDurum, loadData.trailerId)
    }
    
    return { id: result.lastInsertRowid, success: true }
  } catch (error) {
    console.error('Error adding trailer load:', error)
    throw error
  }
})

ipcMain.handle('db:deleteTrailerLoad', async (_, id) => {
  const db = getDB()
  try {
    // Önce yük bilgisini al
    const load = db.prepare('SELECT * FROM trailer_loads WHERE id = ?').get(id)
    
    if (load) {
      // Yükü sil
      db.prepare('DELETE FROM trailer_loads WHERE id = ?').run(id)
      
      // Dorse'nin mevcut hacim ve ağırlığını güncelle
      const trailer = db.prepare('SELECT * FROM trailers WHERE id = ?').get(load.trailer_id)
      if (trailer) {
        const yeniHacim = Math.max(0, (trailer.mevcut_hacim_m3 || 0) - load.hacim_m3)
        const yeniAgirlik = Math.max(0, (trailer.mevcut_agirlik_ton || 0) - load.agirlik_ton)
        const toplamHacim = trailer.hacim_m3 || 0
        
        let yeniDurum = 'Boş'
        if (yeniHacim <= 0) {
          yeniDurum = 'Boş'
        } else if (yeniHacim >= toplamHacim * 0.9) {
          yeniDurum = 'Dolu'
        } else {
          yeniDurum = 'Kısmi Dolu'
        }
        
        db.prepare(`
          UPDATE trailers 
          SET mevcut_hacim_m3 = ?,
              mevcut_agirlik_ton = ?,
              durum = ?,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(yeniHacim, yeniAgirlik, yeniDurum, load.trailer_id)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting trailer load:', error)
    throw error
  }
})

ipcMain.handle('db:checkTrailerCapacity', async (_, trailerId, enCm, boyCm, yukseklikCm, agirlikTon) => {
  const db = getDB()
  try {
    const trailer = db.prepare('SELECT * FROM trailers WHERE id = ?').get(trailerId)
    
    if (!trailer) {
      return { fits: false, message: 'Dorse bulunamadı' }
    }
    
    // Yeni yükün hacmini hesapla (m³)
    const yeniHacim = (enCm * boyCm * yukseklikCm) / 1000000
    
    // Kontroller
    const kalanHacim = trailer.hacim_m3 - trailer.mevcut_hacim_m3
    const kalanAgirlik = trailer.max_agirlik_ton - trailer.mevcut_agirlik_ton
    
    const hacimSigar = yeniHacim <= kalanHacim
    const agirlikSigar = agirlikTon <= kalanAgirlik
    
    const yuzdeHacimKullanim = ((trailer.mevcut_hacim_m3 + yeniHacim) / trailer.hacim_m3) * 100
    const yuzdeAgirlikKullanim = ((trailer.mevcut_agirlik_ton + agirlikTon) / trailer.max_agirlik_ton) * 100
    
    return {
      fits: hacimSigar && agirlikSigar,
      hacimSigar,
      agirlikSigar,
      kalanHacim,
      kalanAgirlik,
      yuzdeHacimKullanim: Math.min(100, yuzdeHacimKullanim),
      yuzdeAgirlikKullanim: Math.min(100, yuzdeAgirlikKullanim),
      trailer: {
        dorseNo: trailer.dorse_no,
        toplamHacim: trailer.hacim_m3,
        toplamAgirlik: trailer.max_agirlik_ton,
        mevcutHacim: trailer.mevcut_hacim_m3,
        mevcutAgirlik: trailer.mevcut_agirlik_ton
      }
    }
  } catch (error) {
    console.error('Error checking trailer capacity:', error)
    throw error
  }
})

// ============================================================================
// MAIL OPERATIONS
// ============================================================================

// Mail ayarlarını getir
ipcMain.handle('mail:getSettings', async () => {
  const db = getDB()
  try {
    const settings = db.prepare('SELECT * FROM mail_settings WHERE id = 1').get()
    return settings || null
  } catch (error) {
    console.error('Error getting mail settings:', error)
    throw error
  }
})

// Mail ayarlarını kaydet
ipcMain.handle('mail:saveSettings', async (_, settings) => {
  const db = getDB()
  try {
    db.prepare(`
      INSERT OR REPLACE INTO mail_settings (
        id, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password,
        from_email, from_name, enabled, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      settings.smtp_host,
      settings.smtp_port,
      settings.smtp_secure ? 1 : 0,
      settings.smtp_user,
      settings.smtp_password,
      settings.from_email,
      settings.from_name,
      settings.enabled ? 1 : 0
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error saving mail settings:', error)
    throw error
  }
})

// SMTP bağlantısını test et
ipcMain.handle('mail:testConnection', async () => {
  try {
    const mailService = getMailService()
    const result = await mailService.testConnection()
    return result
  } catch (error: any) {
    console.error('Error testing mail connection:', error)
    return { success: false, message: error.message }
  }
})

// Sipariş maili gönder
ipcMain.handle('mail:sendOrderEmail', async (_, recipientEmail, orderData, pdfPath) => {
  try {
    const mailService = getMailService()
    const result = await mailService.sendOrderEmail(recipientEmail, orderData, pdfPath)
    return result
  } catch (error: any) {
    console.error('Error sending order email:', error)
    return { success: false, message: error.message }
  }
})

// Mail loglarını getir
ipcMain.handle('mail:getLogs', async (_, orderId) => {
  const db = getDB()
  try {
    if (orderId) {
      return db.prepare('SELECT * FROM mail_logs WHERE order_id = ? ORDER BY sent_at DESC').all(orderId)
    } else {
      return db.prepare('SELECT * FROM mail_logs ORDER BY sent_at DESC LIMIT 100').all()
    }
  } catch (error) {
    console.error('Error getting mail logs:', error)
    throw error
  }
})

