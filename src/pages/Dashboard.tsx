import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package,
  Activity,
  Calendar
} from 'lucide-react'
import StatCard from '../components/StatCard'
import EarningsChart from '../components/EarningsChart'
import VehiclePerformance from '../components/VehiclePerformance'
import StatusOverview from '../components/StatusOverview'
import UpcomingDeliveries from '../components/UpcomingDeliveries'
import QuickActions from '../components/QuickActions'
import CostCalculator from '../components/CostCalculator'
import { formatCurrency } from '../utils/formatters'

interface DashboardStats {
  // Temel istatistikler
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalVehicles: number
  
  // Mali veriler
  monthlyEarnings: number
  monthlyExpenses: number
  monthlyEstimatedCosts: number
  monthlyNetIncome: number
  
  // Trend verileri
  earningsTrend: number
  expensesTrend: number
  ordersTrend: number
  netIncomeTrend: number
  
  // Grafikler için veriler
  dailyData: Array<{
    date: string
    orders: number
    earnings: number
    costs: number
  }>
  weeklyData: Array<{
    date: string
    orders: number
    earnings: number
    costs: number
  }>
  topVehicles: Array<{
    plaka: string
    orderCount: number
    totalEarnings: number
    totalCosts: number
    totalProfit: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    totalValue: number
  }>
  
  // Listeler
  upcomingDeliveries: any[]
  recentOrders: any[]
  
  // Geçen ay karşılaştırma
  lastMonthEarnings: number
  lastMonthExpenses: number
  lastMonthNetIncome: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    loadStats()
    setGreeting(getGreeting())
  }, [])

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.db.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi günler'
    return 'İyi akşamlar'
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
            Dashboard yükleniyor...
          </p>
        </motion.div>
      </div>
    )
  }

  // Güncel tarih ve zaman
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Hero Header with Animated Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15) 0%, rgba(48, 209, 88, 0.15) 100%)',
          border: '0.5px solid rgba(10, 132, 255, 0.3)',
        }}
      >
        {/* Animated background circles */}
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-64 h-40 sm:h-64 bg-green-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              {greeting} 👋
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-1" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>
              İşletmenizin anlık durumu
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }} />
              <p className="text-xs sm:text-sm" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                {currentDate}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Stats Grid - Animated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Sipariş"
          value={stats?.totalOrders || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          trend={{
            value: stats?.ordersTrend || 0,
            isPositive: (stats?.ordersTrend || 0) >= 0,
          }}
          loading={loading}
        />
        <StatCard
          title="Aktif Teslimat"
          value={stats?.activeOrders || 0}
          icon={<Truck className="w-6 h-6" />}
          color="yellow"
          subtitle="Bekliyor ve Yolda"
          loading={loading}
        />
        <StatCard
          title="Tamamlanan"
          value={stats?.completedOrders || 0}
          icon={<Activity className="w-6 h-6" />}
          color="green"
          subtitle="Teslim edildi"
          loading={loading}
        />
        <StatCard
          title="Aktif Araç"
          value={stats?.totalVehicles || 0}
          icon={<Truck className="w-6 h-6" />}
          color="purple"
          subtitle="Kayıtlı araçlar"
          loading={loading}
        />
      </div>

      {/* Financial Overview - Big Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
          style={{ background: 'rgba(48, 209, 88, 0.12)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#30D158' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#30D158' }} />
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#30D158' }}>
                Bu Ay Gelir
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: stats?.earningsTrend >= 0 ? '#30D158' : '#FF453A' }} />
              <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                {stats?.earningsTrend >= 0 ? '+' : ''}{stats?.earningsTrend.toFixed(1)}% geçen aya göre
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
          style={{ background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#FF453A' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#FF453A' }} />
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#FF453A' }}>
                Bu Ay Gider
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency((stats?.monthlyExpenses || 0) + (stats?.monthlyEstimatedCosts || 0))}
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Ek + Tahmini maliyetler
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
          style={{ background: 'rgba(10, 132, 255, 0.12)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#0A84FF' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0A84FF' }} />
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#0A84FF' }}>
                Net Kar
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {formatCurrency(stats?.monthlyNetIncome || 0)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3" style={{ color: stats?.netIncomeTrend >= 0 ? '#30D158' : '#FF453A' }} />
              <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                {stats?.netIncomeTrend >= 0 ? '+' : ''}{stats?.netIncomeTrend.toFixed(1)}% geçen aya göre
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden"
          style={{ background: 'rgba(191, 90, 242, 0.12)', border: '0.5px solid rgba(191, 90, 242, 0.3)' }}
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#BF5AF2' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#BF5AF2' }} />
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: '#BF5AF2' }}>
                Kar Marjı
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#FFFFFF' }}>
              {stats?.monthlyEarnings > 0 
                ? `%${((stats?.monthlyNetIncome / stats?.monthlyEarnings) * 100).toFixed(1)}`
                : '%0'
              }
            </p>
            <p className="text-[10px] sm:text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
              Karlılık oranı
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <EarningsChart
            data={stats?.dailyData || []}
            title="Son 30 Gün Gelir-Gider Analizi"
            height={350}
          />
        </div>
        <div>
          <StatusOverview data={stats?.statusDistribution || []} />
        </div>
      </div>

      {/* Masraf Hesaplama ve Aktif Teslimatlar - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CostCalculator />
        <UpcomingDeliveries orders={stats?.upcomingDeliveries || []} />
      </div>

      {/* Bottom Section - Vehicle Performance & Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <VehiclePerformance vehicles={stats?.topVehicles || []} />
        <UpcomingDeliveries orders={stats?.upcomingDeliveries || []} />
      </div>
    </div>
  )
}

