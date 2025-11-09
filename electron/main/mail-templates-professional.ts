/**
 * PROFESSIONAL EMAIL TEMPLATES - Revolut/Wise/Amazon Standard
 * 
 * Design Principles:
 * - Minimal & Clean
 * - High Contrast (readability first)
 * - Professional Typography
 * - Branded but not overwhelming
 * - Mobile-first responsive
 * - Clear information hierarchy
 */

export interface EmailTemplateData {
  orderId: number
  musteri: string
  telefon: string
  customerEmail?: string
  nereden: string
  nereye: string
  yukAciklamasi: string
  plaka: string
  baslangicFiyati: number
  gidisKm: number
  donusKm: number
  tahminiGun: number
  status: string
  createdAt: string
  isSubcontractor?: boolean
  subcontractorCompany?: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * PROFESSIONAL BASE TEMPLATE
 */
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f7f8fa;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f7f8fa;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * HEADER - Seymen Transport Branding
 */
function getHeader(title: string, subtitle: string, statusColor: string = '#0066FF'): string {
  return `
    <tr>
      <td style="padding:32px 32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;padding:12px 24px;background:${statusColor};border-radius:6px;">
            <span style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.5px;">SEYMEN TRANSPORT</span>
          </div>
        </div>
        <h1 style="margin:0 0 8px;color:#1a1a1a;font-size:28px;font-weight:700;text-align:center;line-height:1.3;">
          ${title}
        </h1>
        <p style="margin:0;color:#6b7280;font-size:15px;text-align:center;">
          ${subtitle}
        </p>
      </td>
    </tr>
  `
}

/**
 * GREETING - Profesyonel Selamlama
 */
function getGreeting(customerName: string): string {
  return `
    <tr>
      <td style="padding:0 32px 24px;">
        <p style="margin:0;color:#1a1a1a;font-size:15px;line-height:1.6;">
          Sayın <strong>${customerName}</strong>,
        </p>
      </td>
    </tr>
  `
}

/**
 * INFO CARD - Clean information display
 */
function getInfoCard(title: string, rows: Array<{label: string; value: string}>): string {
  const rowsHtml = rows.map(row => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
        <span style="color:#6b7280;font-size:14px;">${row.label}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">
        <span style="color:#1a1a1a;font-size:14px;font-weight:600;">${row.value}</span>
      </td>
    </tr>
  `).join('')

  return `
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
          <div style="padding:16px;background:#ffffff;border-bottom:1px solid #e5e7eb;">
            <h3 style="margin:0;color:#1a1a1a;font-size:16px;font-weight:600;">${title}</h3>
          </div>
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            ${rowsHtml}
          </table>
        </div>
      </td>
    </tr>
  `
}

/**
 * PRICE BOX - Professional price display
 */
function getPriceBox(amount: number, label: string = 'Toplam Ücret'): string {
  return `
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:linear-gradient(135deg, #0066FF 0%, #0052CC 100%);padding:24px;border-radius:8px;text-align:center;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">
            ${label}
          </p>
          <p style="margin:0;color:#ffffff;font-size:36px;font-weight:700;">
            ${formatCurrency(amount)}
          </p>
        </div>
      </td>
    </tr>
  `
}

/**
 * STATUS BADGE - Visual status indicator
 */
function getStatusBadge(status: string, icon: string): string {
  const statusColors: Record<string, string> = {
    'Bekliyor': '#FBBF24',
    'Yüklendi': '#F97316',
    'Yolda': '#3B82F6',
    'Teslim Edildi': '#10B981',
    'Faturalandı': '#8B5CF6',
    'İptal': '#EF4444',
  }
  
  const color = statusColors[status] || '#6B7280'
  
  return `
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:${color}15;border:2px solid ${color};border-radius:8px;padding:16px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
          <p style="margin:0;color:${color};font-size:18px;font-weight:700;">
            ${status}
          </p>
        </div>
      </td>
    </tr>
  `
}

/**
 * FOOTER - Professional closing
 */
function getFooter(): string {
  return `
    <tr>
      <td style="padding:24px 32px 32px;">
        <div style="border-top:1px solid #e5e7eb;padding-top:24px;text-align:center;">
          <p style="margin:0 0 12px;color:#1a1a1a;font-size:14px;font-weight:600;">
            Seymen Transport
          </p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
            Profesyonel Lojistik Çözümleri
          </p>
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            Bu mail otomatik olarak gönderilmiştir.
          </p>
        </div>
      </td>
    </tr>
  `
}

/**
 * NOTIFICATION BOX - Info/warning/success messages
 */
function getNotificationBox(message: string, type: 'info' | 'success' | 'warning' = 'info'): string {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    success: { bg: '#F0FDF4', border: '#10B981', text: '#065F46' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
  }
  
  const style = colors[type]
  
  return `
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:${style.bg};border-left:4px solid ${style.border};padding:16px;border-radius:6px;">
          <p style="margin:0;color:${style.text};font-size:14px;line-height:1.6;">
            ${message}
          </p>
        </div>
      </td>
    </tr>
  `
}

// ============================================================================
// STATUS-SPECIFIC EMAILS
// ============================================================================

/**
 * YENİ SİPARİŞ - Professional & Welcoming
 */
export function generateNewOrderEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Tarih', value: formatDate(data.createdAt) },
    { label: 'Nereden', value: data.nereden },
    { label: 'Nereye', value: data.nereye },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
    { label: 'Tahmini Süre', value: `${data.tahminiGun} gün` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  rows.push({ 
    label: 'Araç', 
    value: data.isSubcontractor ? data.subcontractorCompany || '' : data.plaka 
  })
  
  const content = `
    ${getHeader('Siparişiniz Alındı', 'Sipariş başarıyla oluşturuldu', '#0066FF')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişiniz tarafımıza ulaşmıştır. Yükleme ve sevkiyat süreçlerinde sizi bilgilendireceğiz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('Bekliyor', '📋')}
    ${getInfoCard('Sipariş Detayları', rows)}
    ${getPriceBox(data.baslangicFiyati)}
    ${getNotificationBox('📎 Ek olarak sipariş belgesi gönderilmiştir. Herhangi bir sorunuz için lütfen bizimle iletişime geçin.', 'info')}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * YÜKLEME TAMAMLANDI - Professional progress update
 */
export function generateLoadedEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Nereden', value: data.nereden },
    { label: 'Nereye', value: data.nereye },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  rows.push({ 
    label: 'Araç', 
    value: data.isSubcontractor ? data.subcontractorCompany || '' : data.plaka 
  })
  
  const content = `
    ${getHeader('Yükleme Tamamlandı', 'Araç yüklenmiştir, yakında yola çıkacak', '#F97316')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişinizin yüklemesi tamamlanmıştır. Araç hazırlıklarını tamamlayıp yola çıktığında size tekrar bilgi vereceğiz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('Yüklendi', '📦')}
    
    <!-- Progress Bar -->
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
          <p style="margin:0 0 12px;color:#6b7280;font-size:13px;font-weight:600;text-align:center;">İLERLEME</p>
          <div style="background:#e5e7eb;height:8px;border-radius:4px;overflow:hidden;">
            <div style="background:#F97316;height:100%;width:40%;border-radius:4px;"></div>
          </div>
          <p style="margin:12px 0 0;color:#6b7280;font-size:12px;text-align:center;">Yükleme tamamlandı • Yola çıkmaya hazırlanıyor</p>
        </div>
      </td>
    </tr>
    
    ${getInfoCard('Sipariş Detayları', rows)}
    ${getNotificationBox('🚀 <strong>Sıradaki Adım:</strong> Araç yola çıktığında size SMS ve email ile bilgi vereceğiz.', 'info')}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * YOLDA - Clean and informative
 */
export function generateOnRouteEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Çıkış Noktası', value: data.nereden },
    { label: 'Varış Noktası', value: data.nereye },
    { label: 'Toplam Mesafe', value: `${data.gidisKm} km` },
    { label: 'Tahmini Süre', value: `${data.tahminiGun} gün` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  rows.push({ 
    label: 'Araç Bilgisi', 
    value: data.isSubcontractor ? data.subcontractorCompany || '' : data.plaka 
  })
  
  const content = `
    ${getHeader('Araç Yola Çıktı', 'Siparişiniz şu anda yolda', '#3B82F6')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişinizi taşıyan araç yola çıkmıştır. Teslimat sürecini takip ediyoruz ve varış sonrasında size bilgi vereceğiz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('Yolda', '🚛')}
    
    <!-- Route Card -->
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);border-radius:8px;padding:24px;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:42%;text-align:center;padding:16px;background:rgba(255,255,255,0.15);border-radius:6px;">
                <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);font-size:12px;font-weight:500;">ÇIKIŞ</p>
                <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;">${data.nereden}</p>
              </td>
              <td style="width:16%;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:20px;">→</p>
              </td>
              <td style="width:42%;text-align:center;padding:16px;background:rgba(255,255,255,0.15);border-radius:6px;">
                <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);font-size:12px;font-weight:500;">VARIŞ</p>
                <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;">${data.nereye}</p>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    
    ${getInfoCard('Detaylı Bilgiler', rows.slice(3))}
    ${getNotificationBox('<strong>Bilgi:</strong> Varış yapıldığında size otomatik olarak bildirim gönderilecektir.', 'info')}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * TESLİM EDİLDİ - Professional completion
 */
export function generateDeliveredEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Güzergah', value: `${data.nereden} → ${data.nereye}` },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  const content = `
    ${getHeader('Teslimat Tamamlandı', 'Siparişiniz başarıyla teslim edilmiştir', '#10B981')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişiniz hedefe ulaştırılmış ve başarıyla teslim edilmiştir. Bizi tercih ettiğiniz için teşekkür ederiz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('Teslim Edildi', '✅')}
    ${getInfoCard('Sipariş Özeti', rows)}
    ${getPriceBox(data.baslangicFiyati)}
    
