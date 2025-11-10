import nodemailer from 'nodemailer'
import { getDB } from './database'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { generateEmailByStatus, type EmailTemplateData } from './mail-templates-professional'

export interface MailSettings {
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_user: string
  smtp_password: string
  from_email: string
  from_name: string
  enabled: boolean
}

export interface OrderMailData {
  orderId: number
  musteri: string
  telefon: string
  customerEmail?: string
  nereden: string
  nereye: string
  yukAciklamasi: string
  plaka: string
  baslangicFiyati: number
  toplamMaliyet: number
  onerilenFiyat: number
  karZarar: number
  karZararYuzde: number
  gidisKm: number
  donusKm: number
  tahminiGun: number
  status: string
  createdAt: string
  isSubcontractor?: boolean
  subcontractorCompany?: string
}

export class MailService {
  private transporter: nodemailer.Transporter | null = null
  
  /**
   * SMTP ayarlarını veritabanından yükle ve transporter oluştur
   */
  async initialize(skipEnabledCheck: boolean = false): Promise<void> {
    const db = getDB()
    const settings = db.prepare('SELECT * FROM mail_settings WHERE id = 1').get() as any
    
    if (!settings) {
      throw new Error('Mail servisi yapılandırılmamış')
    }
    
    // Test için enabled kontrolünü atla
    if (!skipEnabledCheck && !settings.enabled) {
      throw new Error('Mail servisi etkinleştirilmemiş')
    }
    
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password) {
      throw new Error('Mail ayarları eksik. Lütfen SMTP sunucu, kullanıcı ve şifre giriniz.')
    }
    
