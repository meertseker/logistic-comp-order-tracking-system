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
})

