import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, Layers, Maximize2 } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import DateRangePicker, { DateRange } from '../components/DateRangePicker'
import ChartExportControls from '../components/ChartExportControls'
import Button from '../components/Button'
import { formatCurrency } from '../utils/formatters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
)

export default function ChartsProfessional() {
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'mixed'>('line')
  const [fullscreenChart, setFullscreenChart] = useState<string | null>(null)
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Son 6 Ay'
  })

  useEffect(() => {
    loadChartData()
  }, [dateRange])

  const loadChartData = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const months = []
      
      // Son 6 ayın verilerini çek
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const report = await window.electronAPI.db.getMonthlyReport(date.getFullYear(), date.getMonth() + 1)
        months.push({
          label: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          fullLabel: date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
          earnings: report.earnings,
          costs: report.estimatedCosts || 0,
          expenses: report.expenses,
          profit: report.netIncome,
          orderCount: report.byStatus?.reduce((sum: number, s: any) => sum + s.count, 0) || 0,
          vehicleData: report.byVehicle || [],
          customerData: report.byCustomer || []
        })
      }

      setMonthlyData(months)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setLoading(false)
    }
  }

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
            Grafikler yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  if (!monthlyData) return null

  // Gelir-Gider Trend Grafiği (Çizgi)
  const trendData = {
    labels: monthlyData.map((m: any) => m.label),
    datasets: [
      {
        label: 'Gelir',
        data: monthlyData.map((m: any) => m.earnings),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Maliyet',
        data: monthlyData.map((m: any) => m.costs),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Ek Gider',
        data: monthlyData.map((m: any) => m.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
    ],
  }

  // Kar Grafiği (Bar)
  const profitData = {
    labels: monthlyData.map((m: any) => m.label),
    datasets: [
      {
        label: 'Net Kar/Zarar',
        data: monthlyData.map((m: any) => m.profit),
        backgroundColor: monthlyData.map((m: any) => 
          m.profit >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: monthlyData.map((m: any) => 
          m.profit >= 0 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Sipariş Sayısı Grafiği
  const orderCountData = {
    labels: monthlyData.map((m: any) => m.label),
    datasets: [
      {
        label: 'Sipariş Sayısı',
        data: monthlyData.map((m: any) => m.orderCount),
        backgroundColor: 'rgba(191, 90, 242, 0.8)',
        borderColor: 'rgb(191, 90, 242)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Kar Marjı Pie Chart
  const profitMarginData = {
    labels: monthlyData.map((m: any) => m.fullLabel),
    datasets: [
      {
        label: 'Kar Marjı',
        data: monthlyData.map((m: any) => m.earnings > 0 ? ((m.profit / m.earnings) * 100).toFixed(1) : 0),
        backgroundColor: [
          'rgba(10, 132, 255, 0.8)',
          'rgba(48, 209, 88, 0.8)',
          'rgba(255, 69, 58, 0.8)',
          'rgba(255, 159, 10, 0.8)',
          'rgba(191, 90, 242, 0.8)',
          'rgba(90, 200, 250, 0.8)',
        ],
        borderColor: [
          'rgb(10, 132, 255)',
          'rgb(48, 209, 88)',
          'rgb(255, 69, 58)',
          'rgb(255, 159, 10)',
          'rgb(191, 90, 242)',
          'rgb(90, 200, 250)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Gelir Kaynakları ve Performans Radar grafikleri kaldırıldı - veri hazırlığına gerek yok

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(235, 235, 245, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: 'rgba(235, 235, 245, 0.8)',
        borderColor: 'rgba(235, 235, 245, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed
            return `${label}: ${typeof value === 'number' ? formatCurrency(value) : value}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(235, 235, 245, 0.05)',
        },
        ticks: {
          color: 'rgba(235, 235, 245, 0.6)',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(235, 235, 245, 0.05)',
        },
        ticks: {
          color: 'rgba(235, 235, 245, 0.6)',
          callback: (value: any) => formatCurrency(Number(value))
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(235, 235, 245, 0.8)',
          font: {
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        titleColor: '#FFFFFF',
        bodyColor: 'rgba(235, 235, 245, 0.8)',
        borderColor: 'rgba(235, 235, 245, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    }
  }


  const ChartCard = ({ title, description, chartId, children, icon: Icon }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 relative"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="w-5 h-5" style={{ color: '#0A84FF' }} />}
            <h3 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFullscreenChart(chartId)}
            className="p-2 rounded-lg transition-all"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '0.5px solid rgba(99, 102, 241, 0.3)',
            }}
            title="Tam Ekran"
          >
            <Maximize2 className="w-4 h-4" style={{ color: '#6366F1' }} />
          </motion.button>
          <ChartExportControls chartId={chartId} chartTitle={title} />
        </div>
      </div>
      <div id={chartId}>
        {children}
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(191, 90, 242, 0.15)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#BF5AF2' }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Profesyonel Grafikler
          </h1>
        </div>
        <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          İnteraktif ve detaylı performans analizi
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            showPresets
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'primary' : 'secondary'}
              onClick={() => setChartType('line')}
            >
              Çizgi Grafik
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'primary' : 'secondary'}
              onClick={() => setChartType('bar')}
            >
              Bar Grafik
            </Button>
            <Button
              size="sm"
              variant={chartType === 'mixed' ? 'primary' : 'secondary'}
              onClick={() => setChartType('mixed')}
            >
              Karma
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelir-Gider Trend */}
        <ChartCard 
          title="Gelir-Gider Trendi" 
          description="Aylık gelir ve gider karşılaştırması"
          chartId="revenue-trend-chart"
          icon={TrendingUp}
        >
          <div className="h-80">
            {chartType === 'line' && <Line data={trendData} options={chartOptions} />}
            {chartType === 'bar' && <Bar data={trendData} options={chartOptions} />}
            {chartType === 'mixed' && <Line data={trendData} options={chartOptions} />}
          </div>
        </ChartCard>

        {/* Kar/Zarar Grafiği */}
        <ChartCard 
          title="Aylık Kar/Zarar"
          description="Net kar ve zarar analizi"
          chartId="profit-chart"
          icon={Activity}
        >
          <div className="h-80">
            <Bar data={profitData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: false
                }
              }
            }} />
          </div>
        </ChartCard>

        {/* Sipariş Sayısı */}
        <ChartCard 
          title="Sipariş Sayısı Trendi"
          description="Aylık sipariş hacmi"
          chartId="order-count-chart"
          icon={Layers}
        >
          <div className="h-80">
            <Bar data={orderCountData} options={chartOptions} />
          </div>
        </ChartCard>

        {/* Kar Marjı Pie */}
        <ChartCard 
          title="Kar Marjı Dağılımı"
          description="Aylara göre kar marjı yüzdeleri"
          chartId="profit-margin-pie"
          icon={PieIcon}
        >
          <div className="h-80">
            <Pie data={profitMarginData} options={pieOptions} />
          </div>
        </ChartCard>
        
        {/* Gelir Kaynakları ve Performans Radar grafikleri kaldırıldı */}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
            onClick={() => setFullscreenChart(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass-card rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                  {fullscreenChart}
                </h3>
                <Button onClick={() => setFullscreenChart(null)} variant="secondary" size="sm">
                  Kapat
                </Button>
              </div>
              <div className="h-[70vh]">
                {/* Render the fullscreen chart here */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

