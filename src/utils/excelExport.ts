import * as XLSX from 'xlsx'

export function exportOrdersToExcel(orders: any[], filename: string = 'siparisler') {
  // Verileri Excel formatına dönüştür
  const excelData = orders.map(order => ({
    'Sipariş No': order.id,
    'Plaka': order.plaka,
    'Müşteri': order.musteri,
    'Telefon': order.telefon,
    'Nereden': order.nereden,
    'Nereye': order.nereye,
    'Gidiş Km': order.gidis_km || 0,
    'Dönüş Km': order.donus_km || 0,
    'Toplam Km': (order.gidis_km || 0) + (order.donus_km || 0),
    'Etkin Km': order.etkin_km || 0,
    'Müşteri Ödemesi (₺)': order.baslangic_fiyati,
    'Tahmini Maliyet (₺)': order.toplam_maliyet || 0,
    'Kar/Zarar (₺)': order.kar_zarar || 0,
    'Durum': order.status,
    'Tarih': new Date(order.created_at).toLocaleDateString('tr-TR'),
  }))

  // Worksheet oluştur
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Kolon genişliklerini ayarla
  const colWidths = [
    { wch: 10 }, // Sipariş No
    { wch: 12 }, // Plaka
    { wch: 20 }, // Müşteri
    { wch: 15 }, // Telefon
    { wch: 15 }, // Nereden
    { wch: 15 }, // Nereye
    { wch: 10 }, // Gidiş Km
    { wch: 10 }, // Dönüş Km
    { wch: 10 }, // Toplam Km
    { wch: 10 }, // Etkin Km
    { wch: 15 }, // Ödeme
    { wch: 15 }, // Maliyet
    { wch: 15 }, // Kar/Zarar
    { wch: 15 }, // Durum
    { wch: 12 }, // Tarih
  ]
  ws['!cols'] = colWidths

  // Workbook oluştur
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Siparişler')

  // Özet sayfa ekle
  const summary = [{
    'Toplam Sipariş': orders.length,
    'Toplam Gelir (₺)': orders.reduce((sum, o) => sum + (o.baslangic_fiyati || 0), 0),
    'Toplam Maliyet (₺)': orders.reduce((sum, o) => sum + (o.toplam_maliyet || 0), 0),
    'Toplam Kar/Zarar (₺)': orders.reduce((sum, o) => sum + (o.kar_zarar || 0), 0),
  }]
  const summaryWs = XLSX.utils.json_to_sheet(summary)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet')

  // Dosyayı indir
  const timestamp = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`)
}

export function exportReportToExcel(report: any, year: number, month: number, periodLabel?: string) {
  const wb = XLSX.utils.book_new()

  // Özet sayfası
  const period = periodLabel || `${month}/${year}`
  const summary = [{
    'Dönem': period,
    'Toplam Gelir (₺)': report.earnings,
    'Tahmini Gider (₺)': report.estimatedCosts || 0,
    'Ek Gider (₺)': report.expenses,
    'Net Kar/Zarar (₺)': report.netIncome,
  }]
  const summaryWs = XLSX.utils.json_to_sheet(summary)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet')

  // Araç bazında
  if (report.byVehicle && report.byVehicle.length > 0) {
    const vehicleData = report.byVehicle.map((v: any) => ({
      'Plaka': v.plaka,
      'Sipariş Sayısı': v.count,
      'Toplam Gelir (₺)': v.total,
      'Toplam Maliyet (₺)': v.totalCost || 0,
      'Kar/Zarar (₺)': v.totalProfit || 0,
      'Ortalama/Sipariş (₺)': v.total / v.count,
    }))
    const vehicleWs = XLSX.utils.json_to_sheet(vehicleData)
    XLSX.utils.book_append_sheet(wb, vehicleWs, 'Araçlar')
  }

  // Müşteri bazında
  if (report.byCustomer && report.byCustomer.length > 0) {
    const customerData = report.byCustomer.map((c: any) => ({
      'Müşteri': c.musteri,
      'Sipariş Sayısı': c.count,
      'Toplam Gelir (₺)': c.total,
      'Ortalama/Sipariş (₺)': c.total / c.count,
    }))
    const customerWs = XLSX.utils.json_to_sheet(customerData)
    XLSX.utils.book_append_sheet(wb, customerWs, 'Müşteriler')
  }

  // Dosyayı indir
  const filename = periodLabel ? periodLabel.replace(/\s+/g, '_') : `${year}_${month}`
  XLSX.writeFile(wb, `rapor_${filename}.xlsx`)
}

