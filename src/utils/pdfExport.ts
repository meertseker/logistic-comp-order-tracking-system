import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './formatters'

export function exportOrderToPDF(order: any) {
  const doc = new jsPDF()
  
  // Başlık
  doc.setFontSize(20)
  doc.text('SEYMEN TRANSPORT', 105, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text(`Sipariş #${order.id}`, 105, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`Tarih: ${new Date(order.created_at).toLocaleDateString('tr-TR')}`, 105, 38, { align: 'center' })
  
  // Müşteri Bilgileri
  doc.setFontSize(12)
  doc.text('Müşteri Bilgileri', 20, 50)
  
  autoTable(doc, {
    startY: 55,
    head: [['Alan', 'Değer']],
    body: [
      ['Müşteri', order.musteri],
      ['Telefon', order.telefon],
      ['Plaka', order.plaka],
    ],
    theme: 'grid',
  })
  
  // Güzergah Bilgileri
  const lastY = (doc as any).lastAutoTable.finalY || 80
  doc.text('Güzergah Bilgileri', 20, lastY + 10)
  
  autoTable(doc, {
    startY: lastY + 15,
    head: [['Alan', 'Değer']],
    body: [
      ['Nereden', order.nereden],
      ['Nereye', order.nereye],
      ['Gidiş Km', order.gidis_km || '-'],
      ['Dönüş Km', order.donus_km || '-'],
      ['Etkin Km', order.etkin_km || '-'],
    ],
    theme: 'grid',
  })
  
  // Finansal Bilgiler
  const lastY2 = (doc as any).lastAutoTable.finalY || 130
  doc.text('Finansal Bilgiler', 20, lastY2 + 10)
  
  autoTable(doc, {
    startY: lastY2 + 15,
    head: [['Açıklama', 'Tutar']],
    body: [
      ['Müşteri Ödemesi', formatCurrency(order.baslangic_fiyati)],
      ['Tahmini Maliyet', formatCurrency(order.toplam_maliyet || 0)],
      ['Kar/Zarar', formatCurrency(order.kar_zarar || 0)],
      ['Durum', order.status],
    ],
    theme: 'grid',
  })
  
  // Maliyet Dökümü
  if (order.toplam_maliyet > 0) {
    const lastY3 = (doc as any).lastAutoTable.finalY || 180
    doc.text('Maliyet Dökümü', 20, lastY3 + 10)
    
    autoTable(doc, {
      startY: lastY3 + 15,
      head: [['Kalem', 'Tutar']],
      body: [
        ['Yakıt', formatCurrency(order.yakit_maliyet || 0) + ` (${(order.yakit_litre || 0).toFixed(1)} lt)`],
        ['Sürücü', formatCurrency(order.surucu_maliyet || 0) + ` (${order.tahmini_gun || 0} gün)`],
        ['Yemek', formatCurrency(order.yemek_maliyet || 0)],
        ['HGS/Köprü', formatCurrency(order.hgs_maliyet || 0)],
        ['Bakım', formatCurrency(order.bakim_maliyet || 0)],
      ],
      theme: 'striped',
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text('Seymen Transport - Lojistik Yönetim Sistemi', 105, 285, { align: 'center' })
  
  // PDF'i indir
  doc.save(`siparis_${order.id}_${Date.now()}.pdf`)
}

export function exportReportToPDF(report: any, year: number, month: number) {
  const doc = new jsPDF()
  
  // Başlık
  doc.setFontSize(20)
  doc.text('SEYMEN TRANSPORT', 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`Aylık Rapor - ${month}/${year}`, 105, 30, { align: 'center' })
  
  // Finansal Özet
  doc.setFontSize(12)
  doc.text('Finansal Özet', 20, 45)
  
  autoTable(doc, {
    startY: 50,
    head: [['Açıklama', 'Tutar']],
    body: [
      ['Toplam Gelir', formatCurrency(report.earnings)],
      ['Tahmini Maliyet', formatCurrency(report.estimatedCosts || 0)],
      ['Ek Giderler', formatCurrency(report.expenses)],
      ['Net Kar/Zarar', formatCurrency(report.netIncome)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  })
  
  // Araç Performansı
  if (report.byVehicle && report.byVehicle.length > 0) {
    const lastY = (doc as any).lastAutoTable.finalY || 100
    doc.text('Araç Performansı', 20, lastY + 10)
    
    autoTable(doc, {
      startY: lastY + 15,
      head: [['Plaka', 'Sipariş', 'Gelir', 'Kar/Zarar']],
      body: report.byVehicle.map((v: any) => [
        v.plaka,
        v.count,
        formatCurrency(v.total),
        formatCurrency(v.totalProfit || 0),
      ]),
      theme: 'striped',
    })
  }
  
  // Müşteri Performansı
  if (report.byCustomer && report.byCustomer.length > 0) {
    const lastY2 = (doc as any).lastAutoTable.finalY || 150
    
    // Sayfa sonu kontrolü
    if (lastY2 > 250) {
      doc.addPage()
      doc.text('Müşteri Performansı', 20, 20)
      autoTable(doc, {
        startY: 25,
        head: [['Müşteri', 'Sipariş', 'Gelir', 'Ortalama']],
        body: report.byCustomer.slice(0, 10).map((c: any) => [
          c.musteri,
          c.count,
          formatCurrency(c.total),
          formatCurrency(c.total / c.count),
        ]),
        theme: 'striped',
      })
    } else {
      doc.text('Müşteri Performansı', 20, lastY2 + 10)
      autoTable(doc, {
        startY: lastY2 + 15,
        head: [['Müşteri', 'Sipariş', 'Gelir', 'Ortalama']],
        body: report.byCustomer.slice(0, 10).map((c: any) => [
          c.musteri,
          c.count,
          formatCurrency(c.total),
          formatCurrency(c.total / c.count),
        ]),
        theme: 'striped',
      })
    }
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text('Seymen Transport - Lojistik Yönetim Sistemi', 105, 285, { align: 'center' })
  
  // PDF'i indir
  doc.save(`rapor_${year}_${month}.pdf`)
}

