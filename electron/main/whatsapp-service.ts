import { getDB } from './database'
import * as fs from 'fs'
import * as https from 'https'
import * as http from 'http'
import { URL } from 'url'

export interface OrderWhatsAppData {
  orderId: number
  musteri: string
  telefon: string
  customerPhone?: string
  nereden: string
  nereye: string
  yukAciklamasi: string
  plaka: string
  baslangicFiyati: number
  toplamMaliyet?: number
  onerilenFiyat?: number
  karZarar?: number
  karZararYuzde?: number
  gidisKm?: number
  donusKm?: number
  tahminiGun: number
  status: string
  createdAt: string
  isSubcontractor?: boolean
  subcontractorCompany?: string
}

export interface WhatsAppSettings {
  id: number
  provider: string
  api_key: string | null
  api_secret: string | null
  api_username: string | null
  api_password: string | null
  sender_name: string | null
  sender_phone: string | null
  enabled: number
  auto_send_on_created: number
  auto_send_on_status_change: number
  auto_send_on_delivered: number
  auto_send_on_invoiced: number
  template_order_created: string | null
  template_order_on_way: string | null
  template_order_delivered: string | null
  template_order_invoiced: string | null
  template_order_cancelled: string | null
  template_custom: string | null
  company_name: string | null
}

export class WhatsAppService {
  private settings: WhatsAppSettings | null = null

  /**
   * WhatsApp ayarlarını veritabanından yükle
   */
  async initialize(skipEnabledCheck: boolean = false): Promise<void> {
    const db = getDB()
    const settings = db.prepare('SELECT * FROM whatsapp_settings WHERE id = 1').get() as WhatsAppSettings
    
    if (!settings) {
      throw new Error('WhatsApp servisi yapılandırılmamış')
    }
    
    // Test için enabled kontrolünü atla
    if (!skipEnabledCheck && !settings.enabled) {
      throw new Error('WhatsApp servisi etkinleştirilmemiş')
    }
    
    if (!settings.api_key || !settings.sender_phone) {
      throw new Error('WhatsApp ayarları eksik. Lütfen API Key ve Gönderici Telefon giriniz.')
    }
    
    this.settings = settings
  }

  /**
   * API bağlantısını test et
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.initialize(true)
      
      if (!this.settings) {
        throw new Error('Ayarlar yüklenemedi')
      }

      // Test mesajı gönder (kendine)
      const testResult = await this.sendMessage(
        this.settings.sender_phone!,
        'Test mesajı - Sekersoft WhatsApp entegrasyonu başarılı! ✅'
      )

      if (testResult.success) {
        return {
          success: true,
          message: 'WhatsApp bağlantısı başarılı! Test mesajı gönderildi.'
        }
      } else {
        return {
          success: false,
          message: testResult.message || 'Test mesajı gönderilemedi'
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message 
      }
    }
  }

  /**
   * Basit metin mesajı gönder
   */
  async sendMessage(
    phone: string,
    message: string
  ): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      if (!this.settings) {
        await this.initialize()
      }

      // Telefon numarası formatla (Türkiye için)
      const formattedPhone = this.formatPhone(phone)

