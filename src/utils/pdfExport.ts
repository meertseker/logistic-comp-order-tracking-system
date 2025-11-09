import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './formatters'

/**
 * Türkçe karakterleri PDF uyumlu hale getirir
 */
function sanitizeText(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .replace(/₺/g, 'TL')
}

/**
 * Currency değeri PDF için formatla
 */
function formatCurrencyForPDF(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' TL'
}

/**
 * PDF oluşturma helper fonksiyonu - hem download hem mail için kullanılır
 */
function generateOrderPDF(order: any): jsPDF {
  const doc = new jsPDF()
  
  // Türkçe karakter desteği için font ayarları
  doc.setFont('helvetica')
  
  // Başlık
  doc.setFontSize(20)
  doc.text('SEYMEN TRANSPORT', 105, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text(`Siparis #${order.id}`, 105, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}`, 105, 38, { align: 'center' })
  doc.text(`Durum: ${sanitizeText(order.status)}`, 105, 44, { align: 'center' })
  
  // Müşteri Bilgileri
  doc.setFontSize(12)
  doc.text('Musteri Bilgileri', 20, 55)
  
  autoTable(doc, {
    startY: 60,
    head: [['Alan', 'Deger']],
    body: [
      ['Musteri', sanitizeText(order.musteri)],
      ['Telefon', order.telefon],
      order.is_subcontractor === 1 
        ? ['Taseron Firma', sanitizeText(order.subcontractor_company || '-')]
        : ['Plaka', sanitizeText(order.plaka)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
    styles: { font: 'helvetica' },
  })
  
  // Güzergah Bilgileri
  const lastY = (doc as any).lastAutoTable.finalY || 85
  doc.text('Guzergah Bilgileri', 20, lastY + 10)
  
  const routeBody = [
    ['Nereden', sanitizeText(order.nereden)],
    ['Nereye', sanitizeText(order.nereye)],
    ['Gidis Mesafesi', (order.gidis_km || 0) + ' km'],
  ]
  
  if (order.donus_km && order.donus_km > 0) {
    routeBody.push(['Donus Mesafesi', order.donus_km + ' km'])
  }
  
  routeBody.push(['Tahmini Sure', (order.tahmini_gun || 1) + ' gun'])
  
  if (order.yuk_aciklamasi) {
    routeBody.push(['Yuk Aciklamasi', sanitizeText(order.yuk_aciklamasi)])
  }
  
  autoTable(doc, {
    startY: lastY + 15,
    head: [['Alan', 'Deger']],
    body: routeBody,
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
    styles: { font: 'helvetica' },
  })
  
  // Finansal Bilgiler
  const lastY2 = (doc as any).lastAutoTable.finalY || 140
  doc.text('Finansal Bilgiler', 20, lastY2 + 10)
  
  const financialBody = [
    ['Musteri Odemesi', formatCurrencyForPDF(order.baslangic_fiyati)],
  ]
  
  if (!order.is_subcontractor && order.toplam_maliyet > 0) {
    financialBody.push(
      ['Tahmini Maliyet', formatCurrencyForPDF(order.toplam_maliyet || 0)],
      ['Onerilen Fiyat', formatCurrencyForPDF(order.onerilen_fiyat || 0)]
    )
  }
  
  // Kar hesaplaması: Gelir - Maliyet (doğru hesap)
  const gercekKar = order.baslangic_fiyati - (order.toplam_maliyet || 0)
  const gercekKarYuzde = order.baslangic_fiyati > 0 ? (gercekKar / order.baslangic_fiyati) * 100 : 0
  const karRenk = gercekKar >= 0 ? [16, 185, 129] : [239, 68, 68]
  
  autoTable(doc, {
    startY: lastY2 + 15,
    head: [['Aciklama', 'Tutar']],
    body: financialBody,
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
    styles: { font: 'helvetica' },
  })
  
  // Kar/Zarar özel satır
  const lastY2b = (doc as any).lastAutoTable.finalY || 180
  doc.setFillColor(karRenk[0], karRenk[1], karRenk[2])
  doc.rect(20, lastY2b + 2, 170, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text('Kar/Zarar', 25, lastY2b + 8)
  doc.text(
    formatCurrencyForPDF(gercekKar) + ` (%${gercekKarYuzde.toFixed(1)})`,
    185,
    lastY2b + 8,
    { align: 'right' }
  )
  doc.setTextColor(0, 0, 0)
  
  // Maliyet Dökümü
  if (!order.is_subcontractor && order.toplam_maliyet > 0) {
    const lastY3 = lastY2b + 20
    doc.setFontSize(12)
    doc.text('Maliyet Dokumu', 20, lastY3)
    
    autoTable(doc, {
      startY: lastY3 + 5,
      head: [['Kalem', 'Tutar']],
      body: [
        ['Yakit', formatCurrencyForPDF(order.yakit_maliyet || 0) + ` (${(order.yakit_litre || 0).toFixed(1)} lt)`],
        ['Surucu', formatCurrencyForPDF(order.surucu_maliyet || 0) + ` (${order.tahmini_gun || 0} gun)`],
        ['Yemek', formatCurrencyForPDF(order.yemek_maliyet || 0)],
        ['HGS/Kopru', formatCurrencyForPDF(order.hgs_maliyet || 0)],
        ['Bakim', formatCurrencyForPDF(order.bakim_maliyet || 0)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 74, 173] },
      styles: { font: 'helvetica' },
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Seymen Transport - Lojistik Yonetim Sistemi', 105, 285, { align: 'center' })
  doc.text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, 105, 290, { align: 'center' })
  
  return doc
}

/**
 * Sipariş PDF'ini indir (kullanıcı için)
 */
export function exportOrderToPDF(order: any) {
  const doc = generateOrderPDF(order)
  doc.save(`siparis_${order.id}_${Date.now()}.pdf`)
}

/**
 * MÜŞTERİ için sipariş PDF'i oluştur (Maliyetler GİZLİ)
 */
function generateCustomerOrderPDF(order: any): jsPDF {
  const doc = new jsPDF()
  
  // Başlık
  doc.setFontSize(20)
  doc.text('SEYMEN TRANSPORT', 105, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text(`Sipariş #${order.id}`, 105, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}`, 105, 38, { align: 'center' })
  doc.text(`Durum: ${order.status}`, 105, 44, { align: 'center' })
  
  // Müşteri Bilgileri
  doc.setFontSize(12)
  doc.text('Müşteri Bilgileri', 20, 55)
  
  autoTable(doc, {
    startY: 60,
    head: [['Alan', 'Değer']],
    body: [
      ['Müşteri', order.musteri],
      ['Telefon', order.telefon],
      order.is_subcontractor === 1 
        ? ['Taşeron Firma', order.subcontractor_company || '-']
        : ['Plaka', order.plaka],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
  })
  
  // Güzergah Bilgileri
  const lastY = (doc as any).lastAutoTable.finalY || 85
  doc.text('Güzergah Bilgileri', 20, lastY + 10)
  
  const routeBody = [
    ['Nereden', order.nereden],
    ['Nereye', order.nereye],
    ['Mesafe', (order.gidis_km || 0) + ' km'],
  ]
  
  if (order.donus_km && order.donus_km > 0) {
    routeBody.push(['Dönüş Mesafesi', order.donus_km + ' km'])
  }
  
  routeBody.push(['Tahmini Süre', (order.tahmini_gun || 1) + ' gün'])
  
  if (order.yuk_aciklamasi) {
    routeBody.push(['Yük Açıklaması', order.yuk_aciklamasi])
  }
  
  autoTable(doc, {
    startY: lastY + 15,
    head: [['Alan', 'Değer']],
    body: routeBody,
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
  })
  
  // Fiyat Bilgisi (MÜŞTERİ İÇİN - Maliyet yok!)
  const lastY2 = (doc as any).lastAutoTable.finalY || 140
  doc.text('Fiyat Bilgisi', 20, lastY2 + 10)
  
  autoTable(doc, {
    startY: lastY2 + 15,
    head: [['Açıklama', 'Tutar']],
    body: [
      ['Toplam Ücret', formatCurrency(order.baslangic_fiyati)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
  })
  
  // Yeşil vurgu kutusu
  const lastY3 = (doc as any).lastAutoTable.finalY || 180
  doc.setFillColor(22, 163, 74)
  doc.rect(20, lastY3 + 5, 170, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('Toplam Ücret:', 25, lastY3 + 13)
  doc.text(formatCurrency(order.baslangic_fiyati), 185, lastY3 + 13, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Seymen Transport - Lojistik Yönetim Sistemi', 105, 280, { align: 'center' })
  doc.text(`Oluşturulma: ${new Date().toLocaleString('tr-TR')}`, 105, 285, { align: 'center' })
  doc.text('Herhangi bir sorunuz için lütfen bizimle iletişime geçiniz.', 105, 290, { align: 'center' })
  
  return doc
}

/**
 * Sipariş PDF'ini temp dosya olarak kaydet (mail eki için)
 * MÜŞTERİ VERSİYONU - Maliyetler gizli!
 * Returns: PDF file path
 */
export async function generateOrderPDFForEmail(order: any): Promise<string> {
  const doc = generateCustomerOrderPDF(order) // Müşteri versiyonu kullan!
  const pdfBlob = doc.output('blob')
  
  // Blob'u ArrayBuffer'a çevir
  const arrayBuffer = await pdfBlob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  
  // Electron API ile temp klasöre kaydet
  const tempPath = await window.electronAPI.app.getPath('temp')
  const fileName = `siparis_${order.id}_${Date.now()}.pdf`
  
  // File save API kullan
  const result = await window.electronAPI.fs.saveFile({
    path: `${tempPath}/${fileName}`,
    data: Array.from(uint8Array),
  })
  
  return result.filePath
}

export function exportReportToPDF(report: any, year: number, month: number) {
  const doc = new jsPDF()
  doc.setFont('helvetica')
  
  // Başlık
  doc.setFontSize(20)
  doc.text('SEYMEN TRANSPORT', 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`Aylik Rapor - ${month}/${year}`, 105, 30, { align: 'center' })
  
  // Finansal Özet
  doc.setFontSize(12)
  doc.text('Finansal Ozet', 20, 45)
  
  autoTable(doc, {
    startY: 50,
    head: [['Aciklama', 'Tutar']],
    body: [
      ['Toplam Gelir', formatCurrencyForPDF(report.earnings)],
      ['Tahmini Maliyet', formatCurrencyForPDF(report.estimatedCosts || 0)],
      ['Ek Giderler', formatCurrencyForPDF(report.expenses)],
      ['Net Kar/Zarar', formatCurrencyForPDF(report.netIncome)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { font: 'helvetica' },
  })
  
  // Araç Performansı
  if (report.byVehicle && report.byVehicle.length > 0) {
    const lastY = (doc as any).lastAutoTable.finalY || 100
    doc.text('Arac Performansi', 20, lastY + 10)
    
    autoTable(doc, {
      startY: lastY + 15,
      head: [['Plaka', 'Siparis', 'Gelir', 'Kar/Zarar']],
      body: report.byVehicle.map((v: any) => [
        sanitizeText(v.plaka),
        v.count,
        formatCurrencyForPDF(v.total),
        formatCurrencyForPDF(v.totalProfit || 0),
      ]),
      theme: 'striped',
      styles: { font: 'helvetica' },
      headStyles: { fillColor: [59, 130, 246] },
    })
  }
  
  // Müşteri Performansı
  if (report.byCustomer && report.byCustomer.length > 0) {
    const lastY2 = (doc as any).lastAutoTable.finalY || 150
    
    // Sayfa sonu kontrolü
    if (lastY2 > 250) {
      doc.addPage()
      doc.text('Musteri Performansi', 20, 20)
      autoTable(doc, {
        startY: 25,
        head: [['Musteri', 'Siparis', 'Gelir', 'Ortalama']],
        body: report.byCustomer.slice(0, 10).map((c: any) => [
          sanitizeText(c.musteri),
          c.count,
          formatCurrencyForPDF(c.total),
          formatCurrencyForPDF(c.total / c.count),
        ]),
        theme: 'striped',
        styles: { font: 'helvetica' },
        headStyles: { fillColor: [59, 130, 246] },
      })
    } else {
      doc.text('Musteri Performansi', 20, lastY2 + 10)
      autoTable(doc, {
        startY: lastY2 + 15,
        head: [['Musteri', 'Siparis', 'Gelir', 'Ortalama']],
        body: report.byCustomer.slice(0, 10).map((c: any) => [
          sanitizeText(c.musteri),
          c.count,
          formatCurrencyForPDF(c.total),
          formatCurrencyForPDF(c.total / c.count),
        ]),
        theme: 'striped',
        styles: { font: 'helvetica' },
        headStyles: { fillColor: [59, 130, 246] },
      })
    }
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text('Seymen Transport - Lojistik Yonetim Sistemi', 105, 285, { align: 'center' })
  
  // PDF'i indir
  doc.save(`rapor_${year}_${month}.pdf`)
}

