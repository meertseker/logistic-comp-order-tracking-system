import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  Users,
  Activity,
  BarChart3
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Select from '../components/Select'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { exportReportToExcel } from '../utils/excelExport'
import { exportReportToPDF } from '../utils/pdfExport'

export default function Reports() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const years = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i
    return { value: y.toString(), label: y.toString() }
  })

  const months = [
    { value: '1', label: 'Ocak' },
    { value: '2', label: 'Şubat' },
    { value: '3', label: 'Mart' },
    { value: '4', label: 'Nisan' },
    { value: '5', label: 'Mayıs' },
    { value: '6', label: 'Haziran' },
    { value: '7', label: 'Temmuz' },
    { value: '8', label: 'Ağustos' },
    { value: '9', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' },
  ]

  useEffect(() => {
    loadReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await window.electronAPI.db.getMonthlyReport(year, month)
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    if (!report) return

    let companyName: string | null = null
    try {
      if (window.electronAPI?.app?.getCompanyName) {
        companyName = await window.electronAPI.app.getCompanyName()
      }
    } catch (error) {
      console.error('Error getting company name:', error)
      // Continue with null, will use default
    }
    const reportTitle = companyName ? `${companyName} - Aylık Rapor` : 'Sekersoft - Aylık Rapor'
    let csv = `${reportTitle}\n`
    csv += `Dönem: ${months.find(m => m.value === month.toString())?.label} ${year}\n\n`
    
    csv += 'Özet\n'
    csv += `Toplam Kazanç,${report.earnings}\n`
    csv += `Toplam Masraf,${report.expenses}\n`
    csv += `Net Gelir,${report.netIncome}\n\n`

    csv += 'Araçlara Göre\n'
    csv += 'Plaka,Sipariş Sayısı,Toplam Kazanç\n'
    report.byVehicle.forEach((item: any) => {
      csv += `${item.plaka},${item.count},${item.total}\n`
    })

    csv += '\nMüşterilere Göre\n'
    csv += 'Müşteri,Sipariş Sayısı,Toplam Kazanç\n'
    report.byCustomer.forEach((item: any) => {
      csv += `${item.musteri},${item.count},${item.total}\n`
    })

    csv += '\n\nBu rapor Sekersoft yazılımı ile oluşturulmuştur.\n'

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapor_${year}_${month}.csv`
    link.click()
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Raporlar
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Aylık performans ve mali raporlarınız
          </p>
        </div>
        {report && (
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={exportToCSV} variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => exportReportToExcel(report, year, month)} variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={async () => await exportReportToPDF(report, year, month)} size="sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Yıl"
            options={years}
            value={year.toString()}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <Select
            label="Ay"
            options={months}
            value={month.toString()}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <div className="flex items-end">
            <Button fullWidth onClick={loadReport} disabled={loading}>
              {loading ? 'Yükleniyor...' : 'Rapor Oluştur'}
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto" style={{ borderColor: '#0A84FF', borderTopColor: 'transparent' }}></div>
            <p className="mt-4 text-lg font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Rapor hazırlanıyor...
            </p>
          </motion.div>
        </div>
      ) : report ? (
        <>
          {/* Modern Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {/* Toplam Gelir */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden"
              style={{ background: 'rgba(48, 209, 88, 0.12)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#30D158' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" style={{ color: '#30D158' }} />
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#30D158' }}>
                    Toplam Gelir
                  </p>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(report.earnings)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Müşterilerden alınan</p>
              </div>
            </motion.div>

            {/* Tahmini Gider */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden"
              style={{ background: 'rgba(255, 159, 10, 0.12)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF9F0A' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4" style={{ color: '#FF9F0A' }} />
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF9F0A' }}>
                    Tahmini Gider
                  </p>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(report.estimatedCosts || 0)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Hesaplanan maliyet</p>
              </div>
            </motion.div>

            {/* Ek Gider */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden"
              style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ backgroundColor: '#FF453A' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4" style={{ color: '#FF453A' }} />
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF453A' }}>
                    Ek Gider
                  </p>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(report.expenses)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Manuel eklenen</p>
              </div>
            </motion.div>

            {/* Net Kar/Zarar */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden"
              style={{ 
                background: report.netIncome >= 0 ? 'rgba(10, 132, 255, 0.12)' : 'rgba(255, 69, 58, 0.12)',
                border: report.netIncome >= 0 ? '0.5px solid rgba(10, 132, 255, 0.3)' : '0.5px solid rgba(255, 69, 58, 0.3)'
              }}
            >
              <div 
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" 
                style={{ backgroundColor: report.netIncome >= 0 ? '#0A84FF' : '#FF453A' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  {report.netIncome >= 0 ? (
                    <TrendingUp className="w-4 h-4" style={{ color: '#0A84FF' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: '#FF453A' }} />
                  )}
                  <p 
                    className="text-xs font-semibold uppercase tracking-wider" 
                    style={{ color: report.netIncome >= 0 ? '#0A84FF' : '#FF453A' }}
                  >
                    Net Kar/Zarar
                  </p>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(report.netIncome)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  {report.netIncome >= 0 ? '✓ Kârlı dönem' : '⚠ Zararlı dönem'}
                </p>
              </div>
            </motion.div>

            {/* Gerçek Kâr */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden"
              style={{ 
                background: report.gercekKar >= 0 ? 'rgba(191, 90, 242, 0.12)' : 'rgba(255, 214, 10, 0.12)',
                border: report.gercekKar >= 0 ? '0.5px solid rgba(191, 90, 242, 0.3)' : '0.5px solid rgba(255, 214, 10, 0.3)'
              }}
            >
              <div 
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" 
                style={{ backgroundColor: report.gercekKar >= 0 ? '#BF5AF2' : '#FFD60A' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" style={{ color: report.gercekKar >= 0 ? '#BF5AF2' : '#FFD60A' }} />
                  <p 
                    className="text-xs font-semibold uppercase tracking-wider" 
                    style={{ color: report.gercekKar >= 0 ? '#BF5AF2' : '#FFD60A' }}
                  >
                    Gerçek Kâr
                  </p>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  {formatCurrency(report.gercekKar || 0)}
                </p>
                <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  {report.gercekKarMarji ? `%${report.gercekKarMarji.toFixed(1)} marj` : 'Hesaplanmadı'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Status Breakdown */}
          {report.byStatus && report.byStatus.length > 0 && (
            <Card title="Sipariş Durumları">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {report.byStatus.map((item: any) => (
                  <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.status}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Vehicles */}
          <Card title="En Çok Çalışan Araçlar">
            {report.byVehicle && report.byVehicle.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sıra</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Plaka</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Sipariş</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Gelir</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Maliyet</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Kar/Zarar</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Ort/Sipariş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byVehicle.map((item: any, index: number) => (
                      <tr key={item.plaka} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{index + 1}</td>
                        <td className="py-3 px-4 font-semibold">{item.plaka}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(item.count)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-orange-600">
                          {formatCurrency(item.totalCost || 0)}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${(item.totalProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {formatCurrency(item.totalProfit || 0)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(item.total / item.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Veri bulunmuyor</p>
            )}
          </Card>

          {/* Top Customers */}
          <Card title="En Çok Sipariş Veren Müşteriler">
            {report.byCustomer && report.byCustomer.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sıra</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Sipariş Sayısı</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam Kazanç</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Ortalama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byCustomer.map((item: any, index: number) => (
                      <tr key={item.musteri} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{index + 1}</td>
                        <td className="py-3 px-4 font-semibold">{item.musteri}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(item.count)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {formatCurrency(item.total / item.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Veri bulunmuyor</p>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
            <p className="text-gray-500 text-lg">
              Rapor görüntülemek için yukarıdan ay ve yıl seçiniz
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

