import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
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
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import Card from '../components/Card'
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
  ArcElement
)

export default function ChartsPage() {
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    try {
      setLoading(true)
      // Son 6 ayın verilerini çek
      const currentDate = new Date()
      const months = []
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const report = await window.electronAPI.db.getMonthlyReport(date.getFullYear(), date.getMonth() + 1)
        months.push({
          label: date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          earnings: report.earnings,
          costs: report.estimatedCosts || 0,
          expenses: report.expenses,
          profit: report.netIncome,
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
        tension: 0.3,
      },
      {
        label: 'Maliyet',
        data: monthlyData.map((m: any) => m.costs),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Ek Gider',
        data: monthlyData.map((m: any) => m.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
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
          m.profit >= 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)'
        ),
        borderColor: monthlyData.map((m: any) => 
          m.profit >= 0 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
        ),
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#BF5AF2' }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
            Grafik Raporlar
          </h1>
        </div>
        <p className="text-lg ml-16" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
          Son 6 aylık performans analizi
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelir-Gider Trend */}
        <Card title="📈 Gelir-Gider Trendi">
          <div className="h-80">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatCurrency(Number(value))
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Kar/Zarar Grafiği */}
        <Card title="💰 Aylık Kar/Zarar">
          <div className="h-80">
            <Bar
              data={profitData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `Kar/Zarar: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => formatCurrency(Number(value))
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

