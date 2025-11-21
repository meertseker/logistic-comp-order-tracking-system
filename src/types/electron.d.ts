export interface ElectronAPI {
  db: {
    getOrders: (filters?: any) => Promise<any[]>
    getOrder: (id: number) => Promise<any>
    createOrder: (orderData: any) => Promise<{ id: number; success: boolean }>
    updateOrder: (id: number, orderData: any) => Promise<{ success: boolean }>
    updateOrderStatus: (id: number, status: string) => Promise<{ success: boolean }>
    deleteOrder: (id: number) => Promise<{ success: boolean }>
    
    addExpense: (expenseData: any) => Promise<{ id: number; success: boolean }>
    getExpenses: (orderId: number) => Promise<any[]>
    deleteExpense: (id: number) => Promise<{ success: boolean }>
    
    addInvoice: (invoiceData: any) => Promise<{ id: number; success: boolean }>
    getInvoices: (orderId: number) => Promise<any[]>
    deleteInvoice: (id: number) => Promise<{ success: boolean }>
    
    getMonthlyReport: (year: number, month: number) => Promise<any>
    getDashboardStats: () => Promise<any>
    
    getVehicleParams: (plaka: string) => Promise<any>
    saveVehicle: (vehicleData: any) => Promise<{ success: boolean }>
    getVehicles: () => Promise<any[]>
    
    getTrailers: () => Promise<any[]>
    getTrailer: (id: number) => Promise<any>
    createTrailer: (trailerData: any) => Promise<{ id: number; success: boolean }>
    updateTrailer: (id: number, trailerData: any) => Promise<{ success: boolean }>
    deleteTrailer: (id: number) => Promise<{ success: boolean }>
    
    // Trailer Loads
    getTrailerLoads: (trailerId: number) => Promise<any[]>
    addTrailerLoad: (loadData: any) => Promise<{ id: number; success: boolean }>
    deleteTrailerLoad: (id: number) => Promise<{ success: boolean }>
    checkTrailerCapacity: (trailerId: number, enCm: number, boyCm: number, yukseklikCm: number, agirlikTon: number) => Promise<any>
  }
  
  cost: {
    analyze: (orderData: any) => Promise<any>
    calculateRecommended: (orderData: any) => Promise<{ recommended: number; breakEven: number }>
    getBreakdown: (plaka: string) => Promise<any>
  }
  
  fs: {
    saveFile: (fileData: any) => Promise<{ filePath: string; fileName: string; success: boolean }>
    readFile: (filePath: string) => Promise<string>
    deleteFile: (filePath: string) => Promise<{ success: boolean }>
  }
  
  app: {
    getPath: (name: string) => Promise<string>
  }
  
  license: {
    getMachineId: () => Promise<{ success: boolean; machineId?: string; error?: string }>
    validate: () => Promise<{ valid: boolean; reason?: string; license?: any }>
    activate: (licenseKey: string, companyName: string, email: string) => Promise<{ success: boolean; message: string }>
    getInfo: () => Promise<{ licensed: boolean; info?: any }>
    deactivate: () => Promise<{ success: boolean }>
  }
  
  mail: {
    getSettings: () => Promise<any>
    saveSettings: (settings: any) => Promise<{ success: boolean }>
    testConnection: () => Promise<{ success: boolean; message: string }>
    sendOrderEmail: (recipientEmail: string, orderData: any, pdfPath?: string, invoiceFiles?: any[], customSubject?: string, customMessage?: string) => Promise<{ success: boolean; message: string }>
    getLogs: (orderId?: number) => Promise<any[]>
  }
  
  whatsapp: {
    getSettings: () => Promise<any>
    saveSettings: (settings: any) => Promise<{ success: boolean }>
    testConnection: () => Promise<{ success: boolean; message: string }>
    sendOrderMessage: (
      recipientPhone: string,
      orderData: any,
      messageType: 'created' | 'on_way' | 'delivered' | 'invoiced' | 'cancelled' | 'custom',
      customMessage?: string,
      pdfPath?: string
    ) => Promise<{ success: boolean; message: string; messageId?: string }>
    sendBulkMessages: (
      recipients: Array<{ phone: string; orderData: any }>,
      messageType: 'created' | 'on_way' | 'delivered' | 'invoiced' | 'cancelled' | 'custom',
      customMessage?: string
    ) => Promise<{ success: number; failed: number; results: any[] }>
    getLogs: (filters?: any) => Promise<any[]>
    getStatistics: (period?: 'today' | 'week' | 'month' | 'all') => Promise<{
      total: number
      sent: number
      failed: number
      successRate: number
    }>
    resendMessage: (logId: number) => Promise<{ success: boolean; message: string }>
  }
  
  export: {
    allData: () => Promise<{ success: boolean; path?: string; error?: string }>
    ordersCSV: () => Promise<{ success: boolean; path?: string; error?: string }>
    database: () => Promise<{ success: boolean; path?: string; error?: string }>
    statistics: () => Promise<{ success: boolean; path?: string; error?: string }>
    importData: (filePath: string) => Promise<{ success: boolean; imported?: number; error?: string }>
  }
  
  system: {
    getInfo: () => Promise<{
      appVersion: string
      appName: string
      platform: string
      arch: string
      electronVersion: string
      nodeVersion: string
      chromeVersion: string
      userDataPath: string
    }>
  }
  
  uyumsoft: {
    getSettings: () => Promise<any>
    saveSettings: (settings: any) => Promise<{ success: boolean }>
    testConnection: () => Promise<{ success: boolean; message: string }>
    createEArchiveInvoice: (orderId: number, invoiceData: any) => Promise<any>
    createEInvoice: (orderId: number, invoiceData: any) => Promise<any>
    getInvoice: (invoiceId: number) => Promise<any>
    getInvoicesByOrder: (orderId: number) => Promise<any[]>
    getAllInvoices: () => Promise<any[]>
    cancelInvoice: (invoiceId: number, reason: string) => Promise<{ success: boolean; message: string }>
    downloadInvoicePDF: (invoiceId: number) => Promise<{ success: boolean; path?: string; error?: string }>
    resendInvoiceEmail: (invoiceId: number, email: string) => Promise<{ success: boolean; message: string }>
  }
  
  dev: {
    getTestModeStatus: () => Promise<{ isActive: boolean; whatsapp: boolean; uyumsoft: boolean }>
    enableTestMode: () => Promise<{ success: boolean; message: string }>
    disableTestMode: () => Promise<{ success: boolean; message: string }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

