import { useState, useRef, forwardRef } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Download } from 'lucide-react'
import Button from '../components/Button'

// Dashboard Components
import EarningsChart from '../components/EarningsChart'
import StatusOverview from '../components/StatusOverview'
import VehiclePerformance from '../components/VehiclePerformance'
import UpcomingDeliveries from '../components/UpcomingDeliveries'
import QuickActions from '../components/QuickActions'
import StatCard from '../components/StatCard'
import { DollarSign, TrendingUp, Truck, Package, Activity, Calendar, BarChart3 } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

// Mock data
const mockChartData = [
  { date: '2024-01-01', earnings: 50000, costs: 30000, orders: 10 },
  { date: '2024-01-02', earnings: 55000, costs: 32000, orders: 12 },
  { date: '2024-01-03', earnings: 60000, costs: 35000, orders: 15 },
  { date: '2024-01-04', earnings: 58000, costs: 33000, orders: 14 },
  { date: '2024-01-05', earnings: 62000, costs: 36000, orders: 16 },
  { date: '2024-01-06', earnings: 65000, costs: 38000, orders: 18 },
  { date: '2024-01-07', earnings: 70000, costs: 40000, orders: 20 },
]

const mockStatusData = [
  { status: 'Bekliyor', count: 50, totalValue: 500000 },
  { status: 'Yolda', count: 21, totalValue: 210000 },
  { status: 'Teslim Edildi', count: 25, totalValue: 250000 },
  { status: 'İptal', count: 15, totalValue: 150000 },
]

const mockVehicles = [
  { plaka: '06 AZ 201', orderCount: 25, totalEarnings: 250000, totalCosts: 200000, totalProfit: 50000 },
  { plaka: '16 RP 364', orderCount: 20, totalEarnings: 200000, totalCosts: 160000, totalProfit: 40000 },
  { plaka: '14 DL 201', orderCount: 18, totalEarnings: 180000, totalCosts: 144000, totalProfit: 36000 },
  { plaka: '35 RJ 750', orderCount: 15, totalEarnings: 150000, totalCosts: 120000, totalProfit: 30000 },
]

const mockOrders = [
  { id: 1, plaka: '38 DT 431', musteri: 'ABC Lojistik', nereden: 'Kayseri', nereye: 'Malatya', status: 'Bekliyor', created_at: '2024-01-15T10:00:00' },
  { id: 2, plaka: '06 TK 507', musteri: 'XYZ Nakliyat', nereden: 'Ankara', nereye: 'İstanbul', status: 'Yolda', created_at: '2024-01-15T11:00:00' },
  { id: 3, plaka: '06 AZ 201', musteri: 'DEF Taşımacılık', nereden: 'İzmir', nereye: 'Bursa', status: 'Bekliyor', created_at: '2024-01-15T12:00:00' },
  { id: 4, plaka: '35 FV 801', musteri: 'GHI Lojistik', nereden: 'Antalya', nereye: 'Adana', status: 'Yolda', created_at: '2024-01-15T13:00:00' },
  { id: 5, plaka: '42 KE 680', musteri: 'JKL Nakliyat', nereden: 'Gaziantep', nereye: 'Şanlıurfa', status: 'Bekliyor', created_at: '2024-01-15T14:00:00' },
]

interface ComponentShowcaseProps {
  title: string
  description: string
  children: React.ReactNode
}

const ComponentShowcase = forwardRef<HTMLDivElement, ComponentShowcaseProps>(
  ({ title, description, children }, ref) => {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
      if (!ref || typeof ref === 'function' || !ref.current) return

      setIsDownloading(true)
      try {
        const canvas = await html2canvas(ref.current, {
          backgroundColor: null, // Şeffaf arka plan
          scale: 2,
          logging: false,
          useCORS: true,
          removeContainer: true,
        })

        const link = document.createElement('a')
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch (error) {
        console.error('Screenshot alınamadı:', error)
      } finally {
        setIsDownloading(false)
      }
    }

    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-black">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          <Button
            size="md"
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'İndiriliyor...' : 'PNG İndir'}
          </Button>
        </div>
        <div ref={ref} style={{ backgroundColor: 'transparent' }}>
          {children}
        </div>
      </div>
    )
  }
)

ComponentShowcase.displayName = 'ComponentShowcase'