    <tr>
      <td style="padding:0 32px 24px;">
        <div style="background:#F0FDF4;border:1px solid #10B981;border-radius:8px;padding:20px;text-align:center;">
          <p style="margin:0 0 8px;color:#065F46;font-size:15px;font-weight:600;">
            🙏 Teşekkür Ederiz
          </p>
          <p style="margin:0;color:#047857;font-size:14px;line-height:1.5;">
            Hizmetimizden memnun kaldıysanız, gelecekte de sizinle çalışmaktan mutluluk duyarız.
          </p>
        </div>
      </td>
    </tr>
    
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * FATURALANDIRILDI - Professional invoice notification
 */
export function generateInvoicedEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Güzergah', value: `${data.nereden} → ${data.nereye}` },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  const content = `
    ${getHeader('Fatura Hazır', 'Siparişiniz faturalandırılmıştır', '#8B5CF6')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişinizin faturası hazırlanmıştır. Ödeme detayları ve fatura bilgileri için lütfen ekte bulunan belgeyi inceleyiniz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('Faturalandı', '💳')}
    ${getInfoCard('Fatura Detayları', rows)}
    ${getPriceBox(data.baslangicFiyati, 'Fatura Tutarı')}
    ${getNotificationBox('💼 <strong>Ödeme:</strong> Ödeme detayları ve hesap bilgileri için lütfen muhasebe departmanımız ile iletişime geçiniz.', 'warning')}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * İPTAL - Professional cancellation
 */
export function generateCancelledEmail(data: EmailTemplateData): string {
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Güzergah', value: `${data.nereden} → ${data.nereye}` },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  rows.push({ label: 'Tutar', value: formatCurrency(data.baslangicFiyati) })
  
  const content = `
    ${getHeader('Sipariş İptal Edildi', 'İptal işlemi gerçekleştirilmiştir', '#EF4444')}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          Siparişiniz iptal edilmiştir. Herhangi bir sorunuz veya endişeniz varsa, lütfen bizimle iletişime geçmekten çekinmeyiniz.
        </p>
      </td>
    </tr>
    
    ${getStatusBadge('İptal', '❌')}
    ${getInfoCard('İptal Edilen Sipariş', rows)}
    ${getNotificationBox('📞 <strong>Destek:</strong> Herhangi bir sorunuz için ${data.telefon} numarasından bize ulaşabilirsiniz. Size yardımcı olmaktan mutluluk duyarız.', 'warning')}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * GENEL DURUM GÜNCELLEMESİ - Fallback for any status
 */
export function generateStatusUpdateEmail(data: EmailTemplateData): string {
  const statusConfig: Record<string, { icon: string; color: string; message: string }> = {
    'Bekliyor': { 
      icon: '📋', 
      color: '#FBBF24',
      message: 'Siparişiniz beklemede. Yükleme başladığında size bilgi vereceğiz.'
    },
    'Yüklendi': { 
      icon: '📦', 
      color: '#F97316',
      message: 'Yükleme tamamlandı. Araç yakında yola çıkacak.'
    },
    'Yolda': { 
      icon: '🚛', 
      color: '#3B82F6',
      message: 'Araç yolda. Varış yapıldığında size bilgi vereceğiz.'
    },
    'Teslim Edildi': { 
      icon: '✅', 
      color: '#10B981',
      message: 'Siparişiniz başarıyla teslim edilmiştir.'
    },
    'Faturalandı': { 
      icon: '💳', 
      color: '#8B5CF6',
      message: 'Faturanız hazırlanmıştır.'
    },
  }
  
  const config = statusConfig[data.status] || statusConfig['Bekliyor']
  
  const rows = [
    { label: 'Sipariş No', value: `#${data.orderId}` },
    { label: 'Güzergah', value: `${data.nereden} → ${data.nereye}` },
    { label: 'Mesafe', value: `${data.gidisKm} km` },
  ]
  
  if (data.yukAciklamasi) {
    rows.push({ label: 'Yük', value: data.yukAciklamasi })
  }
  
  const content = `
    ${getHeader('Durum Güncellendi', `Sipariş durumunuz: ${data.status}`, config.color)}
    ${getGreeting(data.musteri)}
    
    <tr>
      <td style="padding:0 32px 16px;">
        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">
          ${config.message}
        </p>
      </td>
    </tr>
    
    ${getStatusBadge(data.status, config.icon)}
    ${getInfoCard('Sipariş Detayları', rows)}
    ${getPriceBox(data.baslangicFiyati)}
    ${getFooter()}
  `
  
  return getBaseTemplate(content)
}

/**
 * STATUS ROUTER - Returns appropriate template
 */
export function generateEmailByStatus(status: string, data: EmailTemplateData): string {
  switch (status) {
    case 'Yüklendi':
      return generateLoadedEmail(data)
    case 'Yolda':
      return generateOnRouteEmail(data)
    case 'Teslim Edildi':
      return generateDeliveredEmail(data)
    case 'Faturalandı':
      return generateInvoicedEmail(data)
    case 'İptal':
      return generateCancelledEmail(data)
    case 'Bekliyor':
    default:
      return generateNewOrderEmail(data)
  }
}

