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
  }
  
  fs: {
    saveFile: (fileData: any) => Promise<{ filePath: string; fileName: string; success: boolean }>
    readFile: (filePath: string) => Promise<string>
    deleteFile: (filePath: string) => Promise<{ success: boolean }>
  }
  
  app: {
    getPath: (name: string) => Promise<string>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

