import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, getDB } from './database'

// __dirname is available in CommonJS (esbuild handles this)

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
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Initialize database
  initDatabase()
  
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
      INSERT INTO orders (plaka, musteri, telefon, nereden, nereye, yuk_aciklamasi, baslangic_fiyati, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    
    const result = stmt.run(
      orderData.plaka,
      orderData.musteri,
      orderData.telefon,
      orderData.nereden,
      orderData.nereye,
      orderData.yukAciklamasi,
      orderData.baslangicFiyati,
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
      SET plaka = ?, musteri = ?, telefon = ?, nereden = ?, nereye = ?, 
          yuk_aciklamasi = ?, baslangic_fiyati = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    
    stmt.run(
      orderData.plaka,
      orderData.musteri,
      orderData.telefon,
      orderData.nereden,
      orderData.nereye,
      orderData.yukAciklamasi,
      orderData.baslangicFiyati,
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
    
    // Total expenses
    const expenses = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN orders o ON e.order_id = o.id
      WHERE o.created_at >= ? AND o.created_at < ?
    `).get(startDate, endDate)
    
    // Orders by vehicle
    const byVehicle = db.prepare(`
      SELECT plaka, COUNT(*) as count, SUM(baslangic_fiyati) as total
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
    
    return {
      earnings: earnings.total,
      expenses: expenses.total,
      netIncome: earnings.total - expenses.total,
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
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()
    const activeOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?)').get('Yolda', 'Bekliyor')
    const completedOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('Teslim Edildi')
    
    const thisMonth = new Date()
    const startDate = `${thisMonth.getFullYear()}-${String(thisMonth.getMonth() + 1).padStart(2, '0')}-01`
    
    const monthlyEarnings = db.prepare(`
      SELECT COALESCE(SUM(baslangic_fiyati), 0) as total
      FROM orders
      WHERE created_at >= ?
    `).get(startDate)
    
    const monthlyExpenses = db.prepare(`
      SELECT COALESCE(SUM(e.amount), 0) as total
      FROM expenses e
      JOIN orders o ON e.order_id = o.id
      WHERE o.created_at >= ?
    `).get(startDate)
    
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all()
    
    return {
      totalOrders: totalOrders.count,
      activeOrders: activeOrders.count,
      completedOrders: completedOrders.count,
      monthlyEarnings: monthlyEarnings.total,
      monthlyExpenses: monthlyExpenses.total,
      monthlyNetIncome: monthlyEarnings.total - monthlyExpenses.total,
      recentOrders,
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

