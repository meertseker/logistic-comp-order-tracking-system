import axios, { AxiosInstance } from 'axios'
import { getDB } from './database'

interface UyumsoftSettings {
  api_key?: string
  api_secret?: string
  environment: string
  company_name?: string
  company_tax_number?: string
  company_tax_office?: string
  company_address?: string
  enabled: number
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  discountRate?: number
}

interface CreateInvoiceRequest {
  customerName: string
  customerType: 'INDIVIDUAL' | 'CORPORATE'
  customerTaxNumber?: string
  customerTaxOffice?: string
  customerIdNumber?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  items: InvoiceItem[]
  notes?: string
  invoiceDate?: string
  autoSendEmail?: boolean
}

class UyumsoftAPI {
  private apiClient: AxiosInstance | null = null
  private settings: UyumsoftSettings | null = null

  constructor() {
    // Database henüz hazır olmayabilir, lazy loading yap
  }

  loadSettings() {
    try {
      const db = getDB()
      const settings = db.prepare('SELECT * FROM uyumsoft_settings WHERE id = 1').get() as UyumsoftSettings
      
      if (settings && settings.enabled) {
        this.settings = settings
        this.initializeClient()
      }
    } catch (error) {
      // Database henüz hazır değilse sessizce geç
      // İlk kullanımda tekrar yüklenecek
      console.debug('Uyumsoft settings not loaded yet (database not ready)')
    }
  }

