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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

