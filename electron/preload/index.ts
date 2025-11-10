import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    getOrders: (filters?: any) => ipcRenderer.invoke('db:getOrders', filters),
    getOrder: (id: number) => ipcRenderer.invoke('db:getOrder', id),
    createOrder: (orderData: any) => ipcRenderer.invoke('db:createOrder', orderData),
    updateOrder: (id: number, orderData: any) => ipcRenderer.invoke('db:updateOrder', id, orderData),
    updateOrderStatus: (id: number, status: string) => ipcRenderer.invoke('db:updateOrderStatus', id, status),
    deleteOrder: (id: number) => ipcRenderer.invoke('db:deleteOrder', id),
    
    addExpense: (expenseData: any) => ipcRenderer.invoke('db:addExpense', expenseData),
    getExpenses: (orderId: number) => ipcRenderer.invoke('db:getExpenses', orderId),
    deleteExpense: (id: number) => ipcRenderer.invoke('db:deleteExpense', id),
    
    addInvoice: (invoiceData: any) => ipcRenderer.invoke('db:addInvoice', invoiceData),
    getInvoices: (orderId: number) => ipcRenderer.invoke('db:getInvoices', orderId),
    deleteInvoice: (id: number) => ipcRenderer.invoke('db:deleteInvoice', id),
    
    getMonthlyReport: (year: number, month: number) => ipcRenderer.invoke('db:getMonthlyReport', year, month),
    getDashboardStats: () => ipcRenderer.invoke('db:getDashboardStats'),
    
    // Vehicle & Cost operations
    getVehicleParams: (plaka: string) => ipcRenderer.invoke('db:getVehicleParams', plaka),
    saveVehicle: (vehicleData: any) => ipcRenderer.invoke('db:saveVehicle', vehicleData),
    getVehicles: () => ipcRenderer.invoke('db:getVehicles'),
    
    getRoutes: () => ipcRenderer.invoke('db:getRoutes'),
    getRoute: (nereden: string, nereye: string) => ipcRenderer.invoke('db:getRoute', nereden, nereye),
    saveRoute: (routeData: any) => ipcRenderer.invoke('db:saveRoute', routeData),
    deleteRoute: (id: number) => ipcRenderer.invoke('db:deleteRoute', id),
    
    // Trailer operations
    getTrailers: () => ipcRenderer.invoke('db:getTrailers'),
    getTrailer: (id: number) => ipcRenderer.invoke('db:getTrailer', id),
    createTrailer: (trailerData: any) => ipcRenderer.invoke('db:createTrailer', trailerData),
    updateTrailer: (id: number, trailerData: any) => ipcRenderer.invoke('db:updateTrailer', id, trailerData),
    deleteTrailer: (id: number) => ipcRenderer.invoke('db:deleteTrailer', id),
    
    // Trailer Loads
    getTrailerLoads: (trailerId: number) => ipcRenderer.invoke('db:getTrailerLoads', trailerId),
    addTrailerLoad: (loadData: any) => ipcRenderer.invoke('db:addTrailerLoad', loadData),
    deleteTrailerLoad: (id: number) => ipcRenderer.invoke('db:deleteTrailerLoad', id),
    checkTrailerCapacity: (trailerId: number, enCm: number, boyCm: number, yukseklikCm: number, agirlikTon: number) => 
      ipcRenderer.invoke('db:checkTrailerCapacity', trailerId, enCm, boyCm, yukseklikCm, agirlikTon),
  },
  
  // Cost calculation operations
  cost: {
    analyze: (orderData: any) => ipcRenderer.invoke('cost:analyze', orderData),
    calculateRecommended: (orderData: any) => ipcRenderer.invoke('cost:calculateRecommended', orderData),
    getBreakdown: (plaka: string) => ipcRenderer.invoke('cost:getBreakdown', plaka),
  },
  
  // File system operations
  fs: {
    saveFile: (fileData: any) => ipcRenderer.invoke('fs:saveFile', fileData),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    deleteFile: (filePath: string) => ipcRenderer.invoke('fs:deleteFile', filePath),
  },
  
  // App utilities
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },
  
  // Backup operations
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    list: () => ipcRenderer.invoke('backup:list'),
    restore: (backupPath: string) => ipcRenderer.invoke('backup:restore', backupPath),
    delete: (backupPath: string) => ipcRenderer.invoke('backup:delete', backupPath),
  },
  
  // License operations
  license: {
    getMachineId: () => ipcRenderer.invoke('license:getMachineId'),
    validate: () => ipcRenderer.invoke('license:validate'),
    activate: (licenseKey: string, companyName: string, email: string) => 
      ipcRenderer.invoke('license:activate', licenseKey, companyName, email),
    getInfo: () => ipcRenderer.invoke('license:getInfo'),
    deactivate: () => ipcRenderer.invoke('license:deactivate'),
  },
  
  // Mail operations
  mail: {
    getSettings: () => ipcRenderer.invoke('mail:getSettings'),
    saveSettings: (settings: any) => ipcRenderer.invoke('mail:saveSettings', settings),
    testConnection: () => ipcRenderer.invoke('mail:testConnection'),
    sendOrderEmail: (recipientEmail: string, orderData: any, pdfPath?: string, invoiceFiles?: any[]) => 
      ipcRenderer.invoke('mail:sendOrderEmail', recipientEmail, orderData, pdfPath, invoiceFiles),
    getLogs: (orderId?: number) => ipcRenderer.invoke('mail:getLogs', orderId),
  },
  
  // Export/Import operations
  export: {
    allData: () => ipcRenderer.invoke('export:allData'),
    ordersCSV: () => ipcRenderer.invoke('export:ordersCSV'),
    database: () => ipcRenderer.invoke('export:database'),
    statistics: () => ipcRenderer.invoke('export:statistics'),
    importData: (filePath: string) => ipcRenderer.invoke('export:importData', filePath),
  },
  
  // System information
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
  },
})