export default function DesignComponents() {
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  // Ref'ler
  const earningsChartRef = useRef<HTMLDivElement>(null)
  const statusOverviewRef = useRef<HTMLDivElement>(null)
  const vehiclePerformanceRef = useRef<HTMLDivElement>(null)
  const upcomingDeliveriesRef = useRef<HTMLDivElement>(null)
  const quickActionsRef = useRef<HTMLDivElement>(null)
  const statCardsRef = useRef<HTMLDivElement>(null)
  const costBreakdownRef = useRef<HTMLDivElement>(null)

  const downloadAll = async () => {
    setIsDownloadingAll(true)
    const sections = [
      { ref: statCardsRef, name: 'StatCards' },
      { ref: earningsChartRef, name: 'EarningsChart' },
      { ref: statusOverviewRef, name: 'StatusOverview' },
      { ref: vehiclePerformanceRef, name: 'VehiclePerformance' },
      { ref: upcomingDeliveriesRef, name: 'UpcomingDeliveries' },
      { ref: quickActionsRef, name: 'QuickActions' },
      { ref: costBreakdownRef, name: 'CostBreakdown' },
    ]

    for (const section of sections) {
      if (section.ref.current) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          const canvas = await html2canvas(section.ref.current, {
            backgroundColor: null, // Şeffaf arka plan
            scale: 2,
            logging: false,
            useCORS: true,
            removeContainer: true,
          })

          const link = document.createElement('a')
          link.download = `${section.name.toLowerCase()}.png`
          link.href = canvas.toDataURL('image/png')
          link.click()
        } catch (error) {
          console.error(`${section.name} indirilemedi:`, error)
        }
      }
    }
    setIsDownloadingAll(false)
  }

  return (
    <div
      className="space-y-12 pb-12 min-h-screen"
      style={{
        backgroundColor: '#ffffff',
        padding: '3rem',
        color: '#000000'
      }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-2 text-black">
            Design System - Büyük Componentlar
          </h1>
          <p className="text-xl text-gray-600">
            Tüm büyük componentlar - PNG olarak indirilebilir (şeffaf arka plan)
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={downloadAll}
          disabled={isDownloadingAll}
        >
          <Download className="w-5 h-5 mr-2" />
          {isDownloadingAll ? 'Tümü İndiriliyor...' : 'Tümünü İndir (PNG)'}
        </Button>
      </div>

      {/* Stat Cards Grid */}
      <ComponentShowcase
        ref={statCardsRef}
        title="Stat Cards Grid"
        description="Dashboard istatistik kartları - 4'lü grid layout"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Gelir"
            value={formatCurrency(188232.79)}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Toplam Gider"
            value={formatCurrency(167287.29)}
            icon={<TrendingUp className="w-6 h-6" />}
            color="red"
            trend={{ value: 8.3, isPositive: false }}
          />
          <StatCard
            title="Net Gelir"
            value={formatCurrency(20945.50)}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
            trend={{ value: 23.7, isPositive: true }}
          />
          <StatCard
            title="Kar Marjı"
            value="%23.7"
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
            trend={{ value: 5.2, isPositive: true }}
          />
        </div>
      </ComponentShowcase>

      {/* Earnings Chart */}
      <ComponentShowcase
        ref={earningsChartRef}
        title="Earnings Chart"
        description="Gelir-Gider analiz grafiği - Son 30 günlük trend"
      >
        <EarningsChart
          data={mockChartData}
          title="Son 30 Günlük Gider Analizi"
          height={400}
        />
      </ComponentShowcase>

      {/* Status Overview */}
      <ComponentShowcase
        ref={statusOverviewRef}
        title="Status Overview"
        description="Sipariş durumu dağılımı - Pasta grafiği ve istatistikler"
      >
        <StatusOverview data={mockStatusData} />
      </ComponentShowcase>

      {/* Vehicle Performance */}
      <ComponentShowcase
        ref={vehiclePerformanceRef}
        title="Vehicle Performance"
        description="En çok çalışan araçlar listesi - Kar marjı ve performans göstergeleri"
      >
        <VehiclePerformance vehicles={mockVehicles} />
      </ComponentShowcase>

      {/* Upcoming Deliveries */}
      <ComponentShowcase
        ref={upcomingDeliveriesRef}
        title="Upcoming Deliveries"
        description="Aktif teslimatlar listesi - Sipariş kartları ve durum bilgileri"
      >
        <UpcomingDeliveries orders={mockOrders} />
      </ComponentShowcase>

      {/* Quick Actions */}
      <ComponentShowcase
        ref={quickActionsRef}
        title="Quick Actions"
        description="Hızlı erişim butonları grid'i - 6'lı grid layout"
      >
        <QuickActions />
      </ComponentShowcase>

      {/* Cost Breakdown - Masraf Hesaplama */}
      <ComponentShowcase
        ref={costBreakdownRef}
        title="Cost Breakdown - Masraf Hesaplama"
        description="Detaylı maliyet analizi componenti - Yakıt, sürücü, HGS, bakım maliyetleri"
      >
        <div className="glass-card rounded-xl p-8" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Maliyet Analizi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', border: '1px solid rgba(48, 209, 88, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>Yakıt Maliyeti</span>
                <span className="text-lg font-bold" style={{ color: '#30D158' }}>₺12.500,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>312.5 lt × ₺40,00</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 132, 255, 0.15)', border: '1px solid rgba(10, 132, 255, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>Sürücü Ücreti</span>
                <span className="text-lg font-bold" style={{ color: '#0A84FF' }}>₺4.800,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>3 gün × ₺1.600,00</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 159, 10, 0.15)', border: '1px solid rgba(255, 159, 10, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>Yemek & Konaklama</span>
                <span className="text-lg font-bold" style={{ color: '#FF9F0A' }}>₺450,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>3 gün × ₺150,00</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)', border: '1px solid rgba(191, 90, 242, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>HGS & Köprü</span>
                <span className="text-lg font-bold" style={{ color: '#BF5AF2' }}>₺850,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>1250 km güzergah</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 69, 58, 0.15)', border: '1px solid rgba(255, 69, 58, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>Bakım & Onarım</span>
                <span className="text-lg font-bold" style={{ color: '#FF453A' }}>₺1.200,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yağ, lastik, genel bakım</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(100, 200, 255, 0.15)', border: '1px solid rgba(100, 200, 255, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.8)' }}>Sigorta & Vergi</span>
                <span className="text-lg font-bold" style={{ color: '#64C8FF' }}>₺450,00</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Günlük pay</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Toplam Maliyet</span>
              <span className="text-3xl font-bold" style={{ color: '#FF453A' }}>₺20.250,00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>Müşteri Ödemesi</span>
              <span className="text-3xl font-bold" style={{ color: '#30D158' }}>₺35.000,00</span>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Net Kar</span>
                <span className="text-4xl font-bold" style={{ color: '#30D158' }}>₺14.750,00</span>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>
                  Kar Marjı: %42.1
                </span>
              </div>
            </div>
          </div>
        </div>
      </ComponentShowcase>
    </div>
  )
}