  initializeClient() {
    if (!this.settings?.api_key || !this.settings?.api_secret) {
      throw new Error('Uyumsoft API anahtarları yapılandırılmamış')
    }

    const baseURL = this.settings.environment === 'PRODUCTION'
      ? 'https://api.uyumsoft.com.tr/v1'
      : 'https://api-test.uyumsoft.com.tr/v1'

    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.settings.api_key,
        'X-API-SECRET': this.settings.api_secret
      },
      timeout: 30000
    })
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.apiClient) {
        this.loadSettings()
        if (!this.apiClient) {
          return { success: false, message: 'API ayarları yapılandırılmamış' }
        }
      }

      // Test endpoint - Uyumsoft API'ye göre ayarlanmalı
      const response = await this.apiClient.get('/auth/test')
      
      return {
        success: true,
        message: 'Bağlantı başarılı! Uyumsoft API\'ye erişim sağlandı.'
      }
    } catch (error: any) {
      console.error('Uyumsoft connection test failed:', error)
      return {
        success: false,
        message: this.getErrorMessage(error)
      }
    }
  }

  async createEArchiveInvoice(orderId: number, request: CreateInvoiceRequest): Promise<any> {
    try {
      if (!this.apiClient) {
        this.loadSettings()
        if (!this.apiClient) {
          throw new Error('Uyumsoft API ayarları yapılandırılmamış')
        }
      }

      // Fatura kalemlerini hesapla
      const items = request.items.map(item => {
        const subtotal = item.quantity * item.unitPrice
        const discount = subtotal * (item.discountRate || 0) / 100
        const totalBeforeVat = subtotal - discount
        const vatAmount = totalBeforeVat * item.vatRate / 100
        const total = totalBeforeVat + vatAmount

        return {
          productService: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate || 0,
          vatAmount,
          total
        }
      })

      // Toplamları hesapla
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const vatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0)
      const grandTotal = totalAmount + vatAmount

      // Uyumsoft API'ye istek gönder
      const invoiceData = {
        documentType: 'EARCHIVE',
        customer: {
          name: request.customerName,
          identityNumber: request.customerIdNumber,
          taxNumber: request.customerTaxNumber,
          taxOffice: request.customerTaxOffice,
          email: request.customerEmail,
          phone: request.customerPhone,
          address: request.customerAddress
        },
        invoiceDate: request.invoiceDate || new Date().toISOString(),
        items,
        notes: request.notes,
        sendEmail: request.autoSendEmail !== false
      }

      console.log('Creating e-Archive invoice:', invoiceData)

      // API çağrısı (gerçek endpoint'e göre ayarlanmalı)
      const response = await this.apiClient.post('/invoices/earchive', invoiceData)

      // Veritabanına kaydet
      const db = getDB()
      const stmt = db.prepare(`
        INSERT INTO uyumsoft_invoices (
          order_id, invoice_uuid, invoice_number, invoice_type, invoice_date,
          ettn, customer_name, customer_tax_number, customer_tax_office,
          customer_id_number, customer_email, customer_phone, customer_address,
          total_amount, vat_amount, grand_total, invoice_status, uyumsoft_status,
          pdf_url, sent_to_email, sent_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        orderId,
        response.data.uuid,
        response.data.invoiceNumber,
        'EARCHIVE',
        response.data.invoiceDate,
        response.data.ettn,
        request.customerName,
        request.customerTaxNumber,
        request.customerTaxOffice,
        request.customerIdNumber,
        request.customerEmail,
        request.customerPhone,
        request.customerAddress,
        totalAmount,
        vatAmount,
        grandTotal,
        'APPROVED',
        response.data.status,
        response.data.pdfUrl,
        request.autoSendEmail ? request.customerEmail : null,
        request.autoSendEmail ? new Date().toISOString() : null
      )

      // Sipariş durumunu güncelle
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('Faturalandı', orderId)

      return {
        success: true,
        id: result.lastInsertRowid,
        invoice: response.data,
        message: 'E-Arşiv fatura başarıyla oluşturuldu'
      }
    } catch (error: any) {
      console.error('Error creating e-Archive invoice:', error)
      
      // Hata kaydı tut
      try {
        const db = getDB()
        db.prepare(`
          INSERT INTO uyumsoft_invoices (
            order_id, invoice_type, customer_name, total_amount, vat_amount, grand_total,
            invoice_status, error_message, invoice_date
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderId,
          'EARCHIVE',
          request.customerName,
          0,
          0,
          0,
          'FAILED',
          this.getErrorMessage(error),
          new Date().toISOString()
        )
      } catch {}

      throw new Error(this.getErrorMessage(error))
    }
  }

  async createEInvoice(orderId: number, request: CreateInvoiceRequest): Promise<any> {
    try {
      if (!this.apiClient) {
        this.loadSettings()
        if (!this.apiClient) {
          throw new Error('Uyumsoft API ayarları yapılandırılmamış')
        }
      }

      if (!request.customerTaxNumber) {
        throw new Error('E-Fatura için vergi numarası gereklidir')
      }

      // Fatura kalemlerini hesapla
      const items = request.items.map(item => {
        const subtotal = item.quantity * item.unitPrice
        const discount = subtotal * (item.discountRate || 0) / 100
        const totalBeforeVat = subtotal - discount
        const vatAmount = totalBeforeVat * item.vatRate / 100
        const total = totalBeforeVat + vatAmount

        return {
          productService: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate || 0,
          vatAmount,
          total
        }
      })

      // Toplamları hesapla
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const vatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0)
      const grandTotal = totalAmount + vatAmount

      // Uyumsoft API'ye istek gönder
      const invoiceData = {
        documentType: 'EINVOICE',
        customer: {
          name: request.customerName,
          taxNumber: request.customerTaxNumber,
          taxOffice: request.customerTaxOffice,
          email: request.customerEmail,
          phone: request.customerPhone,
          address: request.customerAddress
        },
        invoiceDate: request.invoiceDate || new Date().toISOString(),
        items,
        notes: request.notes,
        sendEmail: request.autoSendEmail !== false
      }

      console.log('Creating e-Invoice:', invoiceData)

      // API çağrısı (gerçek endpoint'e göre ayarlanmalı)
      const response = await this.apiClient.post('/invoices/einvoice', invoiceData)

      // Veritabanına kaydet
      const db = getDB()
      const stmt = db.prepare(`
        INSERT INTO uyumsoft_invoices (
          order_id, invoice_uuid, invoice_number, invoice_type, invoice_date,
          ettn, customer_name, customer_tax_number, customer_tax_office,
          customer_email, customer_phone, customer_address,
          total_amount, vat_amount, grand_total, invoice_status, uyumsoft_status,
          pdf_url, sent_to_email, sent_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        orderId,
        response.data.uuid,
        response.data.invoiceNumber,
        'EINVOICE',
        response.data.invoiceDate,
        response.data.ettn,
        request.customerName,
        request.customerTaxNumber,
        request.customerTaxOffice,
        request.customerEmail,
        request.customerPhone,
        request.customerAddress,
        totalAmount,
        vatAmount,
        grandTotal,
        'APPROVED',
        response.data.status,
        response.data.pdfUrl,
        request.autoSendEmail ? request.customerEmail : null,
        request.autoSendEmail ? new Date().toISOString() : null
      )

      // Sipariş durumunu güncelle
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('Faturalandı', orderId)

      return {
        success: true,
        id: result.lastInsertRowid,
        invoice: response.data,
        message: 'E-Fatura başarıyla oluşturuldu'
      }
    } catch (error: any) {
      console.error('Error creating e-Invoice:', error)
      
      // Hata kaydı tut
      try {
        const db = getDB()
        db.prepare(`
          INSERT INTO uyumsoft_invoices (
            order_id, invoice_type, customer_name, total_amount, vat_amount, grand_total,
            invoice_status, error_message, invoice_date
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderId,
          'EINVOICE',
          request.customerName,
          0,
          0,
          0,
          'FAILED',
          this.getErrorMessage(error),
          new Date().toISOString()
        )
      } catch {}

      throw new Error(this.getErrorMessage(error))
    }
  }

  async getInvoice(invoiceId: number): Promise<any> {
    try {
      const db = getDB()
      const invoice = db.prepare('SELECT * FROM uyumsoft_invoices WHERE id = ?').get(invoiceId)
      return invoice
    } catch (error) {
      console.error('Error getting invoice:', error)
      throw error
    }
  }

  async getInvoicesByOrder(orderId: number): Promise<any[]> {
    try {
      const db = getDB()
      const invoices = db.prepare('SELECT * FROM uyumsoft_invoices WHERE order_id = ? ORDER BY created_at DESC').all(orderId)
      return invoices
    } catch (error) {
      console.error('Error getting invoices by order:', error)
      throw error
    }
  }

  async cancelInvoice(invoiceId: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = getDB()
      const invoice: any = db.prepare('SELECT * FROM uyumsoft_invoices WHERE id = ?').get(invoiceId)

      if (!invoice) {
        throw new Error('Fatura bulunamadı')
      }

      if (invoice.invoice_status === 'CANCELLED') {
        throw new Error('Fatura zaten iptal edilmiş')
      }

      if (!this.apiClient) {
        this.loadSettings()
        if (!this.apiClient) {
          throw new Error('Uyumsoft API ayarları yapılandırılmamış')
        }
      }

      // Uyumsoft API'ye iptal isteği gönder
      const response = await this.apiClient.post(`/invoices/${invoice.invoice_uuid}/cancel`, {
        reason
      })

      // Veritabanını güncelle
      db.prepare(`
        UPDATE uyumsoft_invoices
        SET invoice_status = 'CANCELLED', cancel_reason = ?, cancelled_at = datetime('now')
        WHERE id = ?
      `).run(reason, invoiceId)

      return {
        success: true,
        message: 'Fatura başarıyla iptal edildi'
      }
    } catch (error: any) {
      console.error('Error cancelling invoice:', error)
      throw new Error(this.getErrorMessage(error))
    }
  }

  async downloadInvoicePDF(invoiceId: number): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const db = getDB()
      const invoice: any = db.prepare('SELECT * FROM uyumsoft_invoices WHERE id = ?').get(invoiceId)

      if (!invoice || !invoice.pdf_url) {
        throw new Error('Fatura PDF\'i bulunamadı')
      }

      return {
        success: true,
        path: invoice.pdf_url
      }
    } catch (error: any) {
      console.error('Error downloading invoice PDF:', error)
      return {
        success: false,
        error: this.getErrorMessage(error)
      }
    }
  }

  async resendInvoiceEmail(invoiceId: number, email: string): Promise<{ success: boolean; message: string }> {
    try {
      const db = getDB()
      const invoice: any = db.prepare('SELECT * FROM uyumsoft_invoices WHERE id = ?').get(invoiceId)

      if (!invoice) {
        throw new Error('Fatura bulunamadı')
      }

      if (!this.apiClient) {
        this.loadSettings()
        if (!this.apiClient) {
          throw new Error('Uyumsoft API ayarları yapılandırılmamış')
        }
      }

      // Uyumsoft API'ye e-posta gönderme isteği
      await this.apiClient.post(`/invoices/${invoice.invoice_uuid}/resend`, {
        email
      })

      // Veritabanını güncelle
      db.prepare(`
        UPDATE uyumsoft_invoices
        SET sent_to_email = ?, sent_at = datetime('now')
        WHERE id = ?
      `).run(email, invoiceId)

      return {
        success: true,
        message: 'Fatura e-postası başarıyla gönderildi'
      }
    } catch (error: any) {
      console.error('Error resending invoice email:', error)
      throw new Error(this.getErrorMessage(error))
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.status === 401) {
      return 'API anahtarınız geçersiz. Lütfen ayarlardan kontrol edin.'
    }
    if (error.response?.status === 429) {
      return 'Aylık fatura limitiniz doldu. Uyumsoft ile iletişime geçin.'
    }
    if (error.response?.status === 400) {
      return 'Geçersiz fatura bilgileri. Lütfen kontrol edin.'
    }
    if (error.message) {
      return error.message
    }
    return 'Bilinmeyen bir hata oluştu'
  }
}

export const uyumsoftAPI = new UyumsoftAPI()

