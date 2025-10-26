import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { TruckIcon, ChartBarIcon, CurrencyDollarIcon, PlusIcon } from '../components/Icons'
import { formatCurrency, formatDate } from '../utils/formatters'

interface DashboardStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  monthlyEarnings: number
  monthlyExpenses: number
  monthlyNetIncome: number
  recentOrders: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hoş Geldiniz</h1>
          <p className="mt-1 text-gray-600">İşletmenizin genel görünümü</p>
        </div>
        <Link to="/orders/new">
          <Button>
            <PlusIcon className="w-5 h-5 mr-2" />
            Yeni Sipariş
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Sipariş"
          value={stats?.totalOrders || 0}
          icon={<TruckIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Aktif Sipariş"
          value={stats?.activeOrders || 0}
          icon={<TruckIcon className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Tamamlanan"
          value={stats?.completedOrders || 0}
          icon={<TruckIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Bu Ay Kazanç"
          value={formatCurrency(stats?.monthlyEarnings || 0)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Monthly Summary - Geliştirilmiş */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div>
            <p className="text-xs font-medium text-green-800">Bu Ay Gelir</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </p>
            <p className="text-xs text-green-700 mt-1">Müşterilerden alınan</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div>
            <p className="text-xs font-medium text-red-800">Bu Ay Gider (Ek)</p>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {formatCurrency(stats?.monthlyExpenses || 0)}
            </p>
            <p className="text-xs text-red-700 mt-1">Eklenen giderler</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div>
            <p className="text-xs font-medium text-orange-800">Bu Ay Tahmini Gider</p>
            <p className="text-2xl font-bold text-orange-900 mt-2">
              {formatCurrency(stats?.monthlyEstimatedCosts || 0)}
            </p>
            <p className="text-xs text-orange-700 mt-1">Hesaplanan maliyet</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div>
            <p className="text-xs font-medium text-blue-800">Net Kar/Zarar</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {formatCurrency((stats?.monthlyEarnings || 0) - (stats?.monthlyExpenses || 0) - (stats?.monthlyEstimatedCosts || 0))}
            </p>
            <p className="text-xs text-blue-700 mt-1">Tahmini net</p>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card title="Son Siparişler" actions={
        <Link to="/orders">
          <Button variant="secondary" size="sm">
            Tümünü Gör
          </Button>
        </Link>
      }>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plaka</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Güzergah</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fiyat</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{order.plaka}</td>
                    <td className="py-3 px-4">{order.musteri}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.nereden} → {order.nereye}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(order.baslangic_fiyati)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TruckIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz sipariş bulunmuyor</p>
            <Link to="/orders/new">
              <Button className="mt-4" size="sm">
                İlk Siparişi Oluştur
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Bekliyor': 'bg-yellow-100 text-yellow-800',
    'Yolda': 'bg-blue-100 text-blue-800',
    'Teslim Edildi': 'bg-green-100 text-green-800',
    'Faturalandı': 'bg-purple-100 text-purple-800',
    'İptal': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