      // Provider'a göre API çağrısı
      switch (this.settings!.provider) {
        case 'iletimerkezi':
          return await this.sendViaIletimerkezi(formattedPhone, message)
        
        case 'netgsm':
          return await this.sendViaNetgsm(formattedPhone, message)
        
        case 'twilio':
          return await this.sendViaTwilio(formattedPhone, message)
        
        default:
          throw new Error(`Desteklenmeyen provider: ${this.settings!.provider}`)
      }
    } catch (error: any) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        message: error.message || 'Mesaj gönderilemedi'
      }
    }
  }

  /**
   * Sipariş bilgilendirme mesajı gönder
   */
  async sendOrderMessage(
    recipientPhone: string,
    orderData: OrderWhatsAppData,
    messageType: 'created' | 'on_way' | 'delivered' | 'invoiced' | 'cancelled' | 'custom',
    customMessage?: string,
    pdfPath?: string
  ): Promise<{ success: boolean; message: string }> {
    const db = getDB()
    
    try {
      if (!this.settings) {
        await this.initialize()
      }

      // Telefon numarası formatla
      const formattedPhone = this.formatPhone(recipientPhone)

      // Mesaj içeriğini hazırla
      let messageContent: string
      
      if (customMessage) {
        // Özel mesaj varsa onu kullan ve değişkenleri değiştir
        messageContent = this.replaceVariables(customMessage, orderData)
      } else {
        // Şablonu seç ve değişkenleri değiştir
        const template = this.getTemplate(messageType)
        messageContent = this.replaceVariables(template, orderData)
      }

      // Mesajı gönder
      const result = await this.sendMessage(formattedPhone, messageContent)

      // Log kaydet
      const logStatus = result.success ? 'sent' : 'failed'
      const logStmt = db.prepare(`
        INSERT INTO whatsapp_logs (
          order_id, recipient_phone, recipient_name, message_type, 
          message_content, status, error_message, provider_message_id, sent_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `)

      logStmt.run(
        orderData.orderId,
        formattedPhone,
        orderData.musteri,
        messageType,
        messageContent,
        logStatus,
        result.success ? null : result.message,
        result.messageId || null
      )

      return result
    } catch (error: any) {
      console.error('Error sending order WhatsApp:', error)
      
      // Hata log kaydet
      try {
        db.prepare(`
          INSERT INTO whatsapp_logs (
            order_id, recipient_phone, recipient_name, message_type, 
            message_content, status, error_message, sent_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          orderData.orderId,
          recipientPhone,
          orderData.musteri,
          messageType,
          customMessage || '',
          'failed',
          error.message
        )
      } catch (logError) {
        console.error('Error logging WhatsApp failure:', logError)
      }

      return { success: false, message: error.message }
    }
  }

  /**
   * Toplu mesaj gönder
   */
  async sendBulkMessages(
    recipients: Array<{ phone: string; orderData: OrderWhatsAppData }>,
    messageType: 'created' | 'on_way' | 'delivered' | 'invoiced' | 'cancelled' | 'custom',
    customMessage?: string
  ): Promise<{ success: number; failed: number; results: any[] }> {
    let successCount = 0
    let failedCount = 0
    const results: any[] = []

    for (const recipient of recipients) {
      const result = await this.sendOrderMessage(
        recipient.phone,
        recipient.orderData,
        messageType,
        customMessage
      )

      if (result.success) {
        successCount++
      } else {
        failedCount++
      }

      results.push({
        phone: recipient.phone,
        orderId: recipient.orderData.orderId,
        success: result.success,
        message: result.message
      })

      // API rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return {
      success: successCount,
      failed: failedCount,
      results
    }
  }

  /**
   * Telefon numarası formatla (Türkiye için)
   */
  private formatPhone(phone: string): string {
    // Boşluk, tire, parantez temizle
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')
    
    // +90 veya 90 ile başlıyorsa
    if (cleaned.startsWith('+90')) {
      return cleaned
    } else if (cleaned.startsWith('90')) {
      return '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      // 0 ile başlıyorsa kaldır ve +90 ekle
      return '+90' + cleaned.substring(1)
    } else {
      // Sadece numara varsa +90 ekle
      return '+90' + cleaned
    }
  }

  /**
   * Mesaj şablonunu getir
   */
  private getTemplate(messageType: string): string {
    if (!this.settings) {
      return 'Mesaj şablonu bulunamadı'
    }

    const templates: Record<string, string | null> = {
      created: this.settings.template_order_created,
      on_way: this.settings.template_order_on_way,
      delivered: this.settings.template_order_delivered,
      invoiced: this.settings.template_order_invoiced,
      cancelled: this.settings.template_order_cancelled,
      custom: this.settings.template_custom
    }

    return templates[messageType] || templates.custom || 'Bilgilendirme mesajı'
  }

  /**
   * Mesaj içindeki değişkenleri değiştir
   */
  private replaceVariables(template: string, orderData: OrderWhatsAppData): string {
    const companyName = this.settings?.company_name || 'Sekersoft'
    const companyPhone = this.settings?.sender_phone || ''
    
    return template
      .replace(/{musteri}/g, orderData.musteri)
      .replace(/{orderId}/g, orderData.orderId.toString())
      .replace(/{plaka}/g, orderData.plaka)
      .replace(/{nereden}/g, orderData.nereden)
      .replace(/{nereye}/g, orderData.nereye)
      .replace(/{yukAciklamasi}/g, orderData.yukAciklamasi || '')
      .replace(/{fiyat}/g, orderData.baslangicFiyati.toLocaleString('tr-TR'))
      .replace(/{tahminiGun}/g, orderData.tahminiGun.toString())
      .replace(/{status}/g, orderData.status)
      .replace(/{company}/g, companyName)
      .replace(/{phone}/g, companyPhone)
  }

  /**
   * HTTP/HTTPS request helper
   */
  private async httpRequest(url: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      const isHttps = parsedUrl.protocol === 'https:'
      const lib = isHttps ? https : http

      const requestOptions: any = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000
      }

      const req = lib.request(requestOptions, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            const contentType = res.headers['content-type'] || ''
            if (contentType.includes('application/json')) {
              resolve({ data: JSON.parse(data), status: res.statusCode })
            } else {
              resolve({ data: data, status: res.statusCode })
            }
          } catch (e) {
            resolve({ data: data, status: res.statusCode })
          }
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      if (options.body) {
        req.write(options.body)
      }

      req.end()
    })
  }

  /**
   * İletimerkezi API
   */
  private async sendViaIletimerkezi(phone: string, message: string): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      // İletimerkezi API endpoint (gerçek API için değiştirilmeli)
      const body = JSON.stringify({
        username: this.settings!.api_username,
        password: this.settings!.api_password,
        sender: this.settings!.sender_phone,
        receiver: phone,
        message: message
      })

      const response = await this.httpRequest('https://api.iletimerkezi.com/v1/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        body: body,
        timeout: 10000
      })

      if (response.data.status === 'success') {
        return {
          success: true,
          message: 'Mesaj başarıyla gönderildi',
          messageId: response.data.messageId
        }
      } else {
        return {
          success: false,
          message: response.data.message || 'Mesaj gönderilemedi'
        }
      }
    } catch (error: any) {
      console.error('İletimerkezi API error:', error.message)
      return {
        success: false,
        message: error.message || 'API hatası'
      }
    }
  }

  /**
   * NetGSM API
   */
  private async sendViaNetgsm(phone: string, message: string): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      const params = new URLSearchParams({
        usercode: this.settings!.api_username!,
        password: this.settings!.api_password!,
        gsmno: phone,
        message: message
      })

      const response = await this.httpRequest(`https://api.netgsm.com.tr/whatsapp/send?${params.toString()}`, {
        method: 'GET',
        timeout: 10000
      })

      // NetGSM response format: "00 12345678" (success) or "30" (error)
      const responseText = response.data.toString().trim()
      
      if (responseText.startsWith('00')) {
        const messageId = responseText.split(' ')[1]
        return {
          success: true,
          message: 'Mesaj başarıyla gönderildi',
          messageId: messageId
        }
      } else {
        return {
          success: false,
          message: `NetGSM hata kodu: ${responseText}`
        }
      }
    } catch (error: any) {
      console.error('NetGSM API error:', error)
      return {
        success: false,
        message: error.message || 'API hatası'
      }
    }
  }

  /**
   * Twilio API
   */
  private async sendViaTwilio(phone: string, message: string): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      // Twilio için whatsapp: prefix ekle
      const twilioPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`
      const twilioFrom = this.settings!.sender_phone!.startsWith('whatsapp:') 
        ? this.settings!.sender_phone! 
        : `whatsapp:${this.settings!.sender_phone}`

      const body = new URLSearchParams({
        From: twilioFrom,
        To: twilioPhone,
        Body: message
      }).toString()

      // Basic auth
      const auth = Buffer.from(`${this.settings!.api_username}:${this.settings!.api_key}`).toString('base64')

      const response = await this.httpRequest(
        `https://api.twilio.com/2010-04-01/Accounts/${this.settings!.api_username}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
            'Content-Length': Buffer.byteLength(body)
          },
          body: body,
          timeout: 10000
        }
      )

      return {
        success: true,
        message: 'Mesaj başarıyla gönderildi',
        messageId: response.data.sid
      }
    } catch (error: any) {
      console.error('Twilio API error:', error.message)
      return {
        success: false,
        message: error.message || 'API hatası'
      }
    }
  }

  /**
   * WhatsApp loglarını getir
   */
  async getLogs(filters?: {
    orderId?: number
    status?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<any[]> {
    const db = getDB()
    
    let query = 'SELECT * FROM whatsapp_logs WHERE 1=1'
    const params: any[] = []

    if (filters?.orderId) {
      query += ' AND order_id = ?'
      params.push(filters.orderId)
    }

    if (filters?.status) {
      query += ' AND status = ?'
      params.push(filters.status)
    }

    if (filters?.dateFrom) {
      query += ' AND sent_at >= ?'
      params.push(filters.dateFrom)
    }

    if (filters?.dateTo) {
      query += ' AND sent_at <= ?'
      params.push(filters.dateTo)
    }

    query += ' ORDER BY sent_at DESC'

    if (filters?.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)
    }

    const stmt = db.prepare(query)
    return stmt.all(...params) as any[]
  }

  /**
   * WhatsApp istatistiklerini getir
   */
  async getStatistics(period?: 'today' | 'week' | 'month' | 'all'): Promise<{
    total: number
    sent: number
    failed: number
    successRate: number
  }> {
    const db = getDB()
    
    let dateFilter = ''
    switch (period) {
      case 'today':
        dateFilter = "AND date(sent_at) = date('now')"
        break
      case 'week':
        dateFilter = "AND sent_at >= datetime('now', '-7 days')"
        break
      case 'month':
        dateFilter = "AND sent_at >= datetime('now', '-30 days')"
        break
      default:
        dateFilter = ''
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM whatsapp_logs
      WHERE 1=1 ${dateFilter}
    `).get() as any

    return {
      total: stats.total || 0,
      sent: stats.sent || 0,
      failed: stats.failed || 0,
      successRate: stats.total > 0 ? (stats.sent / stats.total) * 100 : 0
    }
  }
}

// Singleton instance
let whatsappServiceInstance: WhatsAppService | null = null

export const getWhatsAppService = (): WhatsAppService => {
  if (!whatsappServiceInstance) {
    whatsappServiceInstance = new WhatsAppService()
  }
  return whatsappServiceInstance
}

