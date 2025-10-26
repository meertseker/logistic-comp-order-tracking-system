import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Select from '../components/Select'
import { ChartBarIcon, TruckIcon, CurrencyDollarIcon } from '../components/Icons'
import { formatCurrency, formatNumber } from '../utils/formatters'

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

  const exportToCSV = () => {
    if (!report) return

    let csv = 'Seymen Transport - Aylık Rapor\n'
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

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapor_${year}_${month}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="mt-1 text-gray-600">Aylık performans raporları</p>
        </div>
        {report && (
          <Button onClick={exportToCSV}>
            CSV İndir
          </Button>
        )}
      </div>

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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rapor hazırlanıyor...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards - Detaylı */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-800">Toplam Gelir</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {formatCurrency(report.earnings)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Müşterilerden alınan</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-orange-800">Tahmini Gider</p>
                  <p className="text-3xl font-bold text-orange-900 mt-2">
                    {formatCurrency(report.estimatedCosts || 0)}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">Hesaplanan maliyet</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <TruckIcon className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-800">Ek Gider</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    {formatCurrency(report.expenses)}
                  </p>
                  <p className="text-xs text-red-700 mt-1">Manuel eklenen</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full">
                  <ChartBarIcon className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </Card>

            <Card className={`bg-gradient-to-br ${report.netIncome >= 0 ? 'from-blue-50 to-blue-100' : 'from-gray-50 to-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${report.netIncome >= 0 ? 'text-blue-800' : 'text-gray-800'}`}>
                    Net Kar/Zarar
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${report.netIncome >= 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                    {formatCurrency(report.netIncome)}
                  </p>
                  <p className={`text-xs mt-1 ${report.netIncome >= 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                    {report.netIncome >= 0 ? 'Kârlı dönem' : 'Zararlı dönem'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${report.netIncome >= 0 ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  <ChartBarIcon className={`w-6 h-6 ${report.netIncome >= 0 ? 'text-blue-700' : 'text-gray-700'}`} />
                </div>
              </div>
            </Card>
          </div>

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
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Rapor görüntülemek için yukarıdan ay ve yıl seçiniz
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

