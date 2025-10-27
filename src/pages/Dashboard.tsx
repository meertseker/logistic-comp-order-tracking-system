import React, { useEffect, useState } from 'react'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0A84FF' }}></div>
          <p className="mt-4" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Hoş Geldiniz</h1>
          <p className="mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>İşletmenizin genel görünümü</p>
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
        <Card style={{ background: 'rgba(48, 209, 88, 0.15)', border: '0.5px solid rgba(48, 209, 88, 0.3)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: '#30D158' }}>Bu Ay Gelir</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF' }}>
              {formatCurrency(stats?.monthlyEarnings || 0)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Müşterilerden alınan</p>
          </div>
        </Card>
        <Card style={{ background: 'rgba(255, 69, 58, 0.15)', border: '0.5px solid rgba(255, 69, 58, 0.3)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: '#FF453A' }}>Bu Ay Gider (Ek)</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF' }}>
              {formatCurrency(stats?.monthlyExpenses || 0)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Eklenen giderler</p>
          </div>
        </Card>
        <Card style={{ background: 'rgba(255, 159, 10, 0.15)', border: '0.5px solid rgba(255, 159, 10, 0.3)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: '#FF9F0A' }}>Bu Ay Tahmini Gider</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF' }}>
              {formatCurrency(stats?.monthlyEstimatedCosts || 0)}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Hesaplanan maliyet</p>
          </div>
        </Card>
        <Card style={{ background: 'rgba(10, 132, 255, 0.15)', border: '0.5px solid rgba(10, 132, 255, 0.3)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: '#0A84FF' }}>Net Kar/Zarar</p>
            <p className="text-2xl font-bold mt-2" style={{ color: '#FFFFFF' }}>
              {formatCurrency((stats?.monthlyEarnings || 0) - (stats?.monthlyExpenses || 0) - (stats?.monthlyEstimatedCosts || 0))}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Tahmini net</p>
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
                  <tr key={order.id}>
                    <td style={{ color: '#FFFFFF', fontWeight: 500 }}>{order.plaka}</td>
                    <td style={{ color: '#FFFFFF' }}>{order.musteri}</td>
                    <td style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
                      {order.nereden} → {order.nereye}
                    </td>
                    <td style={{ color: '#FFFFFF', fontWeight: 500 }}>
                      {formatCurrency(order.baslangic_fiyati)}
                    </td>
                    <td>
                      <span className="px-2 py-1 text-xs rounded-full" style={getStatusStyle(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TruckIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(235, 235, 245, 0.3)' }} />
            <p style={{ color: 'rgba(235, 235, 245, 0.6)' }}>Henüz sipariş bulunmuyor</p>
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

function getStatusStyle(status: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    'Bekliyor': { backgroundColor: 'rgba(255, 214, 10, 0.2)', color: '#FFD60A' },
    'Yolda': { backgroundColor: 'rgba(10, 132, 255, 0.2)', color: '#0A84FF' },
    'Teslim Edildi': { backgroundColor: 'rgba(48, 209, 88, 0.2)', color: '#30D158' },
    'Faturalandı': { backgroundColor: 'rgba(191, 90, 242, 0.2)', color: '#BF5AF2' },
    'İptal': { backgroundColor: 'rgba(255, 69, 58, 0.2)', color: '#FF453A' },
  }
  return styles[status] || { backgroundColor: 'rgba(235, 235, 245, 0.2)', color: 'rgba(235, 235, 245, 0.6)' }
}