    this.transporter = nodemailer.createTransport({
      host: settings.smtp_host,
      port: settings.smtp_port,
      secure: settings.smtp_secure === 1, // true for 465, false for other ports
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_password,
      },
    })
  }
  
  /**
   * SMTP bağlantısını test et
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test için enabled kontrolünü atla
      await this.initialize(true)
      if (!this.transporter) {
        return { success: false, message: 'Transporter oluşturulamadı' }
      }
      
      await this.transporter.verify()
      return { success: true, message: 'SMTP bağlantısı başarılı!' }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message 
      }
    }
  }
  
  /**
   * Sipariş maili gönder (MODERN VERSION)
   */
  async sendOrderEmail(
    recipientEmail: string,
    orderData: OrderMailData,
    pdfPath?: string,
    invoiceFiles?: Array<{ filePath: string; fileName: string }>
  ): Promise<{ success: boolean; message: string }> {
    const db = getDB()
    
    try {
      // Mail servisi hazır değilse initialize et
      if (!this.transporter) {
        await this.initialize()
      }
      
      const settings = db.prepare('SELECT * FROM mail_settings WHERE id = 1').get() as any
      
      // MODERN HTML template oluştur (duruma göre)
      const templateData: EmailTemplateData = {
        orderId: orderData.orderId,
        musteri: orderData.musteri,
        telefon: orderData.telefon,
        customerEmail: orderData.customerEmail,
        nereden: orderData.nereden,
        nereye: orderData.nereye,
        yukAciklamasi: orderData.yukAciklamasi,
        plaka: orderData.plaka,
        baslangicFiyati: orderData.baslangicFiyati,
        gidisKm: orderData.gidisKm,
        donusKm: orderData.donusKm,
        tahminiGun: orderData.tahminiGun,
        status: orderData.status,
        createdAt: orderData.createdAt,
        isSubcontractor: orderData.isSubcontractor,
        subcontractorCompany: orderData.subcontractorCompany,
      }
      
      const htmlContent = generateEmailByStatus(orderData.status, templateData)
      
      // Mail subject'i duruma göre belirle
      const subjects: Record<string, string> = {
        'Bekliyor': 'Siparişiniz Alındı',
        'Yüklendi': 'Yükleme Tamamlandı',
        'Yolda': 'Aracınız Yola Çıktı',
        'Teslim Edildi': 'Teslimat Tamamlandı',
        'Faturalandı': 'Faturanız Hazır',
        'İptal': 'Sipariş İptal Edildi',
      }
      
      const subject = subjects[orderData.status] || 'Sipariş Durumu Güncellendi'
      
      // Mail seçenekleri (Türkçe karakter desteği için charset ekle)
      const mailOptions: any = {
        from: `"${settings.from_name}" <${settings.from_email}>`,
        to: recipientEmail,
        subject: `${subject} - Sipariş #${orderData.orderId}`,
        html: htmlContent,
        text: this.generatePlainTextEmail(orderData), // Fallback plain text
        charset: 'utf-8',
        encoding: 'utf-8'
      }
      
      // Attachments dizisi oluştur
      const attachments: any[] = []
      
      // PDF varsa ekle
      if (pdfPath && fs.existsSync(pdfPath)) {
        // Türkçe karakter desteği için UTF-8 encoding ile filename oluştur
        const pdfFilename = `Siparis_${orderData.orderId}.pdf`
        attachments.push({
          filename: pdfFilename,
          path: pdfPath,
          contentType: 'application/pdf',
          encoding: 'base64'
        })
      }
      
      // Eğer sipariş "Faturalandı" durumundaysa ve faturalar varsa onları da ekle
      if (orderData.status === 'Faturalandı' && invoiceFiles && invoiceFiles.length > 0) {
        invoiceFiles.forEach((invoice) => {
          if (fs.existsSync(invoice.filePath)) {
            // Türkçe karakter içeren dosya isimleri için encoding
            // Nodemailer otomatik olarak RFC 2047 encoding yapar, ancak 
            // contentType ve encoding'i açıkça belirtmek daha iyi
            const ext = path.extname(invoice.fileName).toLowerCase()
            let contentType = 'application/octet-stream'
            
            // Dosya tipine göre content type belirle
            if (ext === '.pdf') contentType = 'application/pdf'
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
            else if (ext === '.png') contentType = 'image/png'
            else if (ext === '.gif') contentType = 'image/gif'
            else if (ext === '.doc') contentType = 'application/msword'
            else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            else if (ext === '.xls') contentType = 'application/vnd.ms-excel'
            else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            
            attachments.push({
              filename: invoice.fileName, // Nodemailer otomatik olarak RFC 2047 encoding yapar
              path: invoice.filePath,
              contentType: contentType,
              encoding: 'base64'
            })
          }
        })
      }
      
      // Attachments varsa mail seçeneklerine ekle
      if (attachments.length > 0) {
        mailOptions.attachments = attachments
      }
      
      // Mail gönder
      const info = await this.transporter!.sendMail(mailOptions)
      
      // Log kaydet
      db.prepare(`
        INSERT INTO mail_logs (order_id, recipient_email, subject, status)
        VALUES (?, ?, ?, 'success')
      `).run(orderData.orderId, recipientEmail, mailOptions.subject)
      
      return { 
        success: true, 
        message: `Mail başarıyla gönderildi! (ID: ${info.messageId})` 
      }
    } catch (error: any) {
      // Hata log kaydet
      db.prepare(`
        INSERT INTO mail_logs (order_id, recipient_email, subject, status, error_message)
        VALUES (?, ?, ?, 'failed', ?)
      `).run(orderData.orderId, recipientEmail, 'Sipariş Detayları', error.message)
      
      return { 
        success: false, 
        message: `Mail gönderilemedi: ${error.message}` 
      }
    }
  }
  
  /**
   * HTML mail template oluştur
   */
  private generateOrderEmailTemplate(data: OrderMailData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    
    const statusColor = (status: string) => {
      switch (status) {
        case 'Bekliyor': return '#f59e0b'
        case 'Yolda': return '#3b82f6'
        case 'Teslim Edildi': return '#10b981'
        case 'Faturalandı': return '#8b5cf6'
        case 'İptal': return '#ef4444'
        default: return '#6b7280'
      }
    }
    
    const karRenk = data.karZarar >= 0 ? '#10b981' : '#ef4444'
    const karIcon = data.karZarar >= 0 ? '▲' : '▼'
    
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sipariş Detayları</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    
    <!-- Container -->
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
        <tr>
            <td style="padding: 40px 20px;">
                
                <!-- Main Card -->
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #004aad 0%, #003580 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                🚚 Sipariş Detayları
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                                Sipariş #${data.orderId}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            
                            <!-- Müşteri Bilgileri -->
                            <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                                        <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #111827;">
                                            👤 Müşteri Bilgileri
                                        </h2>
                                        <table role="presentation" style="width: 100%;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Müşteri:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.musteri}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Telefon:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.telefon}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Durum:</td>
                                                <td style="padding: 8px 0; text-align: right;">
                                                    <span style="display: inline-block; padding: 4px 12px; background-color: ${statusColor(data.status)}; color: #ffffff; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                                        ${data.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Güzergah -->
                            <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px;">
                                        <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #1e40af;">
                                            📍 Güzergah Bilgileri
                                        </h2>
                                        <table role="presentation" style="width: 100%;">
                                            <tr>
                                                <td style="padding: 12px; background-color: #ffffff; border-radius: 6px; margin-bottom: 10px;">
                                                    <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Nereden</div>
                                                    <div style="color: #111827; font-size: 16px; font-weight: 600;">${data.nereden}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: center; padding: 10px 0;">
                                                    <span style="font-size: 24px;">↓</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px; background-color: #ffffff; border-radius: 6px;">
                                                    <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Nereye</div>
                                                    <div style="color: #111827; font-size: 16px; font-weight: 600;">${data.nereye}</div>
                                                </td>
                                            </tr>
                                        </table>
                                        ${data.yukAciklamasi ? `
                                        <div style="margin-top: 15px; padding: 12px; background-color: rgba(255, 255, 255, 0.7); border-radius: 6px;">
                                            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Yük Açıklaması</div>
                                            <div style="color: #111827; font-size: 14px;">${data.yukAciklamasi}</div>
                                        </div>
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Sefer Detayları -->
                            <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                                        <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #111827;">
                                            🚛 Sefer Detayları
                                        </h2>
                                        <table role="presentation" style="width: 100%;">
                                            ${data.isSubcontractor ? `
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Taşeron Firma:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.subcontractorCompany}</td>
                                            </tr>
                                            ` : `
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plaka:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.plaka}</td>
                                            </tr>
                                            `}
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Gidiş Mesafesi:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.gidisKm} km</td>
                                            </tr>
                                            ${data.donusKm > 0 ? `
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Dönüş Mesafesi:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.donusKm} km</td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tahmini Süre:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${data.tahminiGun} gün</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Sipariş Tarihi:</td>
                                                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formatDate(data.createdAt)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Fiyat Bilgisi -->
                            <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px;">
                                        <h2 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #15803d;">
                                            💰 Fiyat Bilgisi
                                        </h2>
                                        <table role="presentation" style="width: 100%;">
                                            <tr style="border-top: 2px solid rgba(0, 0, 0, 0.1);">
                                                <td style="padding: 15px 0 8px; color: #111827; font-size: 18px; font-weight: 700;">Toplam Ücret:</td>
                                                <td style="padding: 15px 0 8px; text-align: right;">
                                                    <div style="color: #15803d; font-size: 24px; font-weight: 700;">
                                                        ${formatCurrency(data.baslangicFiyati)}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Note -->
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 6px;">
                                        <p style="margin: 0; color: #1e3a8a; font-size: 13px;">
                                            <strong>📎 Sipariş Belgesi:</strong><br>
                                            Bu mail ile birlikte sipariş detay belgesi eklenmiştir. Lütfen eki kontrol ediniz ve herhangi bir sorunuz olursa bizimle iletişime geçiniz.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                <strong>Sekersoft</strong>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Bu mail otomatik olarak oluşturulmuştur.
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
    `
  }
  
  /**
   * Plain text email (HTML olmayan mail istemcileri için)
   */
  private generatePlainTextEmail(data: OrderMailData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
      }).format(amount)
    }
    
    return `
SEKERSOFT - SİPARİŞ DETAYLARI
Sipariş #${data.orderId}

MÜŞTERİ BİLGİLERİ
------------------
Müşteri: ${data.musteri}
Telefon: ${data.telefon}
Durum: ${data.status}

GÜZERGAH
--------
Nereden: ${data.nereden}
Nereye: ${data.nereye}
${data.yukAciklamasi ? `Yük: ${data.yukAciklamasi}` : ''}

SEFER DETAYLARI
--------------
${data.isSubcontractor ? `Taşeron: ${data.subcontractorCompany}` : `Plaka: ${data.plaka}`}
Gidiş Mesafesi: ${data.gidisKm} km
${data.donusKm > 0 ? `Dönüş Mesafesi: ${data.donusKm} km` : ''}
Tahmini Süre: ${data.tahminiGun} gün

FİYAT BİLGİSİ
-------------
Toplam Ücret: ${formatCurrency(data.baslangicFiyati)}

---
Bu mail otomatik olarak oluşturulmuştur.
Sekersoft
    `.trim()
  }
}

// Singleton instance
let mailService: MailService | null = null

export const getMailService = () => {
  if (!mailService) {
    mailService = new MailService()
  }
  return mailService
}

