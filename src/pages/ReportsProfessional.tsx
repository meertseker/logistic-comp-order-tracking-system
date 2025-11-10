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
  Calendar,
  BarChart3,
  RefreshCw,
  Filter,
  Copy
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import DateRangePicker, { DateRange } from '../components/DateRangePicker'
import ReportComparison from '../components/ReportComparison'
import ChartExportControls from '../components/ChartExportControls'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { exportReportToExcel } from '../utils/excelExport'
import { exportReportToPDF } from '../utils/pdfExport'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function ReportsProfessional() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Bu Ay'
  })
  
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange | null>(null)
  const [report, setReport] = useState<any>(null)
  const [comparisonReport, setComparisonReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'comparison'>('summary')

  useEffect(() => {
    loadReport()
  }, [dateRange])

  useEffect(() => {
    if (comparisonDateRange && viewMode === 'comparison') {
      loadComparisonReport()
    }
  }, [comparisonDateRange, viewMode])

  const loadReport = async () => {
    try {
      setLoading(true)
      
      // Custom range report API call
      const data = await window.electronAPI.db.getMonthlyReport(
        new Date(dateRange.startDate).getFullYear(),
        new Date(dateRange.startDate).getMonth() + 1
      )
      
      setReport(data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComparisonReport = async () => {
    if (!comparisonDateRange) return
    
    try {
      const data = await window.electronAPI.db.getMonthlyReport(
        new Date(comparisonDateRange.startDate).getFullYear(),
        new Date(comparisonDateRange.startDate).getMonth() + 1
      )
      setComparisonReport(data)
    } catch (error) {
      console.error('Failed to load comparison report:', error)
    }
  }

  const enableComparisonMode = () => {
    setViewMode('comparison')
    // Set comparison to previous month
    const prevMonth = new Date(dateRange.startDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setComparisonDateRange({
      startDate: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().split('T')[0],
      label: 'Geçen Ay'
    })
  }

  const exportToCSV = () => {
    if (!report) return

    const csvContent = [
      ['Açıklama', 'Değer'],
      ['Toplam Gelir (₺)', report.earnings],
      ['Tahmini Gider (₺)', report.estimatedCosts || 0],
      ['Ek Gider (₺)', report.expenses],
      ['Net Kar/Zarar (₺)', report.netIncome],
      [''],
      ['Araç Performansı'],
      ['Plaka', 'Sipariş Sayısı', 'Gelir', 'Kar'],
      ...report.byVehicle.map((v: any) => [v.plaka, v.count, v.total, v.totalProfit || 0])
    ]

    const csv = csvContent.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapor_${dateRange.startDate}.csv`
    link.click()
  }

  const COLORS = ['#0A84FF', '#30D158', '#FF453A', '#FF9F0A', '#BF5AF2', '#5AC8FA', '#FFD60A']

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: color }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs" style={{ color: trend === 'up' ? '#30D158' : '#FF453A' }}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <p className="text-sm mb-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>{title}</p>
        <p className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{value}</p>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
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
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Profesyonel Raporlar
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Kapsamlı performans ve mali analiz
          </p>
        </div>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            showPresets
          />

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'summary' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('summary')}
            >
              Özet
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'detailed' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('detailed')}
            >
              Detaylı
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'comparison' ? 'primary' : 'secondary'}
              onClick={enableComparisonMode}
            >
              Karşılaştır
            </Button>
          </div>

          <div className="flex-1" />

          {/* Export Options */}
          {report && (
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={exportToCSV} variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => exportReportToExcel(report, new Date(dateRange.startDate).getFullYear(), new Date(dateRange.startDate).getMonth() + 1)} 
                  variant="secondary" 
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => exportReportToPDF(report, new Date(dateRange.startDate).getFullYear(), new Date(dateRange.startDate).getMonth() + 1)} 
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Comparison Date Range */}
        {viewMode === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}
          >
            <div className="flex items-center gap-4">
              <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                Karşılaştırılacak Dönem:
              </p>
              <DateRangePicker
                value={comparisonDateRange || dateRange}
                onChange={setComparisonDateRange}
                showPresets
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Report Content */}
      {!report ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
          <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
            Rapor oluşturmak için tarih aralığı seçin
          </p>
        </div>
      ) : viewMode === 'comparison' && comparisonReport ? (
        <ReportComparison
          data={{
            period1: {
              label: comparisonDateRange?.label || 'Dönem 1',
              earnings: comparisonReport.earnings,
              costs: comparisonReport.estimatedCosts || 0,
              expenses: comparisonReport.expenses,
              netIncome: comparisonReport.netIncome,
              orderCount: comparisonReport.byStatus?.reduce((sum: number, s: any) => sum + s.count, 0) || 0
            },
            period2: {
              label: dateRange.label || 'Dönem 2',
              earnings: report.earnings,
              costs: report.estimatedCosts || 0,
              expenses: report.expenses,
              netIncome: report.netIncome,
              orderCount: report.byStatus?.reduce((sum: number, s: any) => sum + s.count, 0) || 0
            }
          }}
        />
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Toplam Gelir"
              value={formatCurrency(report.earnings)}
              icon={DollarSign}
              color="#30D158"
              trend="up"
              trendValue="+12.5%"
            />
            <StatCard
              title="Toplam Gider"
              value={formatCurrency((report.estimatedCosts || 0) + report.expenses)}
              icon={Activity}
              color="#FF453A"
              trend="down"
              trendValue="+8.3%"
            />
            <StatCard
              title="Net Kar/Zarar"
              value={formatCurrency(report.netIncome)}
              icon={TrendingUp}
              color="#0A84FF"
              trend={report.netIncome >= 0 ? 'up' : 'down'}
              trendValue={report.netIncome >= 0 ? '+' : '-'}
            />
            <StatCard
              title="Kar Marjı"
              value={report.earnings > 0 ? `%${((report.netIncome / report.earnings) * 100).toFixed(1)}` : '%0'}
              icon={BarChart3}
              color="#BF5AF2"
            />
          </div>

          {/* Charts Section */}
          {viewMode === 'detailed' && (
            <>
              {/* Vehicle Performance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6"
                id="vehicle-performance-chart"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
                      Araç Performansı
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      Araç bazında gelir ve kar analizi
                    </p>
                  </div>
                  <ChartExportControls chartId="vehicle-performance-chart" chartTitle="Araç Performansı" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.byVehicle || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(235, 235, 245, 0.1)" />
                    <XAxis dataKey="plaka" stroke="rgba(235, 235, 245, 0.5)" style={{ fontSize: '12px' }} />
                    <YAxis stroke="rgba(235, 235, 245, 0.5)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(28, 28, 30, 0.95)',
                        border: '0.5px solid rgba(235, 235, 245, 0.2)',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Gelir" fill="#30D158" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="totalProfit" name="Kar" fill="#0A84FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Customer Performance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6"
                id="customer-distribution-chart"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
                      Müşteri Dağılımı
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                      En çok iş yapılan müşteriler
                    </p>
                  </div>
                  <ChartExportControls chartId="customer-distribution-chart" chartTitle="Müşteri Dağılımı" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={report.byCustomer?.slice(0, 6) || []}
                      dataKey="total"
                      nameKey="musteri"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => entry.musteri}
                    >
                      {(report.byCustomer || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(28, 28, 30, 0.95)',
                        border: '0.5px solid rgba(235, 235, 245, 0.2)',
                        borderRadius: '12px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                <Truck className="w-5 h-5 inline mr-2" />
                Araç Detayları
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <th className="text-left py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Plaka</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sipariş</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Gelir</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Kar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.byVehicle || []).map((v: any, idx: number) => (
                      <tr key={idx} className="border-b" style={{ borderColor: 'rgba(235, 235, 245, 0.05)' }}>
                        <td className="py-2 text-sm" style={{ color: '#FFFFFF' }}>{v.plaka}</td>
                        <td className="py-2 text-sm text-right" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>{v.count}</td>
                        <td className="py-2 text-sm text-right" style={{ color: '#30D158' }}>{formatCurrency(v.total)}</td>
                        <td className="py-2 text-sm text-right" style={{ color: v.totalProfit >= 0 ? '#0A84FF' : '#FF453A' }}>
                          {formatCurrency(v.totalProfit || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Customer Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>
                <Users className="w-5 h-5 inline mr-2" />
                Müşteri Detayları
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(235, 235, 245, 0.1)' }}>
                      <th className="text-left py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Müşteri</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Sipariş</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Gelir</th>
                      <th className="text-right py-2 text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Ort.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.byCustomer || []).slice(0, 10).map((c: any, idx: number) => (
                      <tr key={idx} className="border-b" style={{ borderColor: 'rgba(235, 235, 245, 0.05)' }}>
                        <td className="py-2 text-sm" style={{ color: '#FFFFFF' }}>{c.musteri}</td>
                        <td className="py-2 text-sm text-right" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>{c.count}</td>
                        <td className="py-2 text-sm text-right" style={{ color: '#30D158' }}>{formatCurrency(c.total)}</td>
                        <td className="py-2 text-sm text-right" style={{ color: '#0A84FF' }}>
                          {formatCurrency(c.total / c.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}

